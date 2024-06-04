import {FETCH_START, FETCH_SUCCESS, GET_All_USER_SUCCESS} from "../../constants/ActionTypes";
import {firestore} from "../../firebase/firebase";
import async from "async";
let listener;

export const stopUsers = () => {
	if (listener){
		listener()
	}
}

export const onGetAllUsers = () => {
	return (dispatch) => {
		dispatch({type: FETCH_START});
		listener = firestore.collection("users").onSnapshot(snapshot => {
			let allUsers = {};
			async.eachSeries(snapshot.docs, (doc, callback) => {
				allUsers[doc.id] = doc.data();
				callback();
			}, () => {
				dispatch({
					type: GET_All_USER_SUCCESS,
					payload: allUsers,
				});
				dispatch({type: FETCH_SUCCESS});
			});
		})
	};
};

export const onAddUser = (user) => {
	return () => firestore.collection("users").add({
		...user,
	});
};

export const onUpdateUser = (id, user) => {
	return () => firestore.doc("users/" + id).update(user);
};

export const onDeleteUser = (id) => {
	return () => firestore.doc("users/" + id).delete();
};
