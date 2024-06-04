import { auth, firestore } from "../../firebase/firebase";
import moment from "moment";

export default (receipt, charge, method, methodSource, state, props) => {
	return new Promise(async (resolve, reject) => {
		console.log(state)
		try {
			const id = props.type ? props.type + "-insurance" : state.insurance;
			const coverageRef = firestore.doc(`coverage/${state.coverage}`);
			const coverage = await coverageRef.get();

			// Get agent data
			let agent = {
				ref: null,
				name: null,
				type: null,
			};
			if (props.auth.agent) {
				const agentRef = firestore.doc("agents/" + props.auth.agent);
				const agentData = await agentRef.get();
				agent = {
					ref: agentRef,
					name: agentData.data().company,
					type: agentData.data().special ? "Group" : "Agent",
				};
			}
			if (props.auth.type === "capturist") {
				const agentRef = firestore.doc("agents/" + state.selectedAgent);
				const agentData = await agentRef.get();
				agent = {
					ref: agentRef,
					name: agentData.data().company,
				};
			}

			await firestore.collection(id).add({
				method: method,
				methodSource: methodSource,
				client: props.auth.type.endsWith("Admin")
					? firestore.doc("clients/" + state.client)
					: firestore.doc("agents/" + props.auth.agent + "/clients/" + state.client),
				clientName: state.clientName,
				coverage: coverageRef,
				coverageData: {
					...coverage.data(),
					thumb: null,
				},
				coverageName: state.coverageName,
				coverageNotes: state.coverageNotes,
				coveragePrice: state.coveragePrice,
				total: state.total,
				partial_payment: state.partial_payment,
				isPolicyPaid: state.isPolicyPaid,
				policyPaidId: state.policyPaidId,
				sr22: state.sr22 ?? false,
				pipe: state.pipe ?? false,
				year: state.year,
				make: state.make,
				model: state.model,
				plates: state.plates ? state.plates : null,
				vin: state.vin.toUpperCase(),
				image: state.image,

				driver: state.driver ? state.driver : null,
				extra: state.extra ? state.extra : null,
				cargoExtra: state.extra && state.cargoExtra && props.type === "truck" ? state.cargoExtra : null,
				yearExtra: state.extra ? state.yearExtra : null,
				makeExtra: state.extra ? state.makeExtra : null,
				modelExtra: state.extra ? state.modelExtra : null,
				platesExtra: state.extra && state.platesExtra ? state.platesExtra : null,
				vinExtra: state.extra ? state.vinExtra.toUpperCase() : null,
				imageExtra: state.extra ? state.imageExtra : null,

				from: state.from ? state.from["toDate"]() : null,
				to: state.to ? state.to["toDate"]() : null,
				days: state.days,
				receipt: receipt,
				charge: charge,

				insuranceID: "-",
				source: "Software",
				fromAgent: Boolean(props.auth.agent),
				agent: agent.ref,
				agentName: agent.name,
				agentType: agent.type,
				user: props.auth.type.endsWith("Admin") ? firestore.doc("users/" + auth.currentUser.uid) : null,
				userName: auth.currentUser.displayName,
				timestamp: moment().toDate(),
				status: "Pending",
			});
			return resolve();
		} catch (e) {
			return reject({
				title: "Saving Error",
				content: e.message,
			});
		}
	});
};
