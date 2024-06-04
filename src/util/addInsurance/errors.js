import {firestore} from "../../firebase/firebase";
import moment from "moment";
import {CardElement} from "@stripe/react-stripe-js";

export default (state, props, token_payment_data) => {
	return new Promise(async (resolve, reject) => {
		const doc = await firestore.doc("agents/" + props.auth.uid).get()
		const credit = doc.data().credit

		if (!state.client) {
			return reject({
				title: "Client Error",
				content: "Please select a client",
			});
		}
		if (!state.coverage) {
			return reject({
				title: "Coverage Error",
				content: "Please select a coverage",
			});
		}
		if (!state.vin) {
			return reject({
				title: "Vin Error",
				content: "Please select a VIN",
			});
		}
		if (!state.year) {
			return reject({
				title: "Year Error",
				content: "Please select a year",
			});
		}
		if (!state.make) {
			return reject({
				title: "Make Error",
				content: "Please select a make",
			});
		}
		if (!state.model) {
			return reject({
				title: "Model Error",
				content: "Please select a model",
			});
		}
		if (!state.from) {
			return reject({
				title: "Date Range Error",
				content: "Please select a starting date",
			});
		}
		if (!state.to) {
			return reject({
				title: "Date Range Error",
				content: "Please select an ending date",
			});
		}
		if (!state.image || (state.extra && !state.imageExtra)) {
			return reject({
				title: "Missing Files",
				content: "Please the vehicle's title",
			});
		}

		const insuranceStart = moment(state.from["toDate"]());
		if (!insuranceStart.isAfter()) {
			return reject({
				title: "Date Range Error",
				content: "This date is in the past. Please double check the time.",
			});
		}
		if (props.configuration === "stripe" && !credit) {
			console.log(state)
			const amount = Number(state.total);
			const FullName = props.auth.displayName;
			const nameParts = FullName.split(" ");
			const firstName = nameParts[0];
			const lastName = nameParts.slice(1).join(" ");
			console.log(firstName)
			console.log(lastName)
			const body = {
			  createTransactionRequest: {
				merchantAuthentication: {
				  name: "69FB7ayH",
				  transactionKey: "2T56Hy4xyR4jA3h5",
				},
				transactionRequest: {
				  transactionType: "authCaptureTransaction",
				  amount: amount.toString(),
				  payment: {
					opaqueData: {
					  dataDescriptor: token_payment_data.opaqueData.dataDescriptor,
					  dataValue: token_payment_data.opaqueData.dataValue,
					},
				  },
				  billTo: {
					firstName: firstName,
					lastName: lastName,
					address: "1301 W Pecan Blvd, STE A",
					city: "McAllen",
					state: "Texas",
					zip: "78501",
					country: "US",
				  },
				},
			  },
			};
		
			const dataToSend = JSON.stringify(body);
			fetch("https://api.authorize.net/xml/v1/request.api", {
			  method: "post",
			  headers: { "Content-Type": "application/json" },
			  body: dataToSend,
			})
			  .then((resp) => {
				return resp.json();
			  })
			  .then((data) => {
				if (data.messages.resultCode === "Ok") {
				  //onFinish(data.transactionResponse.transId, "AuthorizeNet");
				  return resolve(data.transactionResponse.transId);
				}
				alert(data.messages.message[0].text);
			  }).catch((e)=>{
				return reject({
					title: "Stripe Error",
					content: e.message,
				});
			  })
		}
		else{
			resolve();
		}
	});
}