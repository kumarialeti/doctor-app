import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../components/UserContext";
import { Link, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { Send, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Chat = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const targetUserId = searchParams.get("user");
  const targetUserName = searchParams.get("name");

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Initialize Socket.io
  useEffect(() => {
    if (user?._id) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        query: { userId: user._id },
      });
      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => newSocket.close();
    }
  }, [user?._id]);

  // Handle incoming messages
  useEffect(() => {
    if (socket === null) return;
    
    socket.on("newMessage", (message) => {
      if (selectedUser && (message.senderId === selectedUser._id || message.receiverId === selectedUser._id)) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("newMessage");
  }, [socket, selectedUser]);

  // Fetch Conversations list
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + "/api/chat/conversations", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data.success) {
           let convoList = res.data.data;
           
           // If we navigated here from another page to start a new chat perfectly
           if (targetUserId && targetUserName) {
             const exists = convoList.find(c => c._id === targetUserId);
             if (!exists) {
                convoList = [{ _id: targetUserId, name: targetUserName }, ...convoList];
             }
             setSelectedUser({ _id: targetUserId, name: targetUserName });
           }
           
           setConversations(convoList);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchConversations();
  }, [targetUserId, targetUserName]);

  // Fetch specific conversation messages
  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchMessages = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + `/api/chat/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await axios.post(
        import.meta.env.VITE_API_URL + `/api/chat/send/${selectedUser._id}`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      if (res.data.success) {
        setMessages([...messages, res.data.data]);
        setNewMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
      
      {/* Sidebar: Conversations List */}
      <div className="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-black tracking-tight text-slate-800 m-0">Live Messages</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Connect securely with your network.</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-4">
                 <img src="/images/login_doctor.png" alt="Empty" className="w-32 opacity-20 filter grayscale" />
                 <p className="text-sm font-semibold">No active conversations.</p>
             </div>
          ) : (
             <div className="flex flex-col">
              {conversations.map((c) => {
                const isOnline = onlineUsers.includes(c._id);
                const isSelected = selectedUser?._id === c._id;
                return (
                  <div 
                    key={c._id}
                    onClick={() => setSelectedUser(c)}
                    className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-slate-100 ${isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-white'} `}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border-2 border-white shadow-sm">
                        <UserIcon size={20} />
                      </div>
                      {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate m-0">{c.name}</h3>
                      <p className={`text-xs font-semibold m-0 truncate ${isOnline ? 'text-green-500' : 'text-slate-400'}`}>
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                )
              })}
             </div>
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className="w-2/3 flex flex-col bg-slate-100 relative">
        {selectedUser ? (
          <>
            {/* Chat Target Header */}
            <div className="h-20 bg-white/50 backdrop-blur-md flex items-center px-8 border-b border-slate-200 z-10 shadow-sm">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white mr-4 shadow-md">
                   <UserIcon size={18} />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-slate-800 m-0">{selectedUser.name}</h2>
                   <p className="text-xs font-semibold text-indigo-500 m-0">End-to-End Encrypted Session</p>
                </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((m, idx) => {
                  const isMe = m.senderId === user?._id;
                  return (
                    <motion.div
                      key={m._id || idx}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}>
                        <p className="m-0 text-[15px] leading-relaxed break-words">{m.message}</p>
                        <p className={`text-[10px] mt-2 font-semibold text-right m-0 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-slate-200 shadow-lg relative z-20">
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type a secure message to ${selectedUser.name}...`}
                  className="flex-1 h-14 bg-slate-50 border-none rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm text-slate-800 font-semibold"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-14 w-14 bg-yellow-400 rounded-full flex items-center justify-center text-gray-800 hover:bg-yellow-500 border-none shadow-md cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center mb-6">
                <Send size={32} className="text-indigo-300 ml-2" />
             </div>
             <h2 className="text-xl font-black text-slate-700 m-0">No Conversation Selected</h2>
             <p className="text-sm font-semibold max-w-xs text-center mt-2">Select a user from the sidebar to start securely messaging in real-time.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
