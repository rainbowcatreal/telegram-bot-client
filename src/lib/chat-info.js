const getChatMembersCount = async (token, chatId) => {
	const response = await fetch(
		`https://api.telegram.org/bot${token}/getChatMembersCount?chat_id=${chatId}`,
	);
	const data = await response.json();
	return data.result;
};

export { getChatMembersCount };
