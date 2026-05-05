let instanceRunning = false;

const longPolling = async (token) => {
	if (instanceRunning || !token) return;
	instanceRunning = true;
	let lastUpdateId = 0;

	while (true) {
		try {
			const response = await fetch(
				`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`,
			);
			const data = await response.json();

			if (data.ok && data.result.length > 0) {
				lastUpdateId = Math.max(...data.result.map((u) => u.update_id));
      console.log(data.result);

				const event = new CustomEvent("tg-updates", {
					detail: data.result,
				});
				window.dispatchEvent(event);
			}
		} catch (error) {
			console.error("Polling error:", error);
			await new Promise((r) => setTimeout(r, 5000));
		}
	}
};

export default longPolling;
