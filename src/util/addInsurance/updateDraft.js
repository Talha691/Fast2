import { auth, firestore } from "../../firebase/firebase";
import moment from "moment";

export default (state, props, docID) => {
	return new Promise(async (resolve, reject) => {
		try {
			const coverageRef = firestore.doc(`coverage/${state.coverage}`);
			const coverage = await coverageRef.get();
			await firestore.doc("drafts/" + docID).update({
				client: props.auth.type.endsWith("Admin")
					? firestore.doc("clients/" + state.client)
					: firestore.doc("agents/" + props.auth.agent + "/clients/" + state.client),
				clientName: state.clientName,
				coverage: coverageRef,
				coverageData: {
					...coverage.data(),
					thumb: null,
				},
				coverageName: state.coverageName ?? null,
				coverageNotes: state.coverageNotes ?? null,
				coveragePrice: state.coveragePrice ?? null,
				total: state.total ?? null,

				sr22: state.sr22 ?? false,
				pipe: state.pipe ?? false,
				year: state.year ?? null,
				make: state.make ?? null,
				model: state.model ?? null,
				plates: state.plates ? state.plates : null,
				vin: state.vin.toUpperCase(),
				image: state.image ?? null,

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

				insuranceID: "-",
				source: "Software",
				fromAgent: Boolean(props.auth.agent),
				agent: props.auth.agent ? firestore.doc("agents/" + props.auth.agent) : null,
				agentName: props.auth.agent ? props.auth.agent.name : null,
				user: props.auth.type.endsWith("Admin") ? firestore.doc("users/" + auth.currentUser.uid) : null,
				userName: auth.currentUser.displayName,
				timestamp: moment().toDate(),
				status: "Draft",
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
