import async from "async";

export default async (data = null, filename = "file", extra = []) => {
	let result, ctr, keys;

	if (data === null || !data.length) {
		return null;
	}

	keys = Object.keys(data[0]).filter(x => !x.endsWith("ID"));

	result = "";
	result += keys.join(", ");
	result += "\n";

	await async.eachOfSeries(data, (item, key, callback) => {
		ctr = 0;
		keys.forEach(key => {
			if (key.endsWith("ID")) return;
			if (ctr > 0) {
				result += ", ";
			}

			result += typeof item[key] === "string" && item[key].includes(", ") ? `"${item[key]}"` : item[key];
			ctr++;
		});
		result += "\n";
		callback();
	});

	if (extra.length){
		result += "\n\n";
		await async.eachOfSeries(extra, async (item, key, callback1) => {
			result += item;
			result += "\n";
			callback1();
		});
	}

	const hiddenElement = document.createElement("a");
	hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURIComponent(result);
	hiddenElement.target = "_blank";
	hiddenElement.download = filename + ".csv";
	return hiddenElement.click();
}