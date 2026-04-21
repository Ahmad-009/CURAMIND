import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TrustBadge from "../TrustBadge"; 

export default function ChatWindow({ messages, isLoading, onSendMessage, onUpdateMessage }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const pendingMessages = messages.filter(m => m.role === "ai" && m.id && !m.evaluation);

    if (pendingMessages.length === 0) return;

    const interval = setInterval(() => {
      pendingMessages.forEach(async (pendingMsg) => {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/chat/evaluations/${pendingMsg.id}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (response.ok) {
            const evalData = await response.json();
            if (evalData && evalData.faithfulness_score !== undefined) {
              if (onUpdateMessage) {
                onUpdateMessage(pendingMsg.id, evalData);
              }
            }
          }
        } catch (err) {
          console.error("Polling evaluation failed:", err);
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [messages, onUpdateMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  const getCitationLink = (cite) => {
    if (cite.url && cite.url !== "N/A") return cite.url;
    const source = cite.source_id?.toLowerCase() || "";
    const id = cite.reference_id;
    if (!id || id === "N/A") return "#";
    if (source.includes("trial")) return `https://clinicaltrials.gov/study/${id}`;
    if (source.includes("pubmed")) return `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
    if (source.includes("drugbank")) return `https://go.drugbank.com/drugs/${id}`;
    return "#";
  };

  const getSourceStyle = (sourceId) => {
    const id = sourceId?.toLowerCase() || "";
    if (id.includes("pubmed")) return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
    if (id.includes("drugbank")) return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    if (id.includes("trial")) return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    return "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-600">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="font-['DM_Sans'] text-sm max-w-xs">
              Enter a clinical inquiry. Grounded in PubMed, DrugBank, and ClinicalTrials.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
              msg.role === "user" 
                ? "bg-blue-600 border-blue-500 text-white" 
                : "bg-white border-slate-200 text-slate-800"
            }`}>
              
              {msg.role === "ai" && (
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-700 uppercase tracking-wider font-['DM_Mono']">
                    Curamind AI
                  </span>
                  <TrustBadge evaluation={msg.evaluation} />
                </div>
              )}

              <div className={`prose prose-sm max-w-none ${msg.role === "user" ? "prose-invert" : "prose-slate"}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>

              {msg.role === "ai" && msg.citations && msg.citations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">
                    Verified Evidence:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((cite, cIdx) => {
                      const link = getCitationLink(cite);
                      return (
                        <a 
                          key={cIdx}
                          href={link} 
                          target={link !== "#" ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-['DM_Mono'] border transition-all shadow-sm group ${getSourceStyle(cite.source_id)} ${link === "#" ? "cursor-default" : "cursor-pointer"}`}
                          title={cite.title || "View Source"}
                        >
                          <span className="font-bold uppercase">{cite.source_id}:</span> 
                          <span className="opacity-80">{cite.reference_id || "Ref"}</span>
                          {link !== "#" && (
                            <svg className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] font-['DM_Mono'] text-slate-500 uppercase tracking-widest font-medium">
                Synthesizing Evidence...
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <textarea
            rows="1"
            placeholder="Type clinical inquiry..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="w-full pl-4 pr-16 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none font-['DM_Sans'] shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}