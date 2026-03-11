#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# VDS: /home/yayla/kargo-api/app.py

import subprocess, sys
for p in ["flask", "flask_cors", "firebase_admin", "pytz", "cloudscraper", "bs4"]:
    try: __import__(p)
    except: subprocess.check_call([sys.executable, "-m", "pip", "install", p.replace("_", "-")])

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import datetime, pytz, cloudscraper
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

# Firebase - serviceAccount.json VDS'e koy
cred = credentials.Certificate("/home/yayla/kargo-api/serviceAccount.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

def tr_time():
    return datetime.datetime.now(pytz.timezone("Europe/Istanbul"))

def get_user(key):
    docs = db.collection("users").where("apiKey", "==", key).limit(1).get()
    for d in docs: return d.id, d.to_dict()
    return None, None

def deduct(uid, ud, amt=1):
    f, p = ud.get("freeCredits", 0), ud.get("proCredits", 0)
    if f >= amt:
        db.collection("users").document(uid).update({"freeCredits": f - amt})
        return True
    elif p >= amt:
        db.collection("users").document(uid).update({"proCredits": p - amt})
        return True
    return False

def log(uid, email, action, details):
    db.collection("logs").add({"userId": uid, "userEmail": email, "action": action, "details": details, "timestamp": tr_time().isoformat(), "ip": request.remote_addr})

def check_key(f):
    def w(*a, **k):
        key = request.headers.get("X-API-Key") or request.headers.get("x-api-key")
        if not key: return jsonify({"basari": False, "mesaj": "API-Key gerekli"}), 401
        uid, ud = get_user(key)
        if not ud: return jsonify({"basari": False, "mesaj": "Geçersiz API-Key"}), 401
        sub = ud.get("subscription", {})
        if sub.get("plan") == "pro":
            try:
                end = datetime.datetime.fromisoformat(sub.get("endDate", "").replace("Z", "+00:00"))
                if end < datetime.datetime.now(datetime.timezone.utc):
                    return jsonify({"basari": False, "mesaj": "Abonelik dolmuş"}), 403
            except: pass
        if ud.get("freeCredits", 0) <= 0 and ud.get("proCredits", 0) <= 0:
            return jsonify({"basari": False, "mesaj": "Kredi yok"}), 429
        request.uid, request.ud = uid, ud
        return f(*a, **k)
    w.__name__ = f.__name__
    return w

def kargo_sor(no, c):
    try:
        s = cloudscraper.create_scraper(browser={"browser":"chrome","platform":"windows","mobile":False}, delay=10)
        r = s.post(f"https://kargotakiptr.com/apiv2/{c}-sorgula.php", data={"takip_no": no, "carrier": c}, timeout=12)
        d = r.json()
        if not d.get("success"): return {"basari": False, "mesaj": "Bulunamadı"}
        soup = BeautifulSoup(d.get("html", ""), "html.parser")
        st = soup.select_one(".kt-result-status-text")
        return {"basari": True, "mesaj": st.text.strip() if st else "Bilinmiyor"}
    except Exception as e:
        return {"basari": False, "mesaj": str(e)}

@app.route("/api/v1/credits", methods=["GET"])
@check_key
def credits():
    return jsonify({"basari": True, "free": request.ud.get("freeCredits", 0), "pro": request.ud.get("proCredits", 0)})

@app.route("/api/v1/validate", methods=["GET"])
@check_key
def validate():
    return jsonify({"basari": True, "email": request.ud.get("email"), "plan": request.ud.get("subscription", {}).get("plan", "free")})

@app.route("/v1/kargo/<c>/<no>", methods=["GET"])
@check_key
def kargo(c, no):
    if not deduct(request.uid, request.ud): return jsonify({"basari": False, "mesaj": "Kredi yok"}), 429
    log(request.uid, request.ud.get("email"), "kargo", f"{c}:{no}")
    return jsonify(kargo_sor(no, c))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=47291)
