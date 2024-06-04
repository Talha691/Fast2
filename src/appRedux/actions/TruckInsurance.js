import {firestore} from "../../firebase/firebase";

let listener;

export const stopTruckInsurances = () => {
	if (listener) {
		listener();
	}
}


export const onAddTruckInsurance = (client) => {
	return () => firestore.collection("truck-insurance").add(client);
};


export const onUpdateTruckInsurance = (id, client) => {
	return () => firestore.doc("truck-insurance/" + id).update(client);
};

export const onDeleteTruckInsurance = (id) => {
	return () => firestore.doc("truck-insurance/" + id).update({void: true, status: "Void"});
};
