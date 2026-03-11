import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, text, html, smtp } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing required fields: to, subject' });
    }

    if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
      return res.status(400).json({ error: 'Missing SMTP configuration' });
    }

    // Port ayarla - 465 için secure true, diğerleri için false
    const port = parseInt(smtp.port || '587');
    const isSecure = port === 465;

    const smtpConfig = {
      host: smtp.host,
      port: port,
      secure: isSecure,
      auth: {
        user: smtp.user,
        pass: smtp.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    const fromEmail = smtp.from || smtp.user;

    console.log('Sending email via:', smtp.host, 'port:', port);

    const transporter = nodemailer.createTransport(smtpConfig);

    // Verify connection
    await transporter.verify();

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text: text || '',
      html: html || (text ? text.replace(/\n/g, '<br>') : '')
    });

    console.log('Email sent:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to send email',
      code: error.code,
      details: error.response || null
    });
  }
}
