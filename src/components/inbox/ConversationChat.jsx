"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineChatAlt2,
  HiOutlinePaperClip,
  HiOutlineEmojiHappy,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineDotsHorizontal,
} from "react-icons/hi";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import styles from "./ConversationChat.module.css";

export default function ConversationChat({
  conversation = null,
  platform = null,
  messages = [],
  onSendMessage,
}) {
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setDraft("");
    setPendingFiles([]);
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.id, messages.length]);

  if (!conversation) {
    return (
      <section className={styles.chat} aria-label="Conversation">
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <HiOutlineChatAlt2 />
          </span>
          <h2 className={styles.emptyTitle}>Select a chat</h2>
          <p className={styles.emptySubtitle}>
            Choose a conversation from the list to start messaging.
          </p>
        </div>
      </section>
    );
  }

  const handleAttach = (event) => {
    const files = Array.from(event.target.files || []).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size:
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setPendingFiles((prev) => [...prev, ...files]);
    event.target.value = "";
  };

  const removePendingFile = (id) => {
    setPendingFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text && pendingFiles.length === 0) return;

    onSendMessage?.({
      text: text || (pendingFiles.length ? "Sent an attachment" : ""),
      attachments: pendingFiles.length ? pendingFiles : undefined,
    });
    setDraft("");
    setPendingFiles([]);
  };

  return (
    <section className={styles.chat} aria-label="Conversation">
      <div className={styles.thread}>
        <header className={styles.threadHeader}>
          <div className={styles.threadIdentity}>
            <Avatar name={conversation.name} size="sm" status="online" />
            <div className={styles.threadMeta}>
              <h2 className={styles.threadName}>{conversation.name}</h2>
              <p className={styles.threadSub}>
                {conversation.phone}
                {platform && (
                  <>
                    <span className={styles.dotSep}>•</span>
                    <span className={styles.platform} data-tone={platform.tone}>
                      {platform.label}
                    </span>
                  </>
                )}
                <span className={styles.dotSep}>•</span>
                {conversation.agent}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={HiOutlineDotsHorizontal}
            aria-label="Conversation actions"
          />
        </header>

        <div className={styles.messages} tabIndex={0}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.messageRow} data-from={msg.from}>
              <div className={styles.bubble}>
                <p className={styles.bubbleText}>{msg.text}</p>
                {msg.attachments?.length > 0 && (
                  <ul className={styles.attachmentList}>
                    {msg.attachments.map((file) => (
                      <li key={file.id} className={styles.attachmentChip}>
                        <HiOutlinePhotograph aria-hidden="true" />
                        <span>{file.name}</span>
                        <em>{file.size}</em>
                      </li>
                    ))}
                  </ul>
                )}
                <time className={styles.bubbleTime}>{msg.time}</time>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <footer className={styles.composer}>
          {pendingFiles.length > 0 && (
            <ul className={styles.pendingFiles}>
              {pendingFiles.map((file) => (
                <li key={file.id} className={styles.pendingFile}>
                  <HiOutlinePaperClip aria-hidden="true" />
                  <span>{file.name}</span>
                  <em>{file.size}</em>
                  <button
                    type="button"
                    className={styles.removeFile}
                    onClick={() => removePendingFile(file.id)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <HiOutlineX />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.composerRow}>
            <input
              ref={fileInputRef}
              type="file"
              className={styles.hiddenFile}
              multiple
              onChange={handleAttach}
            />
            <button
              type="button"
              className={styles.iconAction}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Add attachment"
            >
              <HiOutlinePaperClip />
            </button>
            <button
              type="button"
              className={styles.iconAction}
              aria-label="Emoji"
            >
              <HiOutlineEmojiHappy />
            </button>
            <input
              type="text"
              className={styles.composerInput}
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              aria-label="Message"
            />
            <Button size="sm" onClick={sendMessage}>
              Send
            </Button>
          </div>
        </footer>
      </div>
    </section>
  );
}
