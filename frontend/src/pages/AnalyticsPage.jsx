import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`;

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardV = {
  hidden:  { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

function AnimCount({ to, suffix = "", dec = 0 }) {
  const ref  = useRef(null);
  const view = useInView(ref, { once: true });
  const mv   = useMotionValue(0);
  const sp   = useSpring(mv, { stiffness: 55, damping: 14 });
  const [val, setVal] = useState("0");

  useEffect(() => { if (view) mv.set(to); }, [view, to, mv]);
  useEffect(() => sp.on("change", v =>
    setVal(dec ? v.toFixed(dec) : Math.round(v).toString())), [sp, dec]);

  return <span ref={ref}>{val}{suffix}</span>;
}

const CTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
      padding: "9px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
      fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#334155",
    }}>
      <b style={{ fontWeight: 500 }}>
        {d.payload?.metric || d.name}: {d.value}
        {d.payload?.metric ? "" : " queries"}
      </b>
    </div>
  );
};

function LiveBadge() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ position:"relative", width:8, height:8 }}>
        <motion.div
          animate={{ scale:[1,2.4], opacity:[0.6,0] }}
          transition={{ duration:1.6, repeat:Infinity, ease:"easeOut" }}
          style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#10b981" }}
        />
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"#10b981" }} />
      </div>
      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#10b981", letterSpacing:"0.08em" }}>LIVE</span>
    </div>
  );
}

function StatCard({ label, value, suffix, dec, sub, subColor="#10b981", accent="#3b82f6", iconPath, featured }) {
  return (
    <motion.div
      variants={cardV}
      whileHover={{ y:-5, boxShadow:"0 20px 48px rgba(0,0,0,0.12)" }}
      transition={{ type:"spring", stiffness:280, damping:20 }}
      style={{
        background: featured
          ? "linear-gradient(135deg,#1e40af 0%,#2563eb 100%)"
          : "#fff",
        border: featured ? "none" : "1px solid #f1f5f9",
        borderRadius: 20, padding: "24px 26px",
        position: "relative", overflow: "hidden",
        boxShadow: featured
          ? "0 8px 32px rgba(29,78,216,0.28)"
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {featured && (
        <motion.div
          animate={{ x:["-100%","200%"] }}
          transition={{ duration:3, repeat:Infinity, repeatDelay:3.5, ease:"easeInOut" }}
          style={{
            position:"absolute", top:0, left:0, width:"40%", height:"100%",
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",
            pointerEvents:"none",
          }}
        />
      )}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500,
            letterSpacing:"0.08em", textTransform:"uppercase",
            color: featured ? "rgba(186,219,255,0.75)" : "#94a3b8", marginBottom:6,
          }}>{label}</p>
          <h2 style={{
            fontFamily:"'Playfair Display',serif", fontSize:38, fontWeight:700,
            color: featured ? "#fff" : "#0f172a", lineHeight:1,
          }}>
            <AnimCount to={value} suffix={suffix} dec={dec} />
          </h2>
        </div>
        <div style={{
          width:46, height:46, borderRadius:"50%",
          background: featured ? "rgba(255,255,255,0.18)" : accent+"18",
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={featured?"#fff":accent} strokeWidth="2" strokeLinecap="round">
            {iconPath}
          </svg>
        </div>
      </div>
      <p style={{
        fontFamily:"'DM Sans',sans-serif", fontSize:13, marginTop:14, fontWeight:500,
        color: featured ? "rgba(186,219,255,0.8)" : subColor,
      }}>{sub}</p>
    </motion.div>
  );
}

function ChartCard({ children, span2 }) {
  return (
    <motion.div
      variants={cardV}
      whileHover={{ boxShadow:"0 12px 36px rgba(0,0,0,0.08)" }}
      style={{
        background:"#fff", border:"1px solid #f1f5f9", borderRadius:24,
        padding:"26px 28px",
        boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
        ...(span2 ? { gridColumn:"span 2" } : {}),
      }}
    >
      {children}
    </motion.div>
  );
}

const ST = ({ children, sub }) => (
  <div style={{ marginBottom:18 }}>
    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:600, color:"#0f172a" }}>
      {children}
    </h3>
    {sub && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#94a3b8", marginTop:3 }}>{sub}</p>}
  </div>
);

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    triad: [
      { metric: "Faithfulness", score: 0 },
      { metric: "Relevance", score: 0 },
      { metric: "Correctness", score: 0 }
    ],
    audit: [
      { name: "Verified Safe", value: 0, color: "#059669" },
      { name: "Needs Review", value: 0, color: "#d97706" },
      { name: "Flagged Critical", value: 0, color: "#dc2626" }
    ],
    history: [],
    summary: { total: 0, faithfulness: 0, latency: 0 }
  });

  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const detailsRef = useRef(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token") || localStorage.getItem("token");
        const response = await fetch("${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/chat/evaluations/overall-stats", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        
        setStats({
          triad: [
            { metric: "Faithfulness", score: data.avg_faithfulness || 0 },
            { metric: "Relevance", score: data.avg_relevance || 0 },
            { metric: "Correctness", score: data.avg_correctness || 0 }
          ],
          audit: [
            { name: "Verified Safe", value: data.safe_count || 0, color: "#059669" },
            { name: "Needs Review", value: data.review_count || 0, color: "#d97706" },
            { name: "Flagged Critical", value: data.critical_count || 0, color: "#dc2626" }
          ],
          history: data.seven_day_history || [],
          summary: {
            total: data.total_audits || 0,
            faithfulness: data.avg_faithfulness || 0,
            latency: data.avg_latency || 0
          }
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePieClick = async (data) => {
    let statusParam = "";
    if (data.name === "Verified Safe") statusParam = "safe";
    else if (data.name === "Needs Review") statusParam = "review";
    else if (data.name === "Flagged Critical") statusParam = "critical";
    
    if (!statusParam) return;

    setLoadingDetails(true);
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/chat/evaluations/details?status=${statusParam}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch details");
      const detailsData = await response.json();
      
      setSelectedDetails({
        title: data.name,
        color: data.payload.fill,
        records: detailsData
      });
      
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <>
      <style>{FONT_IMPORT + `
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#f8fafc}
      `}</style>

      <div style={{
        minHeight:"100vh",
        background:"#f8fafc",
        backgroundImage:`
          radial-gradient(circle at 18% 18%, rgba(219,234,254,0.5) 0%, transparent 38%),
          radial-gradient(circle at 82% 82%, rgba(209,250,229,0.35) 0%, transparent 38%)
        `,
        padding:"36px 40px",
        fontFamily:"'DM Sans',sans-serif",
      }}>

        <motion.div
          initial={{ opacity:0, y:-22 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
          style={{ marginBottom:36 }}
        >
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ x: -4 }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "transparent", border: "none", color: "#64748b",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
                marginBottom: 12
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Dashboard
            </motion.button>
          </Link>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <motion.div
                initial={{ scale:0, rotate:-18 }}
                animate={{ scale:1, rotate:0 }}
                transition={{ delay:0.2, type:"spring", stiffness:220 }}
                style={{
                  width:46, height:46, borderRadius:13,
                  background:"linear-gradient(135deg,#1e40af,#3b82f6)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 4px 14px rgba(29,78,216,0.3)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z"/>
                  <path d="M8 12l2.8 2.8L16 9"/>
                </svg>
              </motion.div>
              <div>
                <h1 style={{
                  fontFamily:"'Playfair Display',serif",
                  fontSize:30, fontWeight:700, color:"#0f172a",
                  letterSpacing:"-0.02em", lineHeight:1,
                }}>
                  Live Audit Analytics
                </h1>
                <p style={{ fontSize:13, color:"#94a3b8", marginTop:3, fontWeight:300 }}>
                  Real-time performance monitoring · Curamind AI Engine
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ delay:0.5 }}
              style={{
                display:"flex", alignItems:"center", gap:16,
                background:"#fff", border:"1px solid #e2e8f0",
                borderRadius:12, padding:"10px 18px",
                boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <LiveBadge />
              <div style={{ width:1, height:18, background:"#e2e8f0" }} />
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#64748b" }}>
                Live Connected
              </span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:24 }}
        >
          <StatCard
            label="Total Audits" value={stats.summary.total} suffix="" sub="Verified across all sources"
            accent="#3b82f6"
            iconPath={<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>}
          />
          <StatCard
            label="Clinical Grounding" value={stats.summary.faithfulness} suffix="%" dec={1}
            sub="Aligned with PubMed & Trials" featured
            iconPath={<path d="M13 10V3L4 14h7v7l9-11h-7z"/>}
          />
          <StatCard
            label="Avg Latency" value={stats.summary.latency} suffix="s" dec={2}
            sub="RAG retrieval speed" accent="#10b981"
            iconPath={<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>}
          />
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate="visible"
          style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}
        >
          <ChartCard>
            <ST sub="RAG evaluation dimensions scored 0–100">Clinical triad balance</ST>
            <div style={{ height:300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.triad}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric"
                    tick={{ fill:"#64748b", fontSize:12, fontFamily:"'DM Sans',sans-serif", fontWeight:500 }} />
                  <PolarRadiusAxis angle={30} domain={[0,100]} tick={false} axisLine={false} />
                  <Tooltip content={<CTip />} />
                  <Radar name="Curamind" dataKey="score"
                    stroke="#1d4ed8" strokeWidth={2.5}
                    fill="#3b82f6" fillOpacity={0.15}
                    dot={{ fill:"#1d4ed8", strokeWidth:0, r:4 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard>
            <ST sub="Click a slice to view detailed conversation logs">Response safety distribution</ST>
            <div style={{ height:300, position:"relative" }}>
              <div style={{
                position:"absolute", inset:0, zIndex:1, pointerEvents:"none",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              }}>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:700, color:"#0f172a", lineHeight:1 }}>
                  <AnimCount to={stats.summary.total} />
                </span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase", marginTop:4 }}>
                  Total Queries
                </span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CTip />} />
                  <Pie data={stats.audit} cx="50%" cy="50%"
                    innerRadius={85} outerRadius={115}
                    paddingAngle={4} dataKey="value" stroke="none"
                    animationBegin={300} animationDuration={900}
                    onClick={handlePieClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {stats.audit.map((e,i) => (
                      <Cell 
                        key={i} 
                        fill={e.color} 
                        style={{ 
                          outline: 'none',
                          filter: selectedDetails?.title === e.name ? 'drop-shadow(0px 0px 8px rgba(0,0,0,0.2))' : 'none',
                          transform: selectedDetails?.title === e.name ? 'scale(1.05)' : 'scale(1)',
                          transformOrigin: 'center',
                          transition: 'all 0.2s ease'
                        }} 
                      />
                    ))}
                  </Pie>
                  <Legend iconType="circle"
                    wrapperStyle={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:"#475569" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard span2>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <ST sub="Daily LLM answer accuracy — past 7 days">7-day accuracy trajectory</ST>
              <motion.div
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.7 }}
                style={{
                  background:"#f0fdf4", border:"1px solid #bbf7d0",
                  borderRadius:99, padding:"5px 14px",
                  display:"flex", alignItems:"center", gap:7,
                }}
              >
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#10b981" }} />
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#059669", letterSpacing:"0.06em" }}>
                  Live Data Sync
                </span>
              </motion.div>
            </div>
            <div style={{ height:240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.history} margin={{ top:8, right:12, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="transparent"
                    tick={{ fill:"#94a3b8", fontSize:12, fontFamily:"'DM Sans',sans-serif" }}
                    tickLine={false} />
                  <YAxis stroke="transparent"
                    tick={{ fill:"#94a3b8", fontSize:12, fontFamily:"'DM Mono',monospace" }}
                    tickLine={false} domain={[85,100]}
                    tickFormatter={v => v+"%"} />
                  <Tooltip content={<CTip />} />
                  <Area type="monotone" dataKey="accuracy"
                    stroke="#1d4ed8" strokeWidth={3}
                    fill="url(#agrad)"
                    dot={{ fill:"#fff", stroke:"#1d4ed8", strokeWidth:2.5, r:5 }}
                    activeDot={{ fill:"#1d4ed8", r:7, strokeWidth:0 }}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <motion.div
            variants={stagger}
            style={{ gridColumn:"span 2", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}
          >
            {stats.triad.map((m, i) => (
              <motion.div
                key={m.metric}
                variants={cardV}
                whileHover={{ y:-3, boxShadow:"0 8px 20px rgba(0,0,0,0.08)" }}
                style={{
                  background:"#fff", border:"1px solid #f1f5f9",
                  borderRadius:16, padding:"16px 18px",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <p style={{
                  fontFamily:"'DM Mono',monospace", fontSize:10, color:"#94a3b8",
                  letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8,
                }}>
                  {m.metric}
                </p>
                <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                  <span style={{
                    fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:700,
                    color: m.score>=95?"#059669":m.score>=90?"#1d4ed8":"#d97706",
                  }}>
                    <AnimCount to={m.score} />
                  </span>
                  <span style={{ fontSize:12, color:"#94a3b8" }}>%</span>
                </div>
                <div style={{ height:3, background:"#f1f5f9", borderRadius:99, marginTop:10, overflow:"hidden" }}>
                  <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${m.score}%` }}
                    transition={{ duration:0.9, delay:0.35+i*0.08, ease:[0.22,1,0.36,1] }}
                    style={{
                      height:"100%", borderRadius:99,
                      background: m.score>=95?"#10b981":m.score>=90?"#3b82f6":"#f59e0b",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>

        {selectedDetails && (
          <motion.div
            ref={detailsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 32,
              background: "#fff", border: "1px solid #f1f5f9", borderRadius: 24,
              padding: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: selectedDetails.color, display: "inline-block" }}></span>
                  {selectedDetails.title} Logs
                </h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Recent queries flagged under this classification
                </p>
              </div>
              <button 
                onClick={() => setSelectedDetails(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {loadingDetails ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
                Loading conversation logs...
              </div>
            ) : selectedDetails.records.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
                No recent queries found for this classification.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {selectedDetails.records.map((record) => (
                  <div key={record.evaluation_id} style={{ 
                    border: "1px solid #e2e8f0", borderRadius: 16, padding: "20px",
                    background: "#f8fafc"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#64748b", letterSpacing: "0.05em" }}>
                        SESSION ID: {record.session_id}
                      </span>
                      <span style={{ 
                        fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, 
                        color: record.faithfulness_score >= 0.8 ? "#059669" : record.faithfulness_score >= 0.5 ? "#d97706" : "#dc2626",
                        background: record.faithfulness_score >= 0.8 ? "#ecfdf5" : record.faithfulness_score >= 0.5 ? "#fffbeb" : "#fef2f2",
                        padding: "4px 10px", borderRadius: 99
                      }}>
                        Score: {(record.faithfulness_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#1e293b", lineHeight: 1.6, marginBottom: 16 }}>
                      <strong style={{ color: "#0f172a" }}>AI Response: </strong> 
                      {record.content.length > 200 ? record.content.substring(0, 200) + "..." : record.content}
                    </p>
                    
                    <div style={{ background: "#fff", padding: "12px 16px", borderRadius: 8, borderLeft: `3px solid ${selectedDetails.color}` }}>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#475569", margin: 0 }}>
                        <strong style={{ color: "#334155" }}>Judge Reasoning: </strong>
                        {record.reasoning || "No detailed reasoning provided by the evaluator."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.1 }}
          style={{
            marginTop:32, textAlign:"center",
            fontFamily:"'DM Mono',monospace", fontSize:11,
            color:"#cbd5e1", letterSpacing:"0.08em",
          }}
        >
          CURAMIND · GIKI FYP 2025 · RAG AUDIT SYSTEM v1.0
        </motion.p>

      </div>
    </>
  );
}