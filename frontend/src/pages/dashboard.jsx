import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import ContextPanel from "../components/patient/ContextPanel";
import ChatWindow from "../components/chat/ChatWindow";
import { chatService } from "../services/chat";
import { sessionService } from "../services/session";

export default function Dashboard() {
  const [sessionId, setSessionId] = useState(null);
  const [patientContext, setPatientContext] = useState({
    name: "",
    age: "",
    sex: "Male",
    conditions: []
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);

  const isSessionActive = recentMessages.length > 0;

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await sessionService.getAllSessions();
      if (data) setPastSessions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectSession = async (sid) => {
    try {
      setIsLoading(true);
      const data = await sessionService.getSessionDetail(sid);
      if (data) {
        setSessionId(sid);
        const mappedMessages = data.history.map(m => ({
          id: m.id,
          role: m.sender === "user" ? "user" : "ai",
          content: m.content,
          citations: m.citations || [],
          evaluation: m.evaluation || null
        }));
        setRecentMessages(mappedMessages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConsultation = () => {
    setSessionId(null);
    setRecentMessages([]);
    setPatientContext({ name: "", age: "", sex: "Male", conditions: [] });
  };

  const handleSessionDeleted = (deletedSessionId) => {
    setPastSessions(prevSessions => prevSessions.filter(s => s.id !== deletedSessionId));
    if (sessionId === deletedSessionId) {
      handleNewConsultation();
    }
  };

  const handleUpdateContext = (newContext) => {
    setPatientContext(newContext);
  };

  const handleSaveContext = () => {
    if (isSessionActive) {
      const systemMarker = {
        role: "user", 
        content: `[SYSTEM NOTIFICATION: The physician has updated the patient parameters mid-session. New parameters: Name: ${patientContext.name || 'N/A'}, Age ${patientContext.age || 'N/A'}, Sex: ${patientContext.sex}, Conditions: ${patientContext.conditions.join(', ') || 'None'}. Please base all future clinical reasoning on these updated parameters.]`
      };
      setRecentMessages(prev => [...prev, systemMarker]);
    }
  };

  const handleUpdateMessage = (messageId, evaluationData) => {
    setRecentMessages((prevMessages) => 
      prevMessages.map((msg) => 
        msg.id === messageId ? { ...msg, evaluation: evaluationData } : msg
      )
    );
  };

  const handleSendMessage = async (query) => {
    if (!query.trim()) return;

    const newUserMsg = { role: "user", content: query };
    const cleanHistoryForBackend = recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    setRecentMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    const payload = {
      session_id: sessionId,
      query: query,
      patient_context: {
        ...patientContext,
        age: patientContext.age === "" ? 1 : parseInt(patientContext.age, 10)
      },
      retrieved_docs: [], 
      master_state: null,
      recent_messages: [...cleanHistoryForBackend, newUserMsg] 
    };

    try {
      const data = await chatService.ask(payload);
      if (data && data.session_id && !sessionId) {
        setSessionId(data.session_id);
        loadSessions();
      }
      if (data) {
        const aiResponse = { 
          id: data.message_id,
          role: "ai", 
          content: data.answer,
          citations: data.citations || [],
          evaluation: null 
        };
        setRecentMessages(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error("Critical System Error:", error);
      const systemError = { 
        role: "ai", 
        content: "⚠️ **System Error:** Connection to the RAG engine failed. Please check the backend services." 
      };
      setRecentMessages(prev => [...prev, systemError]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <div className="w-72 bg-[#040d1e] flex-shrink-0 z-20 shadow-xl">
        <Sidebar 
          onNewConsultation={handleNewConsultation} 
          pastSessions={pastSessions} 
          onSelectSession={handleSelectSession}
          activeSessionId={sessionId}
          onSessionDeleted={handleSessionDeleted}
        />
      </div>
      <div className="flex flex-col flex-1 h-full min-w-0">
        <div className="bg-white border-b border-slate-200 shadow-sm z-10">
          <ContextPanel 
            patientContext={patientContext} 
            onUpdateContext={handleUpdateContext} 
            onSaveContext={handleSaveContext}
            isLocked={isSessionActive} 
          />
        </div>
        <div className="flex-1 overflow-hidden relative">
           <ChatWindow 
             messages={recentMessages} 
             isLoading={isLoading} 
             onSendMessage={handleSendMessage} 
             onUpdateMessage={handleUpdateMessage}
           />
        </div>
      </div>
    </div>
  );
}