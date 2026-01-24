const sendMessage = async (token, body) => {
	const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	});
	const data = await response.json();
	return data;
}

export default sendMessage;