"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Send, Smile, X, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Message } from "@/lib/types/chat";
import { useSocket } from "@/lib/hooks/usesocket";
import EmojiPicker from "./emojipicker";

interface Props {
  onSend: (content: string) => void;
  onSendFile?: (file: File, caption?: string) => void;
  conversationId: string;
  receiverId: string;
  replyTo?: Message | null;
  editMsg?: Message | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onSendFile,
  conversationId,
  receiverId,
  replyTo,
  editMsg,
  onCancelReply,
  onCancelEdit,
  onTypingStart,
  onTypingStop,
  disabled = false,
}: Props) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<{ file: File; preview: string | null } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { emitTyping, emitStopTyping } = useSocket();
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Handle edit mode
  useEffect(() => {
    if (editMsg) {
      setText(editMsg.content);
      textareaRef.current?.focus();
    }
  }, [editMsg]);

  // Handle reply mode
  useEffect(() => {
    if (replyTo) {
      textareaRef.current?.focus();
    }
  }, [replyTo]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
    }
  }, []);

  // Typing handlers
  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
      emitTyping?.(conversationId);
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
      emitStopTyping?.(conversationId);
    }, 2500);
  }, [conversationId, onTypingStart, onTypingStop, emitTyping, emitStopTyping]);

  const stopTyping = useCallback(() => {
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
      emitStopTyping?.(conversationId);
    }
  }, [conversationId, onTypingStop, emitStopTyping]);

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    resizeTextarea();
    
    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Handle send message
  const handleSend = useCallback(() => {
    if (filePreview) {
      onSendFile?.(filePreview.file, text.trim() || undefined);
      setFilePreview(null);
      setText("");
      stopTyping();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      return;
    }

    const content = text.trim();
    if (!content) return;

    onSend(content);
    setText("");
    stopTyping();
    setShowEmoji(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, filePreview, onSend, onSendFile, stopTyping]);

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    if (e.key === "Escape") {
      if (editMsg) {
        onCancelEdit?.();
      } else if (replyTo) {
        onCancelReply?.();
      }
      setShowEmoji(false);
    }
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setText((t) => t + emoji);
      return;
    }

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    
    setText(newText);
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
      ta.focus();
      resizeTextarea();
      startTyping();
    });
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview({ file, preview: reader.result as string });
      reader.readAsDataURL(file);
    } else {
      setFilePreview({ file, preview: null });
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          handleFileSelect(file);
          return;
        }
      }
    }
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const canSend = !!text.trim() || !!filePreview;

  return (
    <div
      className="flex-shrink-0 relative"
      onDragOver={(e) => { 
        e.preventDefault(); 
        setIsDragging(true); 
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { 
        e.preventDefault(); 
        setIsDragging(false); 
        const file = e.dataTransfer.files[0]; 
        if (file) handleFileSelect(file); 
      }}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none rounded-2xl"
          style={{
            background: "rgba(74,163,195,0.12)",
            border: "2px dashed var(--brand-blue)",
            backdropFilter: "blur(4px)",
          }}
        >
          <p className="font-semibold" style={{ color: "var(--brand-blue)" }}>
            Drop file to send
          </p>
        </div>
      )}

      <div 
        className="p-3"
        style={{ 
          borderTop: "1px solid var(--border)", 
          background: "var(--bg-primary)",
        }}
      >
        {/* Reply/Edit indicator */}
        {(replyTo || editMsg) && (
          <div 
            className="mb-2 px-3 py-2 rounded-xl flex items-center justify-between text-xs"
            style={{ 
              background: "rgba(74,163,195,0.08)", 
              border: "1px solid var(--border-hover)" 
            }}
          >
            <div className="min-w-0 flex-1">
              <p 
                className="font-bold mb-0.5"
                style={{ 
                  color: editMsg ? "var(--brand-blue)" : "var(--brand-cyan)" 
                }}
              >
                {editMsg ? "✏️ Editing message" : `↩️ Replying to ${
                  typeof replyTo?.sender === "string" 
                    ? "message" 
                    : replyTo?.sender?.username
                }`}
              </p>
              <p className="truncate" style={{ color: "var(--text-secondary)" }}>
                {editMsg?.content || (replyTo?.isDeleted ? "Deleted message" : replyTo?.content)}
              </p>
            </div>
            <button 
              onClick={editMsg ? onCancelEdit : onCancelReply}
              className="ml-3 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* File preview */}
        {filePreview && (
          <div 
            className="mb-2 p-2 rounded-xl flex items-center gap-3"
            style={{ 
              background: "rgba(74,163,195,0.06)", 
              border: "1px solid var(--border-hover)" 
            }}
          >
            {filePreview.preview ? (
              <Image 
                src={filePreview.preview} 
                alt="preview" 
                width={48} 
                height={48}
                className="rounded-lg object-cover w-12 h-12 flex-shrink-0"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(74,163,195,0.1)" }}
              >
                <FileText className="w-6 h-6" style={{ color: "var(--brand-blue)" }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{filePreview.file.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {Math.round(filePreview.file.size / 1024)}KB
              </p>
            </div>
            <button 
              onClick={() => setFilePreview(null)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Emoji button */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowEmoji((s) => !s)}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{ 
                background: showEmoji ? "rgba(74,163,195,0.15)" : "var(--bg-input)", 
                color: showEmoji ? "var(--brand-blue)" : "var(--text-muted)" 
              }}
            >
              <Smile className="w-4 h-4" />
            </button>
            
            {/* Emoji picker */}
            {showEmoji && (
              <EmojiPicker 
                onSelect={insertEmoji} 
                onClose={() => setShowEmoji(false)} 
              />
            )}
          </div>

          {/* File attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-all"
            style={{ 
              background: "var(--bg-input)", 
              color: "var(--text-muted)" 
            }}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
            className="hidden"
            onChange={(e) => { 
              const file = e.target.files?.[0]; 
              if (file) handleFileSelect(file); 
              e.target.value = ""; 
            }}
          />

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={filePreview ? "Add a caption..." : "Type a message..."}
            rows={1}
            disabled={disabled}
            className="fc-input flex-1 resize-none py-2.5 pr-3"
            style={{ 
              minHeight: 44, 
              maxHeight: 140, 
              lineHeight: 1.5,
              scrollbarWidth: "thin",
            }}
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend || disabled}
            className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: canSend ? "var(--grad-btn)" : "var(--bg-input)",
              color: "#fff",
              boxShadow: canSend ? "var(--shadow-glow)" : "none",
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Hint text */}
        <p 
          className="text-[10px] mt-1.5 text-center" 
          style={{ color: "var(--text-muted)", opacity: 0.6 }}
        >
          Enter to send · Shift+Enter new line · Right-click message for options
        </p>
      </div>
    </div>
  );
}