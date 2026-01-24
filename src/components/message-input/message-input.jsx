import { useState } from "react";
import "./message-input.css";

import sendIcon from "./send-icon.svg";

const MessageInput = (props) => {
	const [input, setInput] = useState("");
	const [disabled, setDisabled] = useState(false);

	async function handleSendMessage() {
		if (input.trim()) {
			setDisabled(true);
			await props.onSendMessage(input);
			setInput("");
			setDisabled(false);
		}
	}

	return (
		<>
			<input
				type="text"
				className="message-input"
				placeholder={`Write a message in ${props.chatName}...`}
				disabled={disabled}
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
			/>
			<button
				className="send-button"
				disabled={disabled}
				onClick={handleSendMessage}>
				<img
					src={sendIcon}
					className="send-icon"
				/>
			</button>
		</>
	);
};

export default MessageInput;
