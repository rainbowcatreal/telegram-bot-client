const sendMessage = async (token, photos = [], files = [], body) => {
	let lastResult = null;

	if (photos.length > 1) {
		const formData = new FormData();
		formData.append("chat_id", body.chat_id);

		const media = photos.map((file, index) => {
			const mediaItem = {
				type: "photo",
				media: `attach://photo_${index}`,
			};
			if (index === 0 && body.text) {
				mediaItem.caption = body.text;
				mediaItem.parse_mode = "Markdown";
			}
			return mediaItem;
		});

		formData.append("media", JSON.stringify(media));

		photos.forEach((file, index) => {
			formData.append(`photo_${index}`, file);
		});

		const response = await fetch(
			`https://api.telegram.org/bot${token}/sendMediaGroup`,
			{
				method: "POST",
				body: formData,
			},
		);
		const data = await response.json();
		if (data.ok) lastResult = data.result[data.result.length - 1];
	} else if (photos.length === 1) {
		const formData = new FormData();
		formData.append("chat_id", body.chat_id);
		formData.append("photo", photos[0]);

		if (body.text) {
			formData.append("caption", body.text);
			formData.append("parse_mode", "Markdown");
		}

		const response = await fetch(
			`https://api.telegram.org/bot${token}/sendPhoto`,
			{
				method: "POST",
				body: formData,
			},
		);
		const data = await response.json();
		if (data.ok) lastResult = data.result;
	}

	if (files.length > 0) {
		for (const file of files) {
			const formData = new FormData();
			formData.append("chat_id", body.chat_id);
			formData.append("document", file);

			if (body.text && !photos.length && files.indexOf(file) === 0) {
				formData.append("caption", body.text);
				formData.append("parse_mode", "Markdown");
			}

			const response = await fetch(
				`https://api.telegram.org/bot${token}/sendDocument`,
				{
					method: "POST",
					body: formData,
				},
			);
			const data = await response.json();
			if (data.ok) lastResult = data.result;
		}
	}

	if (!photos.length && !files.length && body.text?.trim()) {
		const response = await fetch(
			`https://api.telegram.org/bot${token}/sendMessage`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					chat_id: body.chat_id,
					text: body.text,
					parse_mode: "Markdown",
				}),
			},
		);
		const data = await response.json();
		lastResult = data.result;
	}

	return lastResult;
};

export default sendMessage;
