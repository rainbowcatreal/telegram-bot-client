import { useState, useEffect } from "react";
import classNames from "classnames";
import { getProfileLink } from "../../lib/assets";
import "./chats.css";

const Chats = (props) => {
	const [chats, setChats] = useState([]);
	const [lastMessages, setLastMessages] = useState({});

	useEffect(() => {
		const handleNewUpdates = (event) => {
			const newUpdates = event.detail;

			for (const update of newUpdates) {
				const msg = update.message || update.edited_message;
				if (msg && msg.chat) {
					setLastMessages((prev) => ({
						...prev,
						[msg.chat.id]: {
							text:
								msg.text ||
								(msg.photo ? "📷 Photo" : "🔗 Attachment"),
							sender: msg.from?.first_name || "Unknown",
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
		<div className="chats-container">
			<h1>Chats</h1>
			{chats.length === 0 ? (
				<div className="no-chats">No chats found</div>
			) : (
				<ul>
					{chats.map((chat) => (
						<li
							key={chat.id}
							className={classNames("chat-item", {
								selected: props.selectedChatId === chat.id,
							})}
							onClick={() => props.onChatSelect(chat.id)}>
							<div className="chat-avatar">
								{chat.photoUrl ? (
									<img
										src={chat.photoUrl}
										className="avatar-img"
									/>
								) : (
									(chat.title || chat.first_name || "?")[0]
								)}
							</div>
							<div className="chat-info">
								<h3 className="chat-name">
									{chat.title ||
										`${chat.first_name || ""} ${chat.last_name || ""}`}
								</h3>
								<p className="chat-last-message">
									{lastMessages[chat.id]?.sender +
										": " +
										lastMessages[chat.id]?.text ||
										chat.type}
								</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default Chats;
