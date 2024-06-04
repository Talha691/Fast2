import React, { Component } from "react";
import { Button, Card, Table, Row, Col, Typography, Input, Modal } from "antd";
// import { Icon } from 'antd-icons';
import Highlighter from "react-highlight-words";
import { Elements } from "react-stripe-elements";
import moment from "moment";
import Add from "./add";
import { firestore } from "../../../firebase/firebase";
import Stripe from "./stripe";
import { connect } from "react-redux";
import async from "async";
import {
	onAddAgent as onAddContact,
	onDeleteAgent as onDeleteContact,
	onGetAllAgents as onGetAllContact,
	onUpdateAgent as onUpdateContact,
} from "../../../appRedux/actions/Capturists";
import Can from "../../../roles/Can";

class FirebaseCRUD extends Component {
	constructor(props) {
		super(props);
		this.state = {
			contactList: [],
			addContactState: false,
			stripeState: false,
			client: null,
			contact: {
				thumb: "",
				company: "",
				credit: false,
				phone: "",
				name: "",
				email: "",
				password: "",
				rfc: "",
				dob: null,
				address: "",
				city: "",
				state: "",
				zip: "",
				country: "",
				special: null,
				notes: "",
			},
		};
	}

	componentDidMount() {
		this.props.onGetAllContact();
		this.getAgents();
	}

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		if (nextProps.contactList) {
			this.setState({
				contactList: nextProps.contactList,
			});
		}
	}
	getAgents() {
		return firestore
			.collection("agents")
			.orderBy("name", "asc")
			.get()
			.then(agent => {
				const allAgents = [];
				return async.eachOfSeries(
					agent.docs,
					(agent, key, callback) => {
						allAgents.push({
							key: agent.id,
							agentName: agent.data().name,
						});
						callback();
					},
					() => {
						this.setState({ agents: allAgents });
					}
				);
			});
	}

	onAddContact = () => {
		this.setState({}, () => {
			this.setState({
				addContactState: true,
			});
		});
	};

	onContactClose = () => {
		this.setState(
			{
				addContactState: false,
			},
			() => {
				this.setState({
					contact: {
						thumb: "",
						company: "",
						credit: false,
						phone: "",
						name: "",
						email: "",
						password: "",
						rfc: "",
						dob: null,
						address: "",
						city: "",
						state: "",
						zip: "",
						country: "",
						notes: "",
						special: null,
					},
				});
			}
		);
	};

	onSaveContact = (id, data) => {
		if (id) {
			this.props.onUpdateContact(id, data);
			this.setState({
				contact: data,
				addContactState: true,
			});
		} else {
			this.props.onAddContact({
				...data,
				timestamp: moment().toDate(),
			});
		}
	};

	onDeleteContact = data => {
		const parent = this;
		Modal.confirm({
			title: "Are you sure you want to delete this client?",
			content: "There is no going back after this",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				parent.props.onDeleteContact(data);
			},
			onCancel() {},
		});
	};

	onShowUsers = agent => {
		this.props.history.push("/capturists/" + agent);
	};

	updateContactUser(evt) {
		this.setState({
			searchUser: evt.target.value,
		});
	}

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={node => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{ width: 90, marginRight: 8 }}>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />,
		onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
		render: text => (
			<Highlighter
				highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
				searchWords={[this.state.searchText]}
				autoEscape
				textToHighlight={text ? text.toString() : ""}
			/>
		),
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	// Stripe
	toggleStripe = id => {
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
		const { contactList, addContactState } = this.state;
		const columns = [
			{
				key: "type",
				title: "Type",
				dataIndex: "special",
				render: e => {
					if (e) {
						return "Group";
					} else {
						return "Capturist";
					}
				},
			},
			{
				...this.getColumnSearchProps("company"),
				title: "Company",
				dataIndex: "company",
				key: "company",
				onFilter: (value, record) => record.name.indexOf(value) === 0,
				sorter: (a, b) => a.name.length - b.name.length,
			},
			{
				...this.getColumnSearchProps("name"),
				title: "Name",
				dataIndex: "name",
				key: "name",
				onFilter: (value, record) => record.name.indexOf(value) === 0,
				sorter: (a, b) => a.name.length - b.name.length,
			},
			{
				...this.getColumnSearchProps("email"),
				title: "Email",
				dataIndex: "email",
				key: "email",
				onFilter: (value, record) => record.email.indexOf(value) === 0,
				sorter: (a, b) => a.email.length - b.email.length,
			},
			{
				...this.getColumnSearchProps("phone"),
				title: "Phone",
				dataIndex: "phone",
				key: "phone",
				onFilter: (value, record) => record.phone.indexOf(value) === 0,
				sorter: (a, b) => a.phone.length - b.phone.length,
			},
			{
				title: "Action",
				dataIndex: "",
				key: "x",
				render: record => {
					return (
						<div className={"actions"}>
							<Can I={"edit"} a={"capturists"}>
								<i className={"fas fa-pencil"} onClick={() => this.onSaveContact(record.id, record)} />
							</Can>
							{record.stripe ? <i className={"fab fa-cc-stripe"} onClick={() => this.toggleStripe(record.id)} /> : null}
							<Can I={"view"} a={"capturistsClients"}>
								<i className={"fas fa-users"} onClick={() => this.onShowUsers(record.id)} />
							</Can>
							<Can I={"delete"} a={"capturists"}>
								<i className={"fas fa-trash"} onClick={() => this.onDeleteContact(record.id)} />
							</Can>
						</div>
					);
				},
			},
		];
		return (
			<Card>
				<Row>
					<Col span={12}>
						<div style={{ width: 100 }} />
						<Typography.Title level={2}>Capturists</Typography.Title>
					</Col>
					<Col span={4} push={8}>
						<Button type="primary" block={true} onClick={this.onAddContact}>
							Add Capturist
						</Button>
					</Col>
				</Row>
				<Table pagination={{ pageSize: 30 }} className="gx-table-responsive" columns={columns} rowKey={"id"} dataSource={contactList} />
				<Add
					agents={this.state.agents}
					open={addContactState}
					contact={this.state.contact}
					onSaveContact={this.onSaveContact}
					onContactClose={this.onContactClose}
					onDeleteContact={this.onDeleteContact}
				/>
				<Elements>
					<Stripe open={this.state.stripeState} close={() => this.setState({ stripeState: false })} client={this.state.client} />
				</Elements>
			</Card>
		);
	}
}

const mapStateToProps = ({ agents }) => {
	const { contactList, selectedContact } = agents;
	return { contactList, selectedContact };
};
export default connect(mapStateToProps, {
	onGetAllContact,
	onAddContact,
	onUpdateContact,
	onDeleteContact,
})(FirebaseCRUD);
