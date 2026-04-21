import React, { useState } from "react";

export default function TrustBadge({ evaluation }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!evaluation) {
    return (
      <div className="flex items-center space-x-1 text-slate-400 text-[10px] animate-pulse italic font-['DM_Mono']">
        <span>Verifying...</span>
      </div>
    );
  }

  const faith = (evaluation.faithfulness_score * 100).toFixed(0);
  const rel = (evaluation.relevance_score * 100).toFixed(0);
  const corr = (evaluation.correctness_score * 100).toFixed(0);
  const isGrounded = evaluation.faithfulness_score >= 0.8 && evaluation.correctness_score >= 0.8;

  return (
    <div className="relative flex flex-col items-end">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-wider font-['DM_Mono'] transition-all shadow-sm ${
          isGrounded 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
        }`}
      >
        <span>{isGrounded ? "✓ VERIFIED" : "⚠ REVIEW"}</span>
        <div className="flex gap-2 border-l border-current pl-2 opacity-90 font-medium">
          <span>F:{faith}%</span>
          <span>R:{rel}%</span>
          <span>C:{corr}%</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 p-4 bg-white border border-slate-200 text-slate-700 text-xs rounded-xl shadow-xl z-50 font-['DM_Sans']">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Explainability Report</span>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 font-bold">✕</button>
          </div>
          <p className="leading-relaxed opacity-90">{evaluation.reasoning}</p>
        </div>
      )}
    </div>
  );
}