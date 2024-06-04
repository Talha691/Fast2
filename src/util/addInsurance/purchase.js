import {firestore, functions} from "../../firebase/firebase";
import {CardElement} from "@stripe/react-stripe-js";
import {collect, disconnect, discover} from "../terminal";

export default (state, props,paymentMethodId) => {
	return new Promise(async (resolve, reject) => {
		const doc = await firestore.doc("agents/" + props.auth.uid).get()
		const customerId=doc.data().stripe
		const credit = doc.data().credit
		if (props.configuration === "credit") {
			return resolve({receipt: null, charge: null, method: "Credit", methodSource: null});
		}
		if (credit) {
			return resolve({receipt: null, charge: null, method: "Credit", methodSource: null});
		}

		// Terminal Configuration
		if (state.terminal){
			try {
				await discover();
				const paymentIntent = await collect(state.total);
				await disconnect();
				return resolve({receipt: paymentIntent.id, charge: null, method: "Card", methodSource: "Stripe"});
			} catch (e) {
				await disconnect();
				return reject({
					title: "Stripe Terminal Error",
					content: e.message,
				})
			}
		}

		// Stripe Configuration
		if (props.configuration === "stripe") {
			return resolve({receipt: paymentMethodId, charge: null, method: "Card", methodSource: "Autorize.net"});
			/*const paymentIntent = await functions.httpsCallable("paymentIntent")({
				amount: state.total,
				stripeCustomerId:customerId,
				paymentMethodId:paymentMethodId
			});

			// Submit Payment
			return props.stripe.confirmCardPayment(paymentIntent.data, {
				payment_method: {
					card: props.elements.getElement(CardElement),
					billing_details: {
						name: state.customer_name,
					},
				},
			}).then(res => {
				if (res.error) {
					return reject({
						title: "Stripe Error",
						content: res.error.message,
					});
				}
				return resolve({receipt: res.paymentIntent.id, charge: null, method: "Card", methodSource: "Stripe"});
			}).catch(e => {
				return reject({
					title: "Stripe Error",
					content: e.message,
				});
			});*/
		}

		return reject({
			title: "No Configuration",
		});
	});
}