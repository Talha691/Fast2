import React from "react";
import {Avatar, Dropdown, Menu, Modal} from "antd";

import Add from "./add";

const options = [
	"Edit",
	"Delete",
];

class ContactCell extends React.Component {

	onContactClose = () => {
		this.setState({addContactState: false});
	};
	onDeleteContact = () => {
		this.setState({addContactState: false});
		const parent = this;
		Modal.confirm({
			title: "Are you sure you want to delete this employee?",
			content: "There is no going back after this",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				parent.props.onDeleteContact(parent.props.id);
			},
		});
	};
	onEditContact = () => {
		this.setState({addContactState: true});
	};
	menus = () => (<Menu onClick={(e) => {
		if (e.key === "Edit") {
			this.onEditContact();
		} else {
			this.onDeleteContact(this.props.id);
		}
	}
	}>
		{options.map(option =>
			<Menu.Item key={option}>
				{option}
			</Menu.Item>,
		)}
	</Menu>);

	constructor(props) {
		super(props);
		this.state = {
			addContactState: false,
		};
	}

	render() {
		const {contact, addFavourite, id, onSaveContact} = this.props;
		const {addContactState} = this.state;
		const {name, thumb, email, phone, starred} = contact;

		return (

			<div className="gx-contact-item">
				<div className="gx-module-list-icon">
					<div className="gx-d-none gx-d-sm-flex" onClick={() => {
						addFavourite(id, contact);
					}}>
						{starred ? <i className="gx-icon-btn icon icon-star"/> : <i className="gx-icon-btn icon icon-star-o"/>}
					</div>
					<div className="gx-ml-2 gx-d-none gx-d-sm-flex">
						{(thumb === null || thumb === "") ?
							<Avatar size="large">
								{name.charAt(0).toUpperCase()}
							</Avatar>
							:
							<Avatar size="large" alt={name} src={thumb}/>
						}
					</div>
				</div>

				<div className="gx-module-list-info gx-contact-list-info">
					<div className="gx-module-contact-content">
						<p className="gx-mb-1">
							<span className="gx-text-truncate gx-contact-name"> {name} </span>
							<span className="gx-toolbar-separator">&nbsp;</span>
							<span className="gx-text-truncate gx-job-title">{phone}</span>
						</p>

						<div className="gx-text-muted">
				            <span className="gx-email gx-d-inline-block gx-mr-2">
				                {email}
				            </span>
						</div>
					</div>

					<div className="gx-module-contact-right">

						<Dropdown overlay={this.menus()} placement="bottomRight" trigger={["click"]}>
							<i className="gx-icon-btn icon icon-ellipse-v"/>
						</Dropdown>

						{addContactState &&
						<Add open={addContactState} contact={contact} onSaveContact={onSaveContact} contactId={id}
						     onContactClose={this.onContactClose} onDeleteContact={this.onDeleteContact}/>}
					</div>
				</div>
			</div>
		);
	}
}

export default ContactCell;
