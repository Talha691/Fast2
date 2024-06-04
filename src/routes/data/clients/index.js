import React, {Component} from "react";
import {Button, Card, Table, Row, Col, Typography, Input, Modal} from "antd";
// import { Icon } from 'antd-icons';
import {firestore} from "../../../firebase/firebase";
import Highlighter from "react-highlight-words";
import {Elements} from "react-stripe-elements";
import moment from "moment";
import async from "async";

import Add from "./add";
import Stripe from "./stripe";
import {connect} from "react-redux";
import {
	onAddClient as onAddContact,
	onDeleteClient as onDeleteContact,
	onGetAllClient as onGetAllContact,
	onUpdateClient as onUpdateContact,
} from "../../../appRedux/actions/Clients";
import Can from "../../../roles/Can";

class FirebaseCRUD extends Component {
	constructor(props) {
		super(props);
		this.state = {
			agent: this.props.match.params.client,
			agentData: null,
			contactList: [],
			addContactState: false,
			stripeState: false,
			client: null,
			contact: {
				"thumb": "",
				"type": "",
				"phone": "",
				"name": "",
				"email": "",
				"rfc": "",
				"dob": null,
				"address": "",
				"city": "",
				"state": "",
				"zip": "",
				"country": "",
				"notes": "",
			},
		};
	}

	componentDidMount() {
		if (this.state.agent) {
			return this.getAgentData();
		} else {
			this.props.onGetAllContact(this.props.auth);
		}
	}

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		if (nextProps.contactList) {
			this.setState({
				contactList: nextProps.contactList,
			});
		}
	}

	getAgentData = async () => {
		const contactList = [];
		const agentData = await firestore.doc("agents/" + this.state.agent).get();
		await this.setState({agentData: agentData.data()});
		firestore.collection("agents/" + this.state.agent + "/clients").get()
			.then(clients => {
				async.eachOf(clients.docs, (client, key, callback) => {
					contactList.push({
						id: client.id,
						...client.data(),
					});
					return callback();
				}, () => {
					this.setState({contactList});
				});
			});
	};

	onAddContact = () => {
		this.setState({}, () => {
			this.setState({
				addContactState: true,
			});
		});
	};

	onContactClose = () => {
		this.setState({
			addContactState: false,
		}, () => {
			this.setState({
				contact: {
					"thumb": "",
					"type": "",
					"phone": "",
					"name": "",
					"email": "",
					"rfc": "",
					"dob": null,
					"address": "",
					"city": "",
					"state": "",
					"zip": "",
					"country": "",
					"notes": "",
				},
			});
		});
	};

	onSaveContact = (id, data) => {
		if (id) {
			this.props.onUpdateContact(id, data, this.props.auth, this.state.agent);
			this.setState({
				contact: data,
				addContactState: true,
			});
		} else {
			this.props.onAddContact({
				...data,
				timestamp: moment().toDate(),
			}, this.props.auth, this.state.agent);
		}
	};

	onDeleteContact = (data) => {
		const parent = this;
		Modal.confirm({
			title: "Are you sure you want to delete this client?",
			content: "There is no going back after this",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				parent.props.onDeleteContact(data, parent.props.auth);
			},
			onCancel() {
			},
		});
	};

	updateContactUser(evt) {
		this.setState({
			searchUser: evt.target.value,
		});
	}

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
			<div style={{padding: 8}}>
				<Input ref={node => {
					this.searchInput = node;
				}}
				       placeholder={`Search ${dataIndex}`}
				       value={selectedKeys[0]}
				       onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
				       onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
				       style={{width: 188, marginBottom: 8, display: "block"}}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{width: 90, marginRight: 8}}
				>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{width: 90}}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => (
			<Icon type="search" style={{color: filtered ? "#1890ff" : undefined}}/>
		),
		onFilter: (value, record) =>
			record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
		render: text => (
			<Highlighter
				highlightStyle={{backgroundColor: "#ffc069", padding: 0}}
				searchWords={[this.state.searchText]}
				autoEscape
				textToHighlight={text ? text.toString() : ""}
			/>
		),
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({searchText: selectedKeys[0]});
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({searchText: ""});
	};

	// Stripe
	toggleStripe = (id) => {
		if (this.state.stripeState) {
			this.setState({
				client: null,
				stripeState: false,
			});
		} else {
			this.setState({
				client: id,
				stripeState: true,
			});
		}
	};

	render() {
		const {contactList, addContactState} = this.state;
		const columns = [
			{...this.getColumnSearchProps("name"), title: "Name", dataIndex: "name", key: "name", sorter: (a, b) => a.name ? a.name.localeCompare(b ? b.name : "") : ""},
			{...this.getColumnSearchProps("email"), title: "Email", dataIndex: "email", key: "email", onFilter: (value, record) => record.email.indexOf(value) === 0, sorter: (a, b) => a.email ? a.email.localeCompare(b ? b.email : "") : ""},
			{...this.getColumnSearchProps("phone"), title: "Phone", dataIndex: "phone", key: "phone", onFilter: (value, record) => record.phone.indexOf(value) === 0, sorter: (a, b) => a.phone ? a.phone.localeCompare(b ? b.phone : "") : ""},
			{
				title: "Action", dataIndex: "", key: "x", render: (record) => {
					return (
						<div className={"actions"}>
							<Can I={"edit"} a={"clients"}>
								<i className={"fas fa-pencil"} onClick={() => this.onSaveContact(record.id, record)}/>
							</Can>
							{
								record.stripe ? <i className={"fab fa-cc-stripe"} onClick={() => this.toggleStripe(record.id)}/> : null
							}
							{
								!this.state.agent &&
								<Can I={"delete"} a={"clients"}>
									<i className={"fas fa-trash"} onClick={() => this.onDeleteContact(record.id)}/>
								</Can>
							}
						</div>
					);
				},
			},
		];
		return (
			<Card>
				<Row>
					<Col span={12}>
						<div style={{width: 100}}/>
						<Typography.Title level={2}>
							Clients {this.state.agentData ? "of " + this.state.agentData.name : null}
						</Typography.Title>
					</Col>
					<Col span={4} push={8}>
						<Can I={"add"} a={"clients"}>
							<Button type="primary" block={true} onClick={this.onAddContact}>
								Add Client
							</Button>
						</Can>
					</Col>
				</Row>
				<Table pagination={{pageSize: 30}} className="gx-table-responsive" columns={columns} rowKey={"id"} dataSource={contactList}/>
				<Add open={addContactState} contact={this.state.contact} onSaveContact={this.onSaveContact} onContactClose={this.onContactClose} onDeleteContact={this.onDeleteContact}/>
				<Elements>
					<Stripe auth={this.props.auth} open={this.state.stripeState} close={() => this.setState({stripeState: false})} client={this.state.client}/>
				</Elements>
			</Card>
		);
	}
}

const mapStateToProps = ({auth, clients}) => {
	const {contactList, selectedContact} = clients;
	return {auth, contactList, selectedContact};
};
export default connect(mapStateToProps, {
	onGetAllContact,
	onAddContact,
	onUpdateContact,
	onDeleteContact,
})(FirebaseCRUD);
