import { firestore } from "../../firebase/firebase";
let listener;

export const stopCarInsurances = () => {
	if (listener) {
		listener();
	}
};
export const onAddCarInsurance = client => {
	return () => firestore.collection("car-insurance").add(client);
};

export const onUpdateCarInsurance = (id, client) => {
	return () => firestore.doc("car-insurance/" + id).update(client);
};

export const onDeleteCarInsurance = id => {
	return () => firestore.doc("car-insurance/" + id).update({ void: true, status: "Void" });
};
