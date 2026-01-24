import { useState } from "react";
import "./login.css";

const Login = (props) => {
	const [input, setInput] = useState("");
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleLogin() {
		try {
			setError(null);
			if (!input.trim()) {
				setError("Token is required");
				return;
			}
			setLoading(true);
			const response = await fetch(
				"https://api.telegram.org/bot" + input + "/getMe",
			);
			if (response.ok) {
				props.setToken(input);
				setLoading(false);
			} else {
				setError("Failed to login");
				setLoading(false);
			}
		} catch (error) {
			console.error(error);
			setError("Error during login");
			setLoading(false);
		}
	}

	return (
		<div className="login-container">
			<div className="about">
				<h1>Telegram Bot Client</h1>
				<i>
					An easy way to interact with your Telegram Bot via
					Telegram-like UI
				</i>
			</div>
			<h1>Login with Bot Token</h1>
			<input
				type="password"
				placeholder="Enter your bot token"
				disabled={loading}
				value={input}
				onChange={(e) => setInput(e.target.value)}
			/>
			{error && <p className="error">{error}</p>}
			<button
				onClick={() => handleLogin()}
				disabled={loading}>
				Login
			</button>
		</div>
	);
};

export default Login;
