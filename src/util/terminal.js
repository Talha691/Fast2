const url = "https://us-central1-fast-in-transit.cloudfunctions.net/terminal";

const terminal = window.StripeTerminal.create({
	onFetchConnectionToken: fetchConnectionToken,
	onUnexpectedReaderDisconnect: unexpectedDisconnect,
});

function unexpectedDisconnect() {
	// In this function, your app should notify the user that the reader disconnected.
	// You can also include a way to attempt to reconnect to a reader.
}

function fetchConnectionToken() {
	// Do not cache or hardcode the ConnectionToken. The SDK manages the ConnectionToken's lifecycle.
	return fetch(`${url}/connection_token`, { method: "POST" })
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			return data.secret;
		});
}

export async function disconnect() {
	terminal.disconnectReader();
}

// Handler for a "Discover readers" button
export async function discover() {
	let config = { simulated: false };
	// Simulation
	// config = {simulated: true};
	// terminal.setSimulatorConfiguration({testCardNumber: "4242424242424242"}); // OK
	// terminal.setSimulatorConfiguration({testCardNumber: "4000002760003184"}); // Verification Required
	// terminal.setSimulatorConfiguration({testCardNumber: "4000000000000002"}); // Decline Code

	const discoverResult = await terminal.discoverReaders(config);
	if (discoverResult.error) {
		throw discoverResult.error;
	} else if (discoverResult.discoveredReaders.length === 0) {
		throw Error("No available readers");
	}

	const connectResult = await terminal.connectReader(discoverResult.discoveredReaders[0]);
	if (connectResult.error) {
		throw connectResult.error;
	}
}

function fetchPaymentIntentClientSecret(amount) {
	const bodyContent = JSON.stringify({ amount: amount });
	return fetch(`${url}/create_payment_intent`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: bodyContent,
	})
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			return data.client_secret;
		});
}

export async function collect(amount) {
	const secret = await fetchPaymentIntentClientSecret(amount);

	const result = await terminal.collectPaymentMethod(secret);
	if (result.error) {
		throw result.error;
	} else {
		const processPayment = await terminal.processPayment(result.paymentIntent);
		if (processPayment.error) {
			throw processPayment.error;
		} else if (processPayment.paymentIntent) {
			const paymentIntent = await fetch(`${url}/capture_payment_intent`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: processPayment.paymentIntent.id }),
			});

			return await paymentIntent.json();
		}
	}
}
