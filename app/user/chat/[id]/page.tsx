"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useChat } from "@/lib/hooks/usechat";
import { useAuthStore } from "@/lib/store/authstore";
import ChatList from "../_components/chatlist";
import ChatWindow from "../_components/chatwindow";
import { Conversation } from "@/lib/types/chat";
import LoadingSpinner from "@/app/_components/loadingspinner";

export default function ChatConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    conversations, 
    loadConversations, 
    loadingConvs,
    loadMessages,
    setCurrentConversation 
  } = useChat();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure conversations is always an array
  const conversationsArray = Array.isArray(conversations) ? conversations : [];

  // Load conversations on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (conversationsArray.length === 0) {
          await loadConversations();
        }
      } catch (err) {
        setError("Failed to load conversations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Find and set current conversation
  useEffect(() => {
    if (!id) return;

    const findConversation = async () => {
      // Try to find in existing conversations
      if (conversationsArray.length > 0) {
        const found = conversationsArray.find((c) => c?._id === id);
        if (found) {
          setConversation(found);
          setCurrentConversation(id);
          loadMessages(id);
          console.log("[ChatPage] ✅ Conversation found:", found._id);
          return;
        }
      }

      // If not found, try to fetch directly
      await fetchConversationDirectly(id);
    };

    findConversation();
  }, [id, conversationsArray]);

  // Fallback: fetch conversation directly from API
  const fetchConversationDirectly = async (convId: string) => {
    try {
      setLoading(true);
      
      // Fetch all conversations to find this one
      const res = await fetch(`http://localhost:5000/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('fc_token')}`
        }
      });
      
      const data = await res.json();
      const allConvs = Array.isArray(data.data?.data) ? data.data.data : 
                      Array.isArray(data.data) ? data.data : [];
      
      const found = allConvs.find((c: any) => c?._id === convId);
      
      if (found) {
        console.log("[ChatPage] ✅ Found conversation via direct fetch:", found._id);
        setConversation(found);
        setCurrentConversation(convId);
        loadMessages(convId);
        
        // Also update the store
        updateStoreWithConversation(found);
      } else {
        // Try to create a conversation from messages
        const messagesRes = await fetch(`http://localhost:5000/api/messages/${convId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('fc_token')}`
          }
        });
        
        const messagesData = await messagesRes.json();
        const messages = Array.isArray(messagesData.data?.data) ? messagesData.data.data : 
                        Array.isArray(messagesData.data) ? messagesData.data : [];
        
        if (messages.length > 0) {
          // Get the first message to determine participants
          const firstMsg = messages[0];
          const otherParticipant = firstMsg.sender?._id === user?.id 
            ? firstMsg.receiver 
            : firstMsg.sender;
            
          const basicConv: Conversation = {
            _id: convId,
            participants: [
              { 
                _id: user?.id || '', 
                username: user?.username || 'You',
                profileImage: user?.profileImage,
                status: 'online'
              },
              typeof otherParticipant === 'string' 
                ? { _id: otherParticipant, username: 'User', status: 'offline' }
                : {
                    _id: otherParticipant?._id || '',
                    username: otherParticipant?.username || 'User',
                    profileImage: otherParticipant?.profileImage,
                    status: otherParticipant?.status || 'offline'
                  }
            ],
            conversationType: "direct",
            lastMessageTime: firstMsg.createdAt,
            lastMessage: firstMsg
          };
          
          console.log("[ChatPage] ✅ Created conversation from messages");
          setConversation(basicConv);
          setCurrentConversation(convId);
          loadMessages(convId);
          updateStoreWithConversation(basicConv);
        } else {
          setError("Conversation not found");
        }
      }
    } catch (err) {
      console.error("[ChatPage] ❌ Error fetching conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  // Helper to update store with conversation
  const updateStoreWithConversation = (conv: Conversation) => {
    try {
      const store = JSON.parse(localStorage.getItem('chat-storage') || '{"state":{"conversations":[]}}');
      
      if (!Array.isArray(store.state.conversations)) {
        store.state.conversations = [];
      }
      
      if (!store.state.conversations.some((c: any) => c?._id === conv._id)) {
        store.state.conversations = [conv, ...store.state.conversations];
        localStorage.setItem('chat-storage', JSON.stringify(store));
        console.log("[ChatPage] ✅ Updated store with conversation");
      }
    } catch (e) {
      console.error("[ChatPage] Error updating store:", e);
    }
  };

  // Render loading state
  if (loading || loadingConvs) {
    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <ChatList conversations={conversationsArray} loading={true} activeId={id || null} />
        <div style={{ 
          flex: 1, 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1f52, #152060)" 
        }}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !conversation) {
    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <ChatList conversations={conversationsArray} loading={false} activeId={id || null} />
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1f52, #152060)" 
        }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>💬</div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              background: "rgba(74,163,195,0.2)",
              border: "1px solid rgba(74,163,195,0.3)",
              borderRadius: 8,
              color: "#4aa3c3",
              cursor: "pointer",
              fontSize: 13
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <ChatList conversations={conversationsArray} loading={false} activeId={id || null} />
      
      {conversation ? (
        <ChatWindow conversation={conversation} />
      ) : (
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          background: "linear-gradient(135deg, #0d1f52, #152060)" 
        }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>💬</div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Conversation not found</p>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 8 }}>
            ID: {id}
          </p>
        </div>
      )}
    </div>
  );
}