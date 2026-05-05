import { useEffect, useState } from "react";
import Chats from "./components/chats/chats.jsx";
import ChatContent from "./components/chat-content/chat-content.jsx";
import Login from "./components/login/login.jsx";
import longPolling from "./lib/long-polling.js";
import "./App.css";

const App = () => {
	const [token, setTokenState] = useState(
		localStorage.getItem("tg-bot-token"),
	);
	const [activeChatId, setActiveChatId] = useState(null);

	useEffect(() => {
		if (token) {
			longPolling(token);
		}
	}, [token]);

	const handleSetToken = (newToken) => {
		localStorage.setItem("tg-bot-token", newToken);
		setTokenState(newToken);
	};

	return (
		<div className="app-viewport">
			{token ? (
				<>
					<Chats
						token={token}
         setToken={handleSetToken}
						onChatSelect={(id) => setActiveChatId(id)}
						selectedChatId={activeChatId}
					/>
					<ChatContent
						token={token}
						chatId={activeChatId}
					/>
				</>
			) : (
				<div className="login-container">
					<Login setToken={handleSetToken} />
				</div>
			)}
		</div>
	);
};

export default App;
