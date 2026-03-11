import { motion } from "framer-motion";

const stats = [
  { value: "18", label: "Kargo Firması" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<150ms", label: "Yanıt Süresi" },
  { value: "REST", label: "JSON API" },
];

const StatsSection = () => (
  <section className="py-20 border-t border-border/30">
    <div className="max-w-5xl mx-auto px-8 lg:px-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-[20px] overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="px-8 py-10 bg-background"
          >
            <div className="text-[42px] font-light tracking-[-2px] text-foreground mb-1.5">{s.value}</div>
            <div className="text-[13px] text-muted-foreground/60">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
