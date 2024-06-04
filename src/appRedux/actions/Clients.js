import { FETCH_START, FETCH_SUCCESS, GET_All_CLIENT_SUCCESS } from "../../constants/ActionTypes";
import { firestore } from "../../firebase/firebase";
import async from "async";
let listener;

export const stopClients = () => {
	if (listener) {
		listener();
	}
};

export const onGetAllClient = auth => {
	let collection;
	if (auth.type !== "capturist") {
		collection = auth.type.endsWith("Admin") ? "clients" : "agents/" + auth.agent + "/clients";
	} else {
		collection = "capturists/" + auth.uid + "/clients";
	}
	return dispatch => {
		dispatch({ type: FETCH_START });
		listener = firestore
			.collection(collection)
			.orderBy("name", "asc")
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(
					snapshot.docs,
					(doc, callback) => {
						allClients.push({
							id: doc.id,
							...doc.data(),
						});
						callback();
					},
					() => {
						dispatch({
							type: GET_All_CLIENT_SUCCESS,
							payload: allClients,
						});
						dispatch({ type: FETCH_SUCCESS });
					}
				);
			});
	};
};

export const onAddClient = (client, auth) => {
	console.log(auth);
	if (auth.type !== "capturist") {
		const collection = auth.type.endsWith("Admin") ? "clients" : "agents/" + auth.agent + "/clients";
		return () => firestore.collection(collection).add(client);
	}
	const collection = "capturists/" + auth.uid + "/clients";
	return () => firestore.collection(collection).add(client);
};

export const onUpdateClient = (id, client, auth, agent) => {
	const collection = auth.type.endsWith("Admin") && !agent ? "clients" : "agents/" + (agent ?? auth.agent) + "/clients";
	return () => firestore.doc(collection + "/" + id).update(client);
};

export const onDeleteClient = (id, auth) => {
	const collection = auth.type.endsWith("Admin") ? "clients" : "agents/" + auth.agent + "/clients";
	return () => firestore.doc(collection + "/" + id).delete();
};
