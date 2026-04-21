import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../utils/api";
import { authService } from "../../services/auth";

export default function Sidebar({ onNewConsultation, pastSessions = [], onSelectSession, activeSessionId, onSessionDeleted }) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [userName, setUserName] = useState("Medical Staff");

  useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) {
      const cleanName = savedName.replace(/_/g, " ");
      setUserName(cleanName);
    }
  }, []);
  
  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this clinical consultation?")) return;
    
    try {
      const response = await apiRequest(`/chat/session/${sessionId}`, {
        method: "DELETE",
      });
      
      if (response) {
        onSessionDeleted(sessionId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full bg-[#040d1e] text-slate-300 border-r border-slate-800/50 font-sans">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V6L12 2z" />
          <path d="M8 12l2.8 2.8L16 9" stroke="#60a5fa" />
        </svg>
        <div className="cursor-pointer" onClick={() => navigate("/dashboard")}>
          <h1 className="font-['Playfair_Display'] text-xl font-semibold text-slate-100 tracking-wide">Curamind</h1>
          <p className="font-['DM_Mono'] text-[9px] tracking-widest text-blue-400 uppercase opacity-80">MD Workspace</p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <button 
          onClick={() => { navigate("/dashboard"); onNewConsultation(); }} 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.15)] border border-blue-500/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Consultation
        </button>

        <button 
          onClick={() => navigate("/analytics")} 
          className="w-full flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border border-slate-700/30"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
          Audit Analytics
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <h2 className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-['DM_Mono']">Recent Sessions</h2>
        {pastSessions.length === 0 ? (
          <div className="px-3 py-4 text-center text-xs text-slate-500 italic">No recent sessions found.</div>
        ) : (
          pastSessions.map((session) => (
            <div 
              key={session.id} 
              onClick={() => { navigate("/dashboard"); onSelectSession(session.id); }} 
              className={`w-full flex flex-col text-left px-3 py-3 rounded-md transition-colors group border cursor-pointer ${activeSessionId === session.id ? 'bg-slate-800 border-slate-700/50' : 'border-transparent hover:bg-slate-800/50 hover:border-slate-700/50'}`}
            >
              <div className="flex justify-between items-start w-full mb-1">
                <div className="flex flex-col overflow-hidden pr-2">
                  <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 truncate">{session.session_name}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{new Date(session.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} className="text-slate-500 hover:text-red-400 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100" title="Delete Session">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
              {session.patient_state?.conditions?.length > 0 && (
                <div className="text-[11.5px] text-slate-400 line-clamp-2 leading-relaxed mt-1 font-['DM_Sans'] opacity-80 group-hover:opacity-100 transition-opacity pr-6">
                  <span className="font-semibold text-blue-400/80 mr-1">Conditions:</span>
                  {session.patient_state.conditions.join(", ")}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-slate-900/20 relative">
        {showLogout && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
        
        <div 
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/30 p-2 rounded-lg transition-colors"
          onClick={() => setShowLogout(!showLogout)}
        >
          <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-700/30">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-slate-200">{userName}</span>
            <span className="text-[10px] text-slate-500 font-['DM_Mono'] tracking-wide">GIKI STAFF</span>
          </div>
          <svg 
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
            className={`text-slate-500 transition-transform ${showLogout ? 'rotate-180' : ''}`}
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </div>
      </div>
    </div>
  );
}