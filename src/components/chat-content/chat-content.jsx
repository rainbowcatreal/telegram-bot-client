import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { getPhoto, getProfileLink } from "../../lib/assets";
import { getChatMembersCount } from "../../lib/chat-info";
import "./chat-content.css";
import MessageInput from "../message-input/message-input";
import sendMessage from "../../lib/send-message";

const ChatContent = (props) => {
	const [messages, setMessagesState] = useState(
		localStorage.getItem("tg-bot-messages")
			? JSON.parse(localStorage.getItem("tg-bot-messages"))
			: {},
	);
	const [photos, setPhotos] = useState({});
	const [chatNames, setChatNames] = useState({});
	const [chatMembersCount, setChatMembersCount] = useState({});
	const scrollRef = useRef(null);

	function setMessages(callback) {
		setMessagesState((prev) => {
			const nextState = callback(prev);
			localStorage.setItem("tg-bot-messages", JSON.stringify(nextState));
			return nextState;
		});
	}

	useEffect(() => {
		const handleNewUpdates = async (event) => {
			const newUpdates = event.detail;

			let chatNameUpdates = {};
			let countUpdates = {};

			for (const update of newUpdates) {
				const msg = update.message || update.edited_message;
				if (!msg) continue;

				const cid = msg.chat.id;
				const senderId = msg.from?.id;

				chatNameUpdates[cid] =
					msg.chat.title || msg.chat.first_name || "Unknown chat";

				const count = await getChatMembersCount(props.token, cid);
				countUpdates[cid] = count;

				if (msg.photo) {
					getPhoto(props.token, msg).then((url) => {
						if (url)
							setPhotos((prev) => ({
								...prev,
								[cid]: { ...prev[cid], [msg.message_id]: url },
							}));
					});
				}

				setMessages((prev) => {
					const currentChatMsgs = prev[cid] || [];
					if (
						currentChatMsgs.some(
							(m) => m.message_id === msg.message_id,
						)
					)
						return prev;

					const newMessage = { ...msg, photoUrl: null };

					const isChannel =
						msg.from?.id === 777000 ||
						msg.from?.username === "Channel_Bot";
					const effectiveSenderId = isChannel
						? msg.sender_chat?.id
						: msg.from?.id;

					if (effectiveSenderId) {
						getProfileLink(
							props.token,
							effectiveSenderId,
							isChannel,
						).then((url) => {
							if (url)
								updateMessageAvatar(
									cid,
									effectiveSenderId,
									url,
								);
						});
					}

					return { ...prev, [cid]: [...currentChatMsgs, newMessage] };
				});
			}

			setChatNames((prev) => ({ ...prev, ...chatNameUpdates }));
			setChatMembersCount((prev) => ({ ...prev, ...countUpdates }));
		};

		const updateMessageAvatar = (cid, targetId, url) => {
			setMessages((latest) => ({
				...latest,
				[cid]: (latest[cid] || []).map((m) => {
					const currentSenderId =
						m.from?.id === 777000 ||
						m.from.username === "Channel_Bot"
							? m.sender_chat?.id
							: m.from?.id;
					return currentSenderId === targetId
						? { ...m, photoUrl: url }
						: m;
				}),
			}));
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
	}

	async function handleSendMessage(text, photos, documents) {
		const data = await sendMessage(props.token, photos, documents, {
			chat_id: props.chatId,
			text,
			parse_mode: "Markdown",
		});
		if (!data) return;
		setMessages((prev) => ({
			...prev,
			[props.chatId]: [
				...(prev[props.chatId] || []),
				{
					message_id: data.message_id,
					text,
					from: { me: true },
				},
			],
		}));
		if (photos.length > 0) {
			const localUrl = URL.createObjectURL(photos[0]);
			setPhotos((prev) => ({
				...prev,
				[props.chatId]: {
					...prev[props.chatId],
					[data.message_id]: localUrl,
				},
			}));
		}
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
										{photos[props.chatId]?.[
											msg.message_id
										] ? (
											<img
												src={
													photos[props.chatId][
														msg.message_id
													]
												}
												className="chat-image"
											/>
										) : null}

										{(msg.text || msg.caption) && (
											<p className="message-text">
												{msg.text || msg.caption}
											</p>
										)}

										{!msg.text &&
											!msg.caption &&
											!photos[props.chatId]?.[
												msg.message_id
											] && (
												<i>Unsupported message type</i>
											)}
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
											(msg.from.id === 777000 ||
											msg.from.username === "Channel_Bot"
												? msg.sender_chat.title
												: msg.from?.first_name ||
													"?")[0]
										)}
									</div>
									<div className="message-info">
										<span className="sender-name">
											{msg.from.id === 777000 ||
											msg.from.username === "Channel_Bot"
												? msg.sender_chat.title
												: msg.from?.first_name}
										</span>

										{msg.reply_to_message && (
											<div
												className="reply-message"
												onClick={() =>
													scrollToMessage(
														msg.reply_to_message
															.message_id,
													)
												}
												style={{ cursor: "pointer" }}>
												<span className="reply-name">
													{msg.reply_to_message.from
														?.first_name ||
														"Unknown"}
												</span>
												<br />
												{msg.reply_to_message.text ||
													msg.reply_to_message
														.caption ||
													"No text"}
											</div>
										)}

										{photos[props.chatId]?.[
											msg.message_id
										] ? (
											<img
												src={
													photos[props.chatId][
														msg.message_id
													]
												}
												className="chat-image"
											/>
										) : null}

										{(msg.text || msg.caption) && (
											<p className="message-text">
												{msg.text || msg.caption}
											</p>
										)}

										{!msg.text &&
											!msg.caption &&
											!msg.photo && (
												<i>Unsupported message type</i>
											)}
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
