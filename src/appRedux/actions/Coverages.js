import { FETCH_START, FETCH_SUCCESS, GET_All_COVERAGE_SUCCESS } from "../../constants/ActionTypes";
import { firestore } from "../../firebase/firebase";
import async from "async";
let listener;

export const stopCoverages = () => {
	if (listener) {
		listener();
	}
};

export const onGetAllCoverages = auth => {
	return dispatch => {
		dispatch({ type: FETCH_START });
		listener = firestore
			.collection("coverage")
			.where("active", "==", true)
			.onSnapshot(snapshot => {
				let allClients = {};
				async.eachSeries(
					snapshot.docs,
					(doc, callback) => {
						if (auth.type === "Agent" || auth.type === "capturist") {
							allClients[doc.id] = {
								...doc.data(),
								price: doc.data().priceAgent,
							};
						} else {
							allClients[doc.id] = doc.data();
						}
						callback();
					},

					() => {
						dispatch({
							type: GET_All_COVERAGE_SUCCESS,
							payload: allClients,
						});
						dispatch({ type: FETCH_SUCCESS });
					}
				);
			});
	};
};

export const onAddCoverage = client => {
	return () =>
		firestore.collection("coverage").add({
			...client,
			active: true,
		});
};

export const onUpdateCoverage = (id, client) => {
	return () => firestore.doc("coverage/" + id).update(client);
};

export const onDeleteCoverage = id => {
	return () =>
		firestore.doc("coverage/" + id).update({
			active: false,
		});
};
