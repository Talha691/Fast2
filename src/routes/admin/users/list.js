import React from "react";
import _ from "lodash";

import ContactCell from "./item";

const ContactList = ({ contactList, addFavourite, onSaveContact, onDeleteContact }) => {
	return (
		<div className="parent-list">
			{_.map(contactList, (contact, key) => (
				<ContactCell key={key} id={key} contact={contact} onDeleteContact={onDeleteContact} onSaveContact={onSaveContact} addFavourite={addFavourite} />
			))}
		</div>
	);
};

export default ContactList;
