import { useState } from "react";

export default function ContextPanel({ patientContext, onUpdateContext, onSaveContext, isLocked }) {
  const [newCondition, setNewCondition] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const fieldsDisabled = isLocked && !isEditing;

  const updateField = (field, value) => {
    if (fieldsDisabled) return; 
    onUpdateContext({ ...patientContext, [field]: value });
  };

  const commitCondition = () => {
    if (fieldsDisabled) return;
    const condition = newCondition.trim();
    
    if (condition !== "" && !patientContext.conditions.includes(condition)) {
      onUpdateContext({ 
        ...patientContext, 
        conditions: [...patientContext.conditions, condition] 
      });
    }
    setNewCondition("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      commitCondition();
    }
  };

  const handleRemoveCondition = (conditionToRemove) => {
    if (fieldsDisabled) return;
    onUpdateContext({
      ...patientContext,
      conditions: patientContext.conditions.filter((c) => c !== conditionToRemove)
    });
  };

  return (
    <div className={`w-full flex items-center gap-6 px-6 py-4 bg-white/80 backdrop-blur-md transition-all ${fieldsDisabled ? "opacity-90" : ""}`}>
      
      <div className="flex flex-col border-r border-slate-200 pr-6 min-w-[180px]">
        <span className="text-[10px] uppercase tracking-widest font-['DM_Mono'] text-slate-400 font-medium">
          Active Profile
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-semibold text-slate-700 font-['DM_Sans']">
            Patient Parameters
          </span>
          {isLocked && !isEditing && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded text-[9px] font-bold uppercase tracking-wider font-['DM_Mono']">
              Locked
            </span>
          )}
          {isEditing && (
             <span className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded text-[9px] font-bold uppercase tracking-wider font-['DM_Mono'] animate-pulse">
             Editing
           </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 font-['DM_Sans']">Name</label>
          <input
            type="text"
            placeholder="Patient Name"
            value={patientContext.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            disabled={fieldsDisabled}
            className={`w-40 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-['DM_Sans'] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${fieldsDisabled ? "opacity-60 cursor-not-allowed bg-slate-100" : ""}`}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 font-['DM_Sans']">Age</label>
          <input
            type="number"
            min="0"
            max="120"
            placeholder="e.g. 45"
            value={patientContext.age}
            onChange={(e) => updateField("age", e.target.value)}
            disabled={fieldsDisabled}
            className={`w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-['DM_Mono'] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${fieldsDisabled ? "opacity-60 cursor-not-allowed bg-slate-100" : ""}`}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 font-['DM_Sans']">Sex</label>
          <div className="relative">
            <select
              value={patientContext.sex}
              onChange={(e) => updateField("sex", e.target.value)}
              disabled={fieldsDisabled}
              className={`appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 font-['DM_Sans'] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${fieldsDisabled ? "opacity-60 cursor-not-allowed bg-slate-100" : "cursor-pointer"}`}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 ml-4">
          <label className="text-xs font-medium text-slate-500 font-['DM_Sans'] whitespace-nowrap">
            Conditions
          </label>
          
          <div className={`flex-1 flex flex-wrap items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md min-h-[38px] transition-all ${fieldsDisabled ? "opacity-80 bg-slate-100" : "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"}`}>
            {patientContext.conditions.map((condition, index) => (
              <span key={index} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium font-['DM_Sans'] ${fieldsDisabled ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-700"}`}>
                {condition}
                {!fieldsDisabled && (
                  <button onClick={() => handleRemoveCondition(condition)} className="hover:text-blue-900 focus:outline-none">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </span>
            ))}

            {!fieldsDisabled && (
              <input
                type="text"
                placeholder={patientContext.conditions.length === 0 ? "Type and press Enter..." : "Add more..."}
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={commitCondition}
                className="flex-1 min-w-[150px] bg-transparent border-none p-0 text-sm focus:outline-none focus:ring-0 outline-none"
              />
            )}
            {fieldsDisabled && patientContext.conditions.length === 0 && (
              <span className="text-sm text-slate-400 italic">None specified</span>
            )}
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="pl-4 border-l border-slate-200">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors focus:outline-none"
            >
              Edit Profile
            </button>
          ) : (
            <button 
              onClick={() => {
                commitCondition(); 
                setIsEditing(false);
                onSaveContext(); 
              }}
              className="text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            >
              Save Changes
            </button>
          )}
        </div>
      )}

    </div>
  );
}