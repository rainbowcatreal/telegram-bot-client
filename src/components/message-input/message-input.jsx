import { useState, useRef } from "react";
import "./message-input.css";

import sendIcon from "./send-icon.svg";
import photoIcon from "./photo-icon.svg";
import documentIcon from "./document-icon.svg";

const MessageInput = (props) => {
	const [input, setInput] = useState("");
	const [disabled, setDisabled] = useState(false);
	const [photos, setPhotos] = useState([]);
	const [documents, setDocuments] = useState([]);

	async function handleSendMessage() {
		if (input.trim() || photos.length > 0 || documents.length > 0) {
			setDisabled(true);
			await props.onSendMessage(input, photos, documents);
			setInput("");
			setPhotos([]);
			setDocuments([]);
			if (props.replyToMessageData && props.setReplyToMessageData) {
				props.setReplyToMessageData(null);
			}
			setDisabled(false);
		}
	}

	function handlePhotoUploadChange(event) {
		const selectedFiles = Array.from(event.target.files);

		const imagesOnly = selectedFiles.filter((file) =>
			file.type.startsWith("image/"),
		);

		if (imagesOnly.length < selectedFiles.length) {
			alert("Some files were skipped because they aren't images");
		}

		setPhotos((prev) => [...prev, ...imagesOnly]);
	}

	function handleDocumentUploadChange(event) {
		const selectedFiles = Array.from(event.target.files);
		setDocuments((prev) => [...prev, ...selectedFiles]);
	}

	return (
		<>
			<div className="reply-to-message-container">
				{props.replyToMessageData && (
					<div className="reply-message" onClick={() => {props.setReplyToMessageData(null)}}>
						<span className="reply-name">
							{props.replyToMessageData.from?.first_name ?
								`Reply to ${props.replyToMessageData.from.first_name}` :
								"Reply to message"}
						</span>
						<br />
						<span className="reply-text">
							{props.replyToMessageData.text || props.replyToMessageData.caption || "No text"}
						</span>
					</div>
				)}
			</div>
			<div className="controls">
				<input
					type="file"
					id="photo-upload"
					multiple
					accept="image/*"
					style={{ display: "none" }}
					onChange={handlePhotoUploadChange}
				/>
				<label
					htmlFor="photo-upload"
					className="attach-button">
					<img src={photoIcon} />
					{photos.length > 0 && (
						<span className="badge">{photos.length}</span>
					)}
				</label>

				<input
					type="file"
					id="document-upload"
					multiple
					style={{ display: "none" }}
					onChange={handleDocumentUploadChange}
				/>
				<label
					htmlFor="document-upload"
					className="attach-button">
					<img src={documentIcon} />
					{documents.length > 0 && (
						<span className="badge">{documents.length}</span>
					)}
				</label>

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
			</div>
		</>
	);
};

export default MessageInput;
