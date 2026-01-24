import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { getProfileLink } from "../../lib/assets";
import { getChatMembersCount } from "../../lib/chat-info";
import "./chat-content.css";
import MessageInput from "../message-input/message-input";
import sendMessage from "../../lib/send-message";

const ChatContent = (props) => {
	const [messages, setMessages] = useState({});
	const [chatNames, setChatNames] = useState({});
	const [chatMembersCount, setChatMembersCount] = useState({});
	const scrollRef = useRef(null);

	useEffect(() => {
		const handleNewUpdates = (event) => {
			const newUpdates = event.detail;

			newUpdates.forEach((update) => {
				const msg = update.message || update.edited_message;
				if (!msg) return;

				const cid = msg.chat.id;
				const senderId = msg.from?.id;

				setChatNames((prev) => ({
					...prev,
					[cid]:
						msg.chat.title || msg.chat.first_name || "Unknown chat",
				}));

				getChatMembersCount(props.token, cid).then((count) => {
					setChatMembersCount((prev) => ({
						...prev,
						[cid]: count,
					}));
				});

				setMessages((prev) => {
					const currentChatMsgs = prev[cid] || [];

					if (
						currentChatMsgs.find(
							(m) => m.message_id === msg.message_id,
						)
					)
						return prev;

					const newMessage = { ...msg, photoUrl: null };

					if (senderId) {
						getProfileLink(props.token, senderId, false).then(
							(url) => {
								if (url) {
									setMessages((latest) => ({
										...latest,
										[cid]: latest[cid].map((m) =>
											m.from?.id === senderId
												? { ...m, photoUrl: url }
												: m,
										),
									}));
								}
							},
						);
					}

					return {
						...prev,
						[cid]: [...currentChatMsgs, newMessage],
					};
				});
			});
		};

		window.addEventListener("tg-updates", handleNewUpdates);
		return () => window.removeEventListener("tg-updates", handleNewUpdates);
	}, [props.token]);

	useEffect(() => {
		if (scrollRef.current) {
			// Note for me: "smooth" makes it glide, "auto" makes it instant
			scrollRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages, props.chatId]);


	function scrollToMessage(targetId) {
		const element = document.getElementById(`msg-${targetId}`);
		console.log(element, targetId);
		if (element) {
			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
			element.classList.add("highlight-flash");
			setTimeout(() => {
				element.classList.remove("highlight-flash");
			}, 2000);
		} else {
			console.warn("Message to jump not found");
		}
	};

	async function handleSendMessage(toSend) {
		const data = await sendMessage(props.token, {
			chat_id: props.chatId,
			text: toSend,
		});
		setMessages((prev) => ({
			...prev,
			[props.chatId]: [
				...(prev[props.chatId] || []),
				{
					message_id: data.message_id,
					text: toSend,
					from: { me: true },
				},
			],
		}));
	}

	const currentMessages = messages[props.chatId] || [];

	return (
		<div className="chat-content">
			{!props.chatId ? (
				<div className="no-messages">
					Select a chat to start messaging
				</div>
			) : currentMessages.length === 0 ? (
				<div className="no-messages">No messages here yet...</div>
			) : (
				<>
					<div className="chat-header">
						<h1>{chatNames[props.chatId]}</h1>
						<span>{chatMembersCount[props.chatId]} members</span>
					</div>
					<div className="messages-list">
						{currentMessages.map((msg) =>
							msg.from.me ? (
								<div
									key={msg.message_id}
									id={`msg-${msg.message_id}`}
									className={classNames("message", {
										sent: true,
									})}>
									<div className="message-info">
										<p className="message-text">
											{msg.text}
										</p>
									</div>
								</div>
							) : (
								<div
									key={msg.message_id}
									id={`msg-${msg.message_id}`}
									className="message">
									<div className="message-avatar">
										{msg.photoUrl ? (
											<img
												src={msg.photoUrl}
												className="avatar-img"
												alt="avatar"
											/>
										) : (
											(msg.from?.first_name || "?")[0]
										)}
									</div>
									<div className="message-info">
										<span className="sender-name">
											{msg.from?.first_name}
										</span>
										{msg.reply_to_message && (
											<div
												className="reply-message"
												onClick={() => scrollToMessage(msg.reply_to_message.message_id)}
                    							style={{ cursor: "pointer" }}
											>
												<span className="reply-name">
													{msg.reply_to_message.from?.first_name || "Unknown"}
												</span>
												<br />
												{msg.reply_to_message.text}
											</div>
										)}
										<p className="message-text">
											{msg.text}
										</p>
									</div>
								</div>
							),
						)}
						<div ref={scrollRef} />
					</div>
					<div className="message-input-container">
						<MessageInput
							chatName={chatNames[props.chatId]}
							token={props.token}
							onSendMessage={handleSendMessage}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default ChatContent;
