import { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { getPhoto, getProfileLink } from "../../lib/assets";
import { getChatMembersCount } from "../../lib/chat-info";
import "./chat-content.css";
import Message from "../message/message";
import MessageInput from "../message-input/message-input";
import sendMessage from "../../lib/send-message";
import ErrorBoundary from "../protect/protect.jsx"

const ChatContent = (props) => {
	const [messages, setMessagesState] = useState(
		localStorage.getItem("tg-bot-messages")
			? JSON.parse(localStorage.getItem("tg-bot-messages"))
			: {},
	);
	const [photos, setPhotos] = useState({});
	const [chatNames, setChatNames] = useState({});
	const [chatMembersCount, setChatMembersCount] = useState({});
	const [replyToMessageData, setReplyToMessageData] = useState(null);
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
				const msg = update.message || update.edited_message || update.channel_post || update.edited_channel_post;
				if (!msg) continue;

				const cid = msg.chat.id;

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

					const isChannel = "sender_chat" in msg;
						//msg.from?.id === 777000 ||
						//msg.from?.username === "Channel_Bot" ||
         //msg.from?.username === "GroupAnonymousBot";
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
						"sender_chat" in m
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
		const data = await sendMessage(props.token, replyToMessageData, photos, documents, {
			chat_id: props.chatId,
			text,
			reply_to_message_id: replyToMessageData?.message_id,
			parse_mode: "Markdown",
		});
		if (!data) return;
		setMessages((prev) => ({
			...prev,
			[props.chatId]: [
				...(prev[props.chatId] || []),
				data,
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

	function handleReplyToMessage(messageId) {
		const message = messages[props.chatId]?.find(m => m.message_id === messageId);
		if (message) {
			setReplyToMessageData(message);
		}
	}

	useEffect(() => setReplyToMessageData(null), [props.chatId]);

	const currentMessages = messages[props.chatId] || [];

	return (
		<div className="chat-content">
			{!props.chatId ? (
				<div className="no-messages">
					Выберите чат, чтобы начать общение
				</div>
			) : currentMessages.length === 0 ? (
				<div className="no-messages">Тут пока нет сообщений...</div>
			) : (
				<>
					<div className="chat-header">
						<h1>{chatNames[props.chatId]}</h1>
						<span>{chatMembersCount[props.chatId]} участников</span>
					</div>
					<div className="messages-list">
						{currentMessages.map((msg) =>
            <ErrorBoundary>
              <Message message={msg} photo={photos[props.chatId]?.[msg.message_id]} />
            </ErrorBoundary>
						)}
						<div ref={scrollRef} />
					</div>
					<div className="message-input-container">
						<MessageInput
							chatName={chatNames[props.chatId]}
							token={props.token}
							onSendMessage={handleSendMessage}
							replyToMessageData={replyToMessageData}
							setReplyToMessageData={setReplyToMessageData}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default ChatContent;