import {FETCH_START, FETCH_SUCCESS, GET_All_AGENT_SUCCESS} from "../../constants/ActionTypes";
import {firestore} from "../../firebase/firebase";
import async from "async";

export const onGetAllAgents = () => {
	return (dispatch) => {
		dispatch({type: FETCH_START});
		firestore.collection("agents").orderBy("name", "asc").onSnapshot(snapshot => {
			let allAgents = [];
			async.eachSeries(snapshot.docs, (doc, callback) => {
				allAgents.push({
					id: doc.id,
					...doc.data()
				});
				callback();
			}, () => {
				dispatch({
					type: GET_All_AGENT_SUCCESS,
					payload: allAgents,
				});
				dispatch({type: FETCH_SUCCESS});
			});
		})
	};
};

export const onGetAllAgentsAsync = () => {
	return (dispatch) => {
		return new Promise((resolve) => {
			dispatch({type: FETCH_START});
			firestore.collection("agents").orderBy("name", "asc").onSnapshot(snapshot => {
				let allAgents = [];
				async.eachSeries(snapshot.docs, (doc, callback) => {
					allAgents.push({
						id: doc.id,
						...doc.data()
					});
					callback();
				}, () => {
					dispatch({
						type: GET_All_AGENT_SUCCESS,
						payload: allAgents,
					});
					dispatch({type: FETCH_SUCCESS});
					resolve();
				});
			})
		})
	};
};

export const onAddAgent = (client) => {
	return () => firestore.collection("agents").add(client);
};

export const onUpdateAgent = (id, client) => {
	return () => firestore.doc("agents/" + id).update(client);
};

export const onDeleteAgent = (id) => {
	return () => firestore.doc("agents/" + id).delete();
};
