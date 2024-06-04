import React, { Component } from "react";
import { Button, Drawer } from "antd";
import CustomScrollbars from "util/CustomScrollbars";

import ContactList from "./list";
import AppModuleHeader from "components/AppModuleHeader/index";
import InfoView from "components/InfoView/index";
import Add from "./add";
import { connect } from "react-redux";
import _ from "lodash";
import {
	onAddCoverage as onAddContact,
	onDeleteCoverage as onDeleteContact,
	onGetAllCoverages as onGetAllContact,
	onUpdateCoverage as onUpdateContact,
} from "../../../appRedux/actions/Coverages";
import Can from "../../../roles/Can";

const filterOptions = [
	{
		id: 1,
		name: "All coverages",
		icon: "all-contacts",
	},
	{
		id: 2,
		name: "Starred coverages",
		icon: "star",
	},
];

class FirebaseCRUD extends Component {
	constructor(props) {
		super(props);
		this.state = {
			noContentFoundMessage: "No Coverage found",
			alertMessage: "",
			showMessage: true,
			selectedSectionId: 1,
			drawerState: false,
			user: {
				name: "Robert Johnson",
				email: "robert.johnson@example.com",
				avatar: "https://via.placeholder.com/150x150",
			},
			searchUser: "",
			filterOption: "All coverages",
			allContact: [],
			contactList: [],
			selectedContact: null,
			addContactState: false,
		};
	}

	componentDidMount() {
		this.props.onGetAllContact(this.props.auth);
	}

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		if (nextProps.contactList) {
			this.setState({
				allContact: nextProps.contactList,
				contactList: nextProps.contactList,
			});
		}
	}

	ContactSideBar = () => {
		return (
			<div className="gx-module-side">
				<div className="gx-module-side-header">
					<div className="gx-module-logo">
						{/*<i className="icon icon-pricing-table gx-mr-4"/>*/}
						<i className="fas fa-shield-check gx-mr-3 gx-mt-1" />
						<span>Coverages</span>
					</div>
				</div>

				<div className="gx-module-side-content">
					<CustomScrollbars className="gx-module-side-scroll">
						<div className="gx-module-add-task">
							<Can I={"add"} a={"coverages"}>
								<Button className="gx-btn-block ant-btn" type="primary" aria-label="add" onClick={this.onAddContact}>
									<i className="icon icon-add gx-mr-2" />
									<span>Add New Coverage</span>
								</Button>
							</Can>
						</div>
						<div className="gx-module-side-nav">
							<ul className="gx-module-nav">
								{filterOptions.map(option => {
									return (
										<li key={option.id} className="gx-nav-item">
											<span
												className={`gx-link ${option.id === this.state.selectedSectionId ? "active" : ""}`}
												onClick={this.onFilterOptionSelect.bind(this, option)}>
												<i className={`icon icon-${option.icon}`} />
												<span>{option.name}</span>
											</span>
										</li>
									);
								})}
							</ul>
						</div>
					</CustomScrollbars>
				</div>
			</div>
		);
	};

	addFavourite = (id, data) => {
		let contact = data;
		contact.starred = !data.starred;
		this.props.onUpdateContact(id, contact);
	};
	onAddContact = () => {
		this.setState({ addContactState: true });
	};
	onContactClose = () => {
		this.setState({ addContactState: false });
	};
	onFilterOptionSelect = option => {
		switch (option.name) {
			case "All coverages": {
				this.setState({
					selectedSectionId: option.id,
					filterOption: option.name,
					contactList: this.state.allContact,
				});
				break;
			}
			case "Frequently contacted": {
				this.setState({
					selectedSectionId: option.id,
					filterOption: option.name,
					contactList: _.filter(this.state.allContact, contact => contact.frequently),
				});
				break;
			}
			case "Starred coverages": {
				this.setState({
					selectedSectionId: option.id,
					filterOption: option.name,
					contactList: _.filter(this.state.allContact, contact => contact.starred),
				});
				break;
			}
			default:
				break;
		}
	};
	onSaveContact = (id, data) => {
		if (id) {
			this.props.onUpdateContact(id, data);
		} else {
			this.props.onAddContact(data);
		}
	};
	onDeleteContact = data => {
		this.props.onDeleteContact(data);
	};
	filterContact = userName => {
		const { filterOption } = this.state;
		if (userName === "") {
			this.setState({ contactList: this.state.allContact });
		} else {
			const filterContact = _.filter(this.state.allContact, contact => contact.name.toLowerCase().indexOf(userName.toLowerCase()) > -1);
			if (filterOption === "All contacts") {
				this.setState({ contactList: filterContact });
			} else if (filterOption === "Frequently contacted") {
				this.setState({ contactList: filterContact.filter(contact => contact.frequently) });
			} else if (filterOption === "Starred contacts") {
				this.setState({ contactList: filterContact.filter(contact => contact.starred) });
			}
		}
	};

	/*handleRequestClose = () => {
		this.setState({
			showMessage: false,
		});
	};*/

	updateContactUser(evt) {
		this.setState({
			searchUser: evt.target.value,
		});
		this.filterContact(evt.target.value);
	}

	onToggleDrawer() {
		this.setState({
			drawerState: !this.state.drawerState,
		});
	}

	render() {
		const { user, contactList, addContactState, drawerState, noContentFoundMessage } = this.state;
		return (
			<div className="gx-main-content">
				<div className="gx-app-module">
					<div className="gx-d-block gx-d-lg-none">
						<Drawer placement="left" closable={false} visible={drawerState} onClose={this.onToggleDrawer.bind(this)}>
							{this.ContactSideBar()}
						</Drawer>
					</div>
					<div className="gx-module-sidenav gx-d-none gx-d-lg-flex">{this.ContactSideBar(user)}</div>

					<div className="gx-module-box">
						<div className="gx-module-box-header">
							<span className="gx-drawer-btn gx-d-flex gx-d-lg-none">
								<i className="icon icon-menu gx-icon-btn" aria-label="Menu" onClick={this.onToggleDrawer.bind(this)} />
							</span>

							<AppModuleHeader
								placeholder="Search Coverage"
								notification={false}
								apps={false}
								user={this.state.user}
								onChange={this.updateContactUser.bind(this)}
								value={this.state.searchUser}
							/>
						</div>
						<div className="gx-module-box-content">
							{/*<div className="gx-module-box-topbar">
							</div>*/}
							<CustomScrollbars className="gx-module-content-scroll">
								{contactList.length === 0 ? (
									<div className="gx-h-100 gx-d-flex gx-align-items-center gx-justify-content-center">{noContentFoundMessage}</div>
								) : (
									<ContactList
										contactList={contactList}
										addFavourite={this.addFavourite}
										onDeleteContact={this.onDeleteContact.bind(this)}
										onSaveContact={this.onSaveContact.bind(this)}
									/>
								)}
							</CustomScrollbars>
						</div>
					</div>
				</div>

				<Add
					open={addContactState}
					contact={{
						name: "",
						thumb: "",
						email: "",
						phone: "",
						type: "",
						starred: false,
						frequently: false,
					}}
					onSaveContact={this.onSaveContact}
					onContactClose={this.onContactClose}
					onDeleteContact={this.onDeleteContact}
				/>
				<InfoView />
			</div>
		);
	}
}

const mapStateToProps = ({ auth, coverage }) => {
	const { contactList, selectedContact } = coverage;
	return { auth, contactList, selectedContact };
};
export default connect(mapStateToProps, {
	onGetAllContact,
	onAddContact,
	onUpdateContact,
	onDeleteContact,
})(FirebaseCRUD);
