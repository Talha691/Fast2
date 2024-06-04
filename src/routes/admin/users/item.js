import React from "react";
import { Avatar, Dropdown, Menu, Modal } from "antd";

import Add from "./add";

const options = ["Edit", "Delete"];

class ContactCell extends React.Component {
	onContactClose = () => {
		this.setState({ addContactState: false });
	};
	onDeleteContact = () => {
		this.setState({ addContactState: false });
		const parent = this;
		Modal.confirm({
			title: "Are you sure you want to delete this user?",
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
		this.setState({ addContactState: true });
	};
	menus = () => (
		<Menu
			onClick={e => {
				if (e.key === "Edit") {
					this.onEditContact();
				} else {
					this.onDeleteContact(this.props.id);
				}
			}}>
			{options.map(option => (
				<Menu.Item key={option}>{option}</Menu.Item>
			))}
		</Menu>
	);

	constructor(props) {
		super(props);
		this.state = {
			addContactState: false,
		};
	}

	render() {
		const { contact, addFavourite, id, onSaveContact } = this.props;
		const { addContactState } = this.state;
		const { name, type, thumb, email, phone, starred } = contact;

		return (
			<div className="gx-contact-item">
				<div className="gx-module-list-icon">
					<div className="gx-ml-2 gx-d-sm-flex">
						{thumb === null || thumb === "" ? (
							<Avatar size="large">{name.charAt(0).toUpperCase()}</Avatar>
						) : (
							<Avatar size="large" alt={name} src={thumb} />
						)}
					</div>

					<div className=" gx-d-sm-flex">
						<div
							onClick={() => {
								addFavourite(id, contact);
							}}>
							{starred ? <i className="gx-icon-btn icon icon-star color-icon" /> : <i className="gx-icon-btn icon icon-star-o" />}
						</div>
						<div className="">
							<Dropdown overlay={this.menus()} placement="bottomRight" trigger={["click"]}>
								<i className="gx-icon-btn icon icon-ellipse-h" />
							</Dropdown>

							{addContactState && (
								<Add
									open={addContactState}
									contact={contact}
									onSaveContact={onSaveContact}
									contactId={id}
									onContactClose={this.onContactClose}
									onDeleteContact={this.onDeleteContact}
								/>
							)}
						</div>
					</div>
					<span className="gx-text-truncate gx-contact-name" style={{ marginLeft: "10px", marginTop: "10px" }}>
						{name}
					</span>
					<span className="gx-text-truncate gx-job-title" style={{ marginLeft: "10px" }}>
						{type}
					</span>
					<div className="wrapper">
						<div>
							<i class="fas fa-phone-alt gx-icon-btn"></i>
							<i class="fas fa-envelope gx-icon-btn"></i>
						</div>
						<div className="wrapper3">
							<span className="gx-phone gx-d-inline-block">{phone}</span>
							<span className="gx-phone gx-d-inline-block">{phone}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ContactCell;
