import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`;
const SHIELD  = "M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z";
const CHECK   = "M8 12l2.8 2.8L16 9";

export default function Signup() {
  const navigate = useNavigate();
  
  const [cardIn, setCardIn] = useState(false);

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPw,     setShowPw]     = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setCardIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setShakeKey(k => k + 1);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setShakeKey(k => k + 1);
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup(name, email, password);
      
      if (data && (data.access_token || data.token)) {
        localStorage.setItem("token", data.access_token || data.token);
        localStorage.setItem("username", data.username || name);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
              <p className="card-sub">Request System Access</p>
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
                <label className="field-label">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input className="field-input" type="text" autoComplete="name"
                    placeholder="Dr. Jane Doe"
                    value={name} onChange={e => setName(e.target.value)}
                    disabled={loading} />
                </div>
              </div>

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
                    autoComplete="new-password" placeholder="••••••••••••"
                    value={password} onChange={e => setPassword(e.target.value)}
                    disabled={loading} style={{ paddingRight: "40px" }} />
                  <button type="button" className="eye-btn"
                    onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    {showPw
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Confirm Password</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </span>
                  <input className="field-input" type={showConfPw ? "text" : "password"}
                    autoComplete="new-password" placeholder="••••••••••••"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading} style={{ paddingRight: "40px" }} />
                  <button type="button" className="eye-btn"
                    onClick={() => setShowConfPw(v => !v)} tabIndex={-1}>
                    {showConfPw
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: "28px" }}>
                {loading ? (
                  <>
                    <svg className="spin" width="14" height="14" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Creating Account…
                  </>
                ) : "Create Account"}
              </button>
            </form>

            <div className="signup-row">
              <span className="signup-text">Already have an account?</span>
              <button type="button" className="signup-btn" onClick={() => navigate('/login')}>
                Sign in
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

.card-outer {
  position: fixed; inset: 0; z-index: 10;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1),
              transform 0.5s cubic-bezier(0.22,1,0.36,1);
}
.card-outer.card-in {
  opacity: 1; transform: none;
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
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

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