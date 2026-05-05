import { useState, useEffect } from "react";
import classNames from "classnames";
import { getProfileLink } from "../../lib/assets";
import Chat from "../chat/chat.jsx";
import "./chats.css";

const Chats = (props) => {
  const [chats, setChats] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleNewUpdates = (event) => {
      const newUpdates = event.detail;

      for (const update of newUpdates) {
        const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;
        if (msg && msg.chat) {
          setLastMessages((prev) => ({
            ...prev,
            [msg.chat.id]: {
              text:
                msg.text ||
                msg.caption ||
                (msg.photo ? "📷 Фото" : "🔗 Вложение"),
              sender:
                "sender_chat" in msg
                  ? msg.sender_chat?.title
                  : msg?.from?.first_name || "Неизвестный",
              date: msg?.date
            },
          }));
          setChats((prev) => {
            const exists = prev.find((c) => c.id === msg.chat.id);
            const otherChats = prev.filter(
              (c) => c.id !== msg.chat.id,
            );
            if (exists) {
              return [exists, ...otherChats];
            }

            const newChat = { ...msg.chat, photoUrl: null };

            getProfileLink(
              props.token,
              msg.chat.id,
              msg.chat.type !== "private",
            ).then((url) => {
              if (url) {
                setChats((current) =>
                  current.map((c) =>
                    c.id === msg.chat.id
                      ? { ...c, photoUrl: url }
                      : c,
                  ),
                );
              }
            });

            return [newChat, ...prev];
          });
        }
      }
    };

    window.addEventListener("tg-updates", handleNewUpdates);
    return () => window.removeEventListener("tg-updates", handleNewUpdates);
  }, [props.token]);

  return (
    <div className="chat-sidebar">
      <div className="chat-sidebar-header">
        <input
          type="text"
          placeholder="Поиск чатов..."
          className="search-input"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {chats.length === 0 ? (
        <div className="no-chats">Чаты не найдены</div>
      ) : (
        <ul>
          {chats
            .filter(
              (chat) =>
                chat.title
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                chat.first_name
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()),
            )
            .map((chat) => (
              <Chat key={chat.id} chat={chat} lastMessage={lastMessages[chat.id]} selectChat={props.onChatSelect} selected={props.selectedChatId == chat.id} />
            ))}
        </ul>
      )}
    </div>
  );
};

export default Chats;
