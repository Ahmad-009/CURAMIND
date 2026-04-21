import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`;
const BRAND   = "CURAMIND";
const TAGLINE = "ADVANCED MEDICAL QA PORTAL";
const SHIELD  = "M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z";
const CHECK   = "M8 12l2.8 2.8L16 9";

export default function Login() {
  const navigate = useNavigate();
  
  const [phase,      setPhase]      = useState(0);
  const [charCount,  setCharCount]  = useState(0);
  const [showTag,    setShowTag]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [scanActive, setScanActive] = useState(false);
  const [curtainUp,  setCurtainUp]  = useState(false);
  const [cardIn,     setCardIn]     = useState(false);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const T = (fn, ms) => setTimeout(fn, ms);

    const typeTimers = BRAND.split("").map((_, i) =>
      T(() => setCharCount(i + 1), 900 + i * 80)
    );

    const t1 = T(() => setShowTag(true), 1700);

    let prog = 0;
    const progInt = setInterval(() => {
      prog = Math.min(prog + 100 / 18, 100);
      setProgress(prog);
    }, 50);
    const t2 = T(() => clearInterval(progInt), 2900);

    const t3 = T(() => setScanActive(true),   2950);
    const t4 = T(() => { setCurtainUp(true); setPhase(1); }, 3350);
    const t5 = T(() => { setPhase(2); setTimeout(() => setCardIn(true), 80); }, 3950);

    return () => {
      typeTimers.forEach(clearTimeout);
      [t1, t2, t3, t4, t5].forEach(clearTimeout);
      clearInterval(progInt);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      setShakeKey(k => k + 1);
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      localStorage.setItem("token", data.access_token || data.token);
      localStorage.setItem("username", data.username);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed.");
      setShakeKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{FONTS + CSS}</style>

      <div className="bg-base">
        <div className="bg-grid" />
        <div className="bg-radial" />
      </div>

      {phase < 2 && (
        <div className={`intro-overlay${curtainUp ? " intro-exit" : ""}`}>
          <div className="scan-h scan-top" />
          <div className="scan-h scan-bot" />
          {scanActive && <div className="scan-v" />}

          <div className="bracket br-tl" />
          <div className="bracket br-tr" />
          <div className="bracket br-bl" />
          <div className="bracket br-br" />

          <div className="intro-center">
            <svg className="intro-shield" viewBox="0 0 24 24" fill="none">
              <path className="shield-path" d={SHIELD}
                stroke="#3b82f6" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round" />
              <path className="check-path" d={CHECK}
                stroke="#60a5fa" strokeWidth="1.6"
                strokeLinecap="round" strokeLinejoin="round" />
              <path d={SHIELD} fill="rgba(59,130,246,0.07)" />
            </svg>

            <div className="intro-brand" aria-label={BRAND}>
              {BRAND.split("").map((ch, i) => (
                <span key={i}
                  className={`intro-char${i < charCount ? " char-on" : ""}`}
                  style={{ transitionDelay: `${i * 28}ms` }}>
                  {ch}
                </span>
              ))}
              <span className={`cursor${charCount === BRAND.length ? " cursor-done" : ""}`}>
                ▌
              </span>
            </div>

            <p className={`intro-tag${showTag ? " visible" : ""}`}>{TAGLINE}</p>

            <div className={`prog-wrap${showTag ? " visible" : ""}`}>
              <div className="prog-track">
                <div className="prog-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="prog-label">
                {progress < 100 ? "ESTABLISHING SECURE CHANNEL" : "CONNECTION SECURED"}
              </span>
            </div>
          </div>

          <div className="intro-version">GIKI · FYP 2025 · v1.0</div>
        </div>
      )}

      <div className={`card-outer${cardIn ? " card-in" : ""}`}>
        <div className={`auth-card${shakeKey > 0 ? " shake" : ""}`} key={shakeKey}>
          <div className="card-bar" />

          <div className="card-body">
            <div className="card-header">
              <div className="header-row">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round">
                  <path d={SHIELD} />
                  <path d={CHECK}  />
                </svg>
                <h1 className="card-brand">Curamind</h1>
              </div>
              <p className="card-sub">Secure Medical QA Portal</p>
              <div className="card-divider" />
            </div>

            {error && (
              <div className="error-box">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                     stroke="#f87171" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label className="field-label">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input className="field-input" type="email" autoComplete="email"
                    placeholder="you@institution.edu"
                    value={email} onChange={e => setEmail(e.target.value)}
                    disabled={loading} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input className="field-input" type={showPw ? "text" : "password"}
                    autoComplete="current-password" placeholder="••••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    disabled={loading} style={{ paddingRight: "40px" }} />
                  <button type="button" className="eye-btn"
                    onClick={() => setShowPw(v => !v)} tabIndex={-1}
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="forgot-row">
                <button type="button" className="forgot-btn" onClick={() => navigate('/forgot-password')}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="spin" width="14" height="14" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Authenticating…
                  </>
                ) : "Sign In"}
              </button>
            </form>

            <div className="signup-row">
              <span className="signup-text">Don't have an account?</span>
              <button type="button" className="signup-btn" onClick={() => navigate('/signup')}>
                Sign up
              </button>
            </div>
          </div>

          <div className="card-footer">
            <div className="status-row">
              <span className="status-dot" />
              <span className="status-label">Systems operational</span>
            </div>
            <span className="build-tag">GIKI · FYP 2025</span>
          </div>
        </div>
      </div>
    </>
  );
}

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.bg-base { position: fixed; inset: 0; z-index: 0; background: #040d1e; }
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px);
  background-size: 40px 40px;
}
.bg-radial {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 55% at 50% 45%,
    rgba(29,78,216,0.18) 0%, transparent 70%);
}
.intro-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: #030b18;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  animation: fade-in 0.4s ease both;
}
.intro-exit {
  animation: curtain-up 0.65s cubic-bezier(0.76,0,0.24,1) both !important;
}
@keyframes curtain-up {
  to { transform: translateY(-100%); }
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.scan-h {
  position: absolute; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg,
    transparent 0%, rgba(59,130,246,0.45) 20%,
    rgba(147,197,253,0.75) 50%, rgba(59,130,246,0.45) 80%, transparent 100%);
}
.scan-top { top: 50%; animation: scan-top 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
.scan-bot { bottom: 50%; animation: scan-bot 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
@keyframes scan-top { from { top: 50%; opacity: 0; } to { top: 10%; opacity: 1; } }
@keyframes scan-bot { from { bottom: 50%; opacity: 0; } to { bottom: 10%; opacity: 1; } }
.scan-v {
  position: absolute; top: 0; bottom: 0; width: 2px;
  background: linear-gradient(180deg,
    transparent 0%, rgba(96,165,250,0.9) 50%, transparent 100%);
  box-shadow: 0 0 16px 4px rgba(96,165,250,0.3);
  animation: sweep 0.55s cubic-bezier(0.4,0,0.6,1) both;
}
@keyframes sweep {
  from { left: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  to  { left: 100%; opacity: 0; }
}
.bracket {
  position: absolute; width: 22px; height: 22px;
  border-color: rgba(59,130,246,0.4); border-style: solid;
  animation: bracket-in 0.5s ease 0.2s both;
}
.br-tl { top: 22px; left: 22px;   border-width: 1.5px 0 0 1.5px; }
.br-tr { top: 22px; right: 22px;  border-width: 1.5px 1.5px 0 0; }
.br-bl { bottom: 22px; left: 22px; border-width: 0 0 1.5px 1.5px; }
.br-br { bottom: 22px; right: 22px; border-width: 0 1.5px 1.5px 0; }
@keyframes bracket-in {
  from { opacity: 0; transform: scale(1.5); }
  to   { opacity: 1; transform: scale(1); }
}
.intro-version {
  position: absolute; bottom: 26px; left: 50%; transform: translateX(-50%);
  font-family: 'DM Mono', monospace; font-size: 10px;
  color: rgba(100,116,139,0.4); letter-spacing: 0.12em;
  animation: fade-in 0.5s ease 0.4s both;
}
.intro-center {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
}
.intro-shield {
  width: 70px; height: 70px; margin-bottom: 26px;
  filter: drop-shadow(0 0 14px rgba(59,130,246,0.45));
  animation: shield-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.4s both;
}
@keyframes shield-pop {
  from { opacity: 0; transform: scale(0.5) rotate(-12deg); }
  to   { opacity: 1; transform: scale(1) rotate(0); }
}
.shield-path {
  stroke-dasharray: 90; stroke-dashoffset: 90;
  animation: draw 0.9s ease 0.45s forwards;
}
.check-path {
  stroke-dasharray: 22; stroke-dashoffset: 22;
  animation: draw 0.4s ease 1.15s forwards;
}
@keyframes draw { to { stroke-dashoffset: 0; } }
.intro-brand {
  font-family: 'Playfair Display', serif;
  font-size: clamp(30px, 6vw, 50px); font-weight: 600;
  letter-spacing: 0.2em; color: #f1f5f9;
  margin-bottom: 10px;
  display: flex; align-items: baseline; gap: 1px;
}
.intro-char {
  display: inline-block;
  opacity: 0; transform: translateY(-14px);
  transition: opacity 0.25s ease, transform 0.35s cubic-bezier(0.34,1.4,0.64,1);
}
.intro-char.char-on { opacity: 1; transform: none; }
.cursor {
  color: #3b82f6; margin-left: 1px; font-size: 0.8em;
  animation: blink 0.7s step-end infinite;
}
.cursor.cursor-done { opacity: 0; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
.intro-tag {
  font-family: 'DM Mono', monospace; font-size: 11px;
  letter-spacing: 0.2em; color: rgba(148,163,184,0.55);
  margin-bottom: 30px;
  opacity: 0; transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.intro-tag.visible { opacity: 1; transform: none; }
.prog-wrap {
  width: 220px;
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s;
}
.prog-wrap.visible { opacity: 1; transform: none; }
.prog-track {
  width: 100%; height: 1.5px;
  background: rgba(59,130,246,0.12); border-radius: 99px; overflow: hidden;
  margin-bottom: 8px;
}
.prog-fill {
  height: 100%;
  background: linear-gradient(90deg, #1d4ed8, #60a5fa);
  border-radius: 99px; transition: width 0.05s linear;
  box-shadow: 0 0 6px rgba(96,165,250,0.55);
}
.prog-label {
  font-family: 'DM Mono', monospace; font-size: 9px;
  color: rgba(100,116,139,0.6); letter-spacing: 0.14em;
  display: block; text-align: center;
}
.card-outer {
  position: fixed; inset: 0; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1),
              transform 0.6s cubic-bezier(0.22,1,0.36,1);
  pointer-events: none;
}
.card-outer.card-in {
  opacity: 1; transform: none; pointer-events: all;
}
.auth-card {
  width: 100%; max-width: 420px;
  background: rgba(8,15,30,0.9);
  border: 1px solid rgba(59,130,246,0.22);
  border-radius: 16px; overflow: hidden;
  backdrop-filter: blur(24px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.55),
              0 0 36px rgba(29,78,216,0.09);
  font-family: 'DM Sans', sans-serif;
}
.auth-card.shake { animation: shake 0.4s ease; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(4px); }
}
.card-bar {
  height: 2.5px;
  background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 55%, #93c5fd 100%);
}
.card-body { padding: 34px 38px 26px; }
.card-header { text-align: center; margin-bottom: 26px; }
.header-row {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; margin-bottom: 8px;
}
.card-brand {
  font-family: 'Playfair Display', serif;
  font-size: 25px; font-weight: 600;
  color: #f1f5f9; letter-spacing: -0.02em;
}
.card-sub {
  font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(100,116,139,0.65); font-weight: 300; margin-bottom: 18px;
}
.card-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent,
    rgba(59,130,246,0.22) 30%, rgba(59,130,246,0.22) 70%, transparent);
}
.error-box {
  display: flex; align-items: center; gap: 8px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.22);
  border-radius: 8px; padding: 10px 13px;
  margin-bottom: 18px; font-size: 13px; color: #f87171;
  animation: fade-in 0.25s ease;
}
.field { margin-bottom: 17px; }
.field-label {
  display: block; font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: rgba(148,163,184,0.55); margin-bottom: 7px;
}
.input-wrap { position: relative; }
.input-icon {
  position: absolute; left: 13px; top: 50%;
  transform: translateY(-50%); pointer-events: none;
  color: rgba(100,116,139,0.55); display: flex;
}
.field-input {
  width: 100%; padding: 11px 14px 11px 38px;
  background: rgba(15,23,42,0.55);
  border: 1px solid rgba(59,130,246,0.18);
  border-radius: 8px; color: #f1f5f9;
  font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.field-input::placeholder { color: rgba(100,116,139,0.4); }
.field-input:focus {
  border-color: rgba(59,130,246,0.5);
  background: rgba(15,23,42,0.8);
  box-shadow: 0 0 0 3px rgba(29,78,216,0.14), 0 0 14px rgba(59,130,246,0.07);
}
.eye-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; line-height: 0; padding: 2px;
  color: rgba(100,116,139,0.5); transition: color 0.15s;
}
.eye-btn:hover { color: rgba(148,163,184,0.8); }
.forgot-row { text-align: right; margin-bottom: 22px; }
.forgot-btn {
  background: none; border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px;
  color: rgba(96,165,250,0.65); transition: color 0.15s;
}
.forgot-btn:hover { color: #60a5fa; text-decoration: underline; text-underline-offset: 3px; }
.submit-btn {
  width: 100%; padding: 12px 0;
  background: #1e40af;
  border: 1px solid rgba(59,130,246,0.38);
  border-radius: 8px; color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500; letter-spacing: 0.05em;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  transition: background 0.2s, box-shadow 0.2s, transform 0.12s;
  position: relative; overflow: hidden;
}
.submit-btn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%);
  pointer-events: none;
}
.submit-btn:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 0 24px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.3);
  transform: translateY(-1px);
}
.submit-btn:active:not(:disabled) { transform: none; background: #1e3a8a; }
.submit-btn:disabled {
  background: #1e293b; color: rgba(100,116,139,0.5);
  cursor: not-allowed; border-color: rgba(59,130,246,0.08);
}
.spin { animation: spin 0.8s linear infinite; display: inline-block; }
@keyframes spin { to { transform: rotate(360deg); } }
.signup-row { text-align: center; margin-top: 20px; font-size: 12.5px; }
.signup-text { color: rgba(148,163,184,0.65); margin-right: 6px; }
.signup-btn {
  background: none; border: none; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px;
  color: #60a5fa; transition: color 0.15s; font-weight: 500;
}
.signup-btn:hover { color: #93c5fd; text-decoration: underline; text-underline-offset: 3px; }
.card-footer {
  border-top: 1px solid rgba(59,130,246,0.09);
  padding: 13px 38px;
  display: flex; align-items: center; justify-content: space-between;
}
.status-row { display: flex; align-items: center; gap: 8px; }
.status-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #22c55e;
  animation: pulse-dot 2.2s ease-out infinite;
}
@keyframes pulse-dot {
  0%  { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); }
  70% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  100%{ box-shadow: 0 0 0 0 rgba(34,197,94,0); }
}
.status-label { font-size: 11.5px; color: rgba(100,116,139,0.55); }
.build-tag    { font-size: 11px; color: rgba(71,85,105,0.45); letter-spacing: 0.04em; }
`;