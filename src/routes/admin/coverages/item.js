import React from "react";
import { Avatar, Dropdown, Menu, Modal } from "antd";

import Add from "./add";
import Can from "../../../roles/Can";

const MenuItem = props => (
	<Can I={props.i} a={props.a}>
		<Menu.Item {...props} key={props.key}>
			{props.children}
		</Menu.Item>
	</Can>
);

class ContactCell extends React.Component {
	onContactClose = () => {
		this.setState({ addContactState: false });
	};
	onDeleteContact = () => {
		this.setState({ addContactState: false });
		const parent = this;
		Modal.confirm({
			title: "Are you sure you want to delete this coverage?",
			content: "There is no going back after this. This will not affect current insurances",
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
			<MenuItem i={"edit"} a={"coverages"} key={"Edit"}>
				Edit
			</MenuItem>
			<MenuItem i={"delete"} a={"coverages"} key={"Delete"}>
				Delete
			</MenuItem>
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
		const { name, type, vehicles, thumb, price, priceAgent, days, starred } = contact;

		return (
			<div className="gx-contact-item2">
				<div className="gx-module-list-icon2">
					<div
						className="gx-d-none gx-d-sm-flex"
						onClick={() => {
							addFavourite(id, contact);
						}}>
						{starred ? <i className="gx-icon-btn icon icon-star" /> : <i className="gx-icon-btn icon icon-star-o" />}
					</div>
					<div className="gx-ml-2 gx-d-none gx-d-sm-flex">
						{thumb === null || thumb === "" ? (
							<Avatar size="large">{name.charAt(0).toUpperCase()}</Avatar>
						) : (
							<Avatar size="large" alt={name} src={thumb} />
						)}
					</div>
				</div>

				<div className="gx-module-list-info gx-contact-list-info">
					<div className="gx-module-contact-content">
						<p className="gx-mb-1">
							<span className="gx-text-truncate gx-contact-name"> {name} </span>
							<span className="gx-toolbar-separator">&nbsp;</span>
							<span className="gx-text-truncate gx-job-title">
								Price: <b>${price} dll</b> for<b> {days > 0 ? days + " days" : "each day"}</b>
							</span>
							<span className="gx-toolbar-separator">&nbsp;</span>
							<span className="gx-text-truncate gx-job-title">
								Price for Agents: <b>${priceAgent} dll</b> for<b> {days > 0 ? days + " days" : "each day"}</b>
							</span>
							<span className="gx-toolbar-separator">&nbsp;</span>
							<span className="gx-text-truncate gx-job-title">{vehicles === 1 ? "1 " + type : "2 " + type + "s"}</span>
						</p>
					</div>

					<div className="gx-module-contact-right">
						<Dropdown overlay={this.menus()} placement="bottomRight" trigger={["click"]}>
							<i className="gx-icon-btn icon icon-ellipse-v" />
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
			</div>
		);
	}
}

export default ContactCell;
