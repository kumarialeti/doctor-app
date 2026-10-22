import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Sparkles, Send, AlertTriangle, CheckCircle2,
  Stethoscope, RotateCcw, ShieldCheck, ArrowRight,
  User, HeartPulse, HelpCircle, Star
} from "lucide-react";

const QUICK_PROMPTS = [
  { label: "⚡ Severe Migraine & Dizziness", query: "I have a severe throbbing headache and dizziness since yesterday." },
  { label: "🔥 High Fever & Body Ache", query: "I have a high fever of 102 F, chills, and severe body pain for 2 days." },
  { label: "🩹 Skin Rash & Redness", query: "I developed an itchy red rash with small bumps on my arms." },
  { label: "🤢 Acid Reflux & Stomach Pain", query: "I am having constant burning sensation in chest and severe upper stomach pain after meals." },
  { label: "🦴 Knee & Joint Stiffness", query: "My knee joints are swollen and painful, especially while climbing stairs." },
  { label: "👂 Ear Discharge & Throat Ache", query: "I have a sore throat, ear ache, and mild difficulty swallowing." },
];

const AiAssistant = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your **MediCare AI Health Assistant**.\n\nPlease describe what symptoms you are experiencing (e.g., headache, fever, skin rash, joint pain), and I will analyze the clinical triage, recommend the right specialist doctor, and provide instant booking options.",
      homeCare: [
        "Be as descriptive as possible regarding duration and intensity.",
        "Mention if you have tried any home remedies or over-the-counter medication.",
        "In case of sudden severe emergencies, call 112 immediately."
      ]
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/api/ai/check-symptoms",
        { message: textToSend },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.success) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: res.data.analysis,
          category: res.data.category,
          specialist: res.data.specialist,
          urgency: res.data.urgency,
          homeCare: res.data.homeCare,
          recommendedDoctors: res.data.recommendedDoctors || [],
          disclaimer: res.data.disclaimer
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("AI Assistant error:", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I encountered an issue processing your symptom analysis. Please try rephrasing or consult a general physician directly.",
        urgency: "low"
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "ai",
        text: "Conversation refreshed. How can I help you today? Feel free to describe any health concern or symptom.",
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] max-w-5xl mx-auto">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between mb-4 relative overflow-hidden"
      >
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <Bot size={32} className="text-cyan-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black m-0 tracking-tight text-white">MediCare AI Health Assistant</h1>
              <span className="bg-emerald-500/90 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles size={11} /> Smart Triage
              </span>
            </div>
            <p className="text-sm text-indigo-100 font-medium m-0 mt-1">
              Clinical symptom analysis, specialist doctor recommendations & verified direct booking.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Restart Chat"
          className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer backdrop-blur-sm"
        >
          <RotateCcw size={14} /> New Query
        </button>
      </motion.div>

      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap flex items-center gap-1 pl-1">
          <Sparkles size={12} className="text-indigo-500" /> Quick Symptoms:
        </span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSend(prompt.query)}
            className="text-xs font-semibold whitespace-nowrap bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-full transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-inner">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot size={20} />
                </div>
              )}

              <div className={`max-w-2xl ${msg.sender === "user" ? "w-auto" : "w-full"}`}>
                <div
                  className={`p-5 rounded-3xl shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none font-medium text-sm leading-relaxed"
                      : "bg-white border border-slate-100 text-slate-800 rounded-tl-none space-y-4"
                  }`}
                >
                  {/* Category & Urgency Badges for AI responses */}
                  {msg.sender === "ai" && msg.specialist && (
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-3 py-1 rounded-xl flex items-center gap-1.5 border border-indigo-100">
                        <Stethoscope size={14} /> Recommended: {msg.specialist}
                      </span>
                      {msg.category && (
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-xl">
                          {msg.category}
                        </span>
                      )}
                      <span
                        className={`text-xs font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1 ${
                          msg.urgency === "emergency"
                            ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                            : msg.urgency === "high"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {msg.urgency === "emergency" && <AlertTriangle size={13} />}
                        {msg.urgency === "emergency" ? "Emergency Alert" : `Urgency: ${msg.urgency}`}
                      </span>
                    </div>
                  )}

                  {/* Main text content */}
                  <div className="text-sm leading-relaxed whitespace-pre-line text-slate-700 font-normal">
                    {msg.text}
                  </div>

                  {/* Home care steps */}
                  {msg.homeCare && msg.homeCare.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2">
                      <p className="font-bold text-slate-800 m-0 flex items-center gap-1.5">
                        <HeartPulse size={14} className="text-indigo-600" /> Immediate Precautions & Home Care:
                      </p>
                      <ul className="m-0 pl-4 space-y-1 text-slate-600">
                        {msg.homeCare.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Doctors Cards */}
                  {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Stethoscope size={14} className="text-indigo-600" /> Top Matching Verified Doctors:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.recommendedDoctors.map((doc) => (
                          <div
                            key={doc._id}
                            className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-4 rounded-2xl border border-indigo-100/80 hover:border-indigo-300 transition-all shadow-sm flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-sm font-black text-slate-900 m-0">Dr. {doc.fullname}</h4>
                                  <p className="text-xs text-indigo-600 font-bold m-0 mt-0.5">{doc.specialization}</p>
                                </div>
                                <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-700 text-xs font-black">
                                  <Star size={11} className="fill-amber-400 text-amber-400" />
                                  <span>{doc.avgRating}</span>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium m-0 mt-2">
                                💼 {doc.experience} Experience &bull; ₹{doc.fees} Fee
                              </p>
                            </div>

                            <button
                              onClick={() => navigate(`/book-appointment/${doc._id}`)}
                              className="mt-3 w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border-none"
                            >
                              Book Consultation <ArrowRight size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {msg.disclaimer && (
                    <p className="text-[11px] text-slate-400 italic m-0 pt-1 border-t border-slate-100 flex items-center gap-1">
                      <ShieldCheck size={12} className="shrink-0 text-slate-400" />
                      {msg.disclaimer}
                    </p>
                  )}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <User size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading Indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3.5 items-center">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md animate-bounce">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Sparkles size={15} className="text-indigo-600 animate-spin" />
              <span>Analyzing clinical symptoms & finding matching doctors...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your health symptoms (e.g. constant fever with cough, joint stiffness)..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 font-medium"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3.5 rounded-xl font-bold transition shadow-md disabled:opacity-40 cursor-pointer border-none flex items-center justify-center"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AiAssistant;
