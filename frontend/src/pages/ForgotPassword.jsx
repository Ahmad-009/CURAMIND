import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');`;
const SHIELD  = "M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z";
const CHECK   = "M8 12l2.8 2.8L16 9";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [cardIn, setCardIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setCardIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      setShakeKey(k => k + 1);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setShakeKey(k => k + 1);
      return;
    }

    if (password.length < 12) {
      setError("New password must be at least 12 characters.");
      setShakeKey(k => k + 1);
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || "User not found or reset failed.");
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.6"><path d={SHIELD} /><path d={CHECK}  /></svg>
                <h1 className="card-brand">Curamind</h1>
              </div>
              <p className="card-sub">Credential Reset</p>
              <div className="card-divider" />
            </div>

            {success ? (
              <div className="success-area">
                <div className="success-icon">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h2 className="success-title">Password Reset</h2>
                <p className="success-text">Credentials updated. Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {error && <div className="error-box"><span>{error}</span></div>}
                
                <div className="field">
                  <label className="field-label">Account Email</label>
                  <input className="field-input" type="email" placeholder="you@institution.edu"
                    value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                </div>

                <div className="field">
                  <label className="field-label">New Password</label>
                  <input className="field-input" type="password" placeholder="Min. 12 characters"
                    value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                </div>

                <div className="field">
                  <label className="field-label">Confirm New Password</label>
                  <input className="field-input" type="password" placeholder="Retype password"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={loading} />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Updating..." : "Reset Password"}
                </button>

                <div className="signup-row">
                  <button type="button" className="signup-btn" onClick={() => navigate('/login')}>← Back to Sign In</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const CSS = `
.bg-base { position: fixed; inset: 0; z-index: 0; background: #040d1e; }
.bg-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px); background-size: 40px 40px; }
.bg-radial { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 55% at 50% 45%, rgba(29,78,216,0.18) 0%, transparent 70%); }
.card-outer { position: fixed; inset: 0; z-index: 10; display: flex; align-items: center; justify-content: center; padding: 24px; opacity: 0; transform: translateY(30px); transition: 0.5s ease-out; }
.card-outer.card-in { opacity: 1; transform: none; }
.auth-card { width: 100%; max-width: 420px; background: rgba(8,15,30,0.9); border: 1px solid rgba(59,130,246,0.22); border-radius: 16px; overflow: hidden; backdrop-filter: blur(24px); font-family: 'DM Sans', sans-serif; }
.card-bar { height: 2.5px; background: linear-gradient(90deg, #1e3a8a 0%, #3b82f6 55%, #93c5fd 100%); }
.card-body { padding: 34px 38px 26px; }
.card-header { text-align: center; margin-bottom: 24px; }
.card-brand { font-family: 'Playfair Display', serif; font-size: 25px; font-weight: 600; color: #f1f5f9; }
.card-sub { font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(100,116,139,0.65); margin-bottom: 18px; }
.card-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,0.22) 50%, transparent); margin-bottom: 20px;}
.field { margin-bottom: 15px; }
.field-label { display: block; font-size: 11px; font-weight: 500; text-transform: uppercase; color: rgba(148,163,184,0.55); margin-bottom: 7px; }
.field-input { width: 100%; padding: 11px 14px; background: rgba(15,23,42,0.55); border: 1px solid rgba(59,130,246,0.18); border-radius: 8px; color: #f1f5f9; font-size: 14px; outline: none; }
.submit-btn { width: 100%; padding: 12px; background: #1e40af; border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.2s; margin-top: 15px; }
.submit-btn:hover:not(:disabled) { background: #2563eb; }
.signup-row { text-align: center; margin-top: 20px; }
.signup-btn { background: none; border: none; cursor: pointer; color: #60a5fa; font-size: 13px; }
.error-box { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 10px; margin-bottom: 15px; font-size: 13px; color: #f87171; text-align: center; }
.success-area { text-align: center; padding: 20px 0; }
.success-title { color: #f1f5f9; font-size: 18px; margin-bottom: 8px; }
.success-text { color: rgba(148,163,184,0.8); font-size: 14px; }
.header-row { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px; }
`;