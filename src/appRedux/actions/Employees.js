import {FETCH_START, FETCH_SUCCESS, GET_All_EMPLOYEE_SUCCESS} from "../../constants/ActionTypes";
import {firestore} from "../../firebase/firebase";
import async from "async";
let listener;

export const stopEmployees = () => {
	if (listener) {
		listener();
	}
}

export const onGetAllEmployees = (auth) => {
	if (auth.type.endsWith("Admin")) {
		return null;
	}
	return (dispatch) => {
		dispatch({type: FETCH_START});
		const agentRef = firestore.doc("agents/" + auth.agent);
		listener = firestore.collection("employees").where("agent", "==", agentRef).onSnapshot(employees => {
			let allEmployees = {};
			async.eachSeries(employees.docs, (doc, callback) => {
				allEmployees[doc.id] = doc.data();
				callback();
			}, () => {
				dispatch({
					type: GET_All_EMPLOYEE_SUCCESS,
					payload: allEmployees,
				});
				dispatch({type: FETCH_SUCCESS});
			});
		});
	};
};

export const onAddEmployee = (employee) => {
	return () => firestore.collection("employees").add({
		...employee,
	});
};

export const onUpdateEmployee = (id, employee) => {
	return () => firestore.doc("employees/" + id).update(employee);
};

export const onDeleteEmployee = (id) => {
	return () => firestore.doc("employees/" + id).delete();
};
