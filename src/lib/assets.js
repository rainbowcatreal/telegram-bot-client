export const getProfileLink = async (token, chatId, isGroup) => {
	try {
		const method = isGroup ? "getChat" : "getUserProfilePhotos";
		const params = isGroup
			? `chat_id=${chatId}`
			: `user_id=${chatId}&limit=1`;

		const res = await fetch(
			`https://api.telegram.org/bot${token}/${method}?${params}`,
		);
		const data = await res.json();

		if (!data.ok) return null;

		let fileId;
		if (isGroup) {
			fileId = data.result.photo?.big_file_id;
		} else {
			fileId = data.result.photos?.[0]?.[0]?.file_id;
		}

		if (!fileId) return null;

		const fileRes = await fetch(
			`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
		);
		const fileData = await fileRes.json();

		if (fileData.ok) {
			return `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
		}
	} catch (e) {
		console.error("Photo fetch error:", e);
	}
	return null;
};
