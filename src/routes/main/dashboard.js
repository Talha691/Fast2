//dasborad.js src/routes/main
import React from "react";
import moment from "moment";
import { Col, Row, Table } from "antd";
import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { increamentData } from "../../Metrics/data";

import ChartCard from "../../components/dashboard/Crypto/ChartCard";
import Widget from "../../components/Widget/index";
import Auxiliary from "util/Auxiliary";
import async from "async";
import { connect } from "react-redux";
import CarChart from "./carChart";
import TruckChart from "./truckChart";
import MoneyChart from "./moneyChart";
import { firestore } from "../../firebase/firebase";
import { onGetAllUsers } from "../../appRedux/actions/Users";
import { onGetAllAgents } from "../../appRedux/actions/Agents";
import { onGetAllClient } from "../../appRedux/actions/Clients";

const columns = [
	{
		title: "Insurance ID",
		dataIndex: "insuranceID",
	},
	{
		title: "Client",
		dataIndex: "clientName",
	},
	{
		key: "date",
		title: "Date",
		dataIndex: "timestamp",
		render: text => {
			const date = text ? text["toDate"]?.() ?? text : null;
			if (date) return <span>{moment(date).format("lll")}</span>;
			return null;
		},
	},
	{
		key: "price",
		title: "Price",
		dataIndex: "total",
		render: text => {
			return <span className="gx-text-primary">${text}</span>;
		},
	},
];

class FakeChart extends React.Component {
	render() {
		return (
			<ResponsiveContainer width="100%" height={50}>
				<AreaChart data={increamentData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
					{/*<Tooltip/>*/}
					<defs>
						<linearGradient id="color3" x1="0" y1="0" x2="1" y2="0">
							<stop offset="5%" stopColor="#11489F" stopOpacity={0.9} />
							<stop offset="95%" stopColor="#F5FCFD" stopOpacity={0.9} />
						</linearGradient>
					</defs>
					<Area dataKey="price" strokeWidth={0} stackId="2" stroke="#4D95F3" fill="url(#color3)" fillOpacity={1} />
				</AreaChart>
			</ResponsiveContainer>
		);
	}
}

const BoxOverview = ({ id, icon, name }) => {
	return (
		<div className="gx-d-flex gx-align-items-start">
			<div className="gx-p-3 gx-bg-white gx-rounded-lg gx-mr-3 gx-BoxOverview-shadow">
				<i className={`icon fas fa-${icon} gx-fs-xl gx-ml-auto gx-BoxOverview-icon-color gx-fs-xxxl`} style={{ fontSize: 55 }} />
			</div>
			<div className="gx-pt-2">
				<p className="gx-BoxOverview-text gx-delete-margin-p">{name}</p>
				<p className="gx-BoxOverview-number gx-delete-margin-p">{id}</p>
			</div>
		</div>
	);
};

class Dashboard extends React.Component {
	state = {
		isAdmin: false,
		loading: false,
		carTotal: 0,
		truckTotal: 0,
		clientsTotal: 0,
		agentsTotal: 0,
		carInsurances: [],
		truckInsurances: [],
		insurances: [],
		limit: 10,
		last5CarInsurances: [],
		last5TruckInsurances: [],
	};

	componentDidMount() {
		if (this.props.auth.type.endsWith("Admin")) {
			this.get();
			this.props.onGetAllAgents();
			this.props.onGetAllUsers();
		}
		this.onGetAllCarInsurances(this.props.auth);
		this.onGetAllTruckInsurances(this.props.auth);
		this.props.onGetAllClient(this.props.auth);
	}
	onGetAllCarInsurances = async auth => {
		if (auth.type === "Agent" || auth.type === "Group" || auth.agent) {
			return this.getAgentDataCar(auth);
		}
		const agents = await firestore.collection("agents").get();
		let allClients = [];
		firestore
			.collection("car-insurance")
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				async.eachSeries(snapshot.docs, (doc, callback) => {
					let agent = "-";
					if (doc.data().fromAgent) {
						const myAgent = agents.docs.find(x => x.id === doc.data().agent.id);
						agent = myAgent ? myAgent.data().name : "--";
					}
					allClients.push({
						id: doc.id,
						agentName: agent,
						...doc.data(),
						status: doc.data().to
							? moment(doc.data().to.toDate()).isBefore(moment())
								? "Expired"
								: doc.data().status
								? doc.data().status
								: "Active"
							: "-",
					});
					callback();
				});

				this.setState({
					carInsurances: allClients,
					loading: false,
				});
			});
	};
	onGetAllTruckInsurances = async auth => {
		if (auth.type === "Agent" || auth.type === "Group" || auth.agent) {
			return this.getAgentDataTruck(auth);
		}
		const agents = await firestore.collection("agents").get();
		firestore
			.collection("truck-insurance")
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(snapshot.docs, (doc, callback) => {
					let agent = "-";
					if (doc.data().fromAgent) {
						const myAgent = agents.docs.find(x => x.id === doc.data().agent.id);
						agent = myAgent ? myAgent.data().name : "--";
					}
					allClients.push({
						id: doc.id,
						agentName: agent,
						...doc.data(),
						status: doc.data().to
							? moment(doc.data().to.toDate()).isBefore(moment())
								? "Expired"
								: doc.data().status
								? doc.data().status
								: "Active"
							: "-",
					});
					callback();
				});
				this.setState({ truckInsurances: allClients, loading: false }, () => {
					this.setState({
						insurances: this.state.carInsurances
							.concat(this.state.truckInsurances)
							.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf()),
					});
				});
			});
	};
	getAgentDataTruck = async auth => {
		const agent = firestore.doc("agents/" + auth.agent);
		const agentData = await agent.get();
		firestore
			.collection("truck-insurance")
			.where("agent", "==", agent)
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(snapshot.docs, (doc, callback) => {
					allClients.push({
						id: doc.id,
						agentName: agentData.data().name,
						...doc.data(),
						status: doc.data().to
							? moment(doc.data().to.toDate()).isBefore(moment())
								? "Expired"
								: doc.data().status
								? doc.data().status
								: "Active"
							: "-",
					});
					this.setState(
						{
							truckInsurances: allClients,

							loading: false,
						},
						() => {
							this.setState({
								insurances: this.state.carInsurances
									.concat(this.state.truckInsurances)
									.sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf()),
							});
						}
					);
					callback();
				});
			});
	};
	getAgentDataCar = async auth => {
		const agent = firestore.doc("agents/" + auth.agent);
		const agentData = await agent.get();
		firestore
			.collection("car-insurance")
			.where("agent", "==", agent)
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(snapshot.docs, (doc, callback) => {
					allClients.push({
						id: doc.id,
						agentName: agentData.data().name,
						...doc.data(),
						status: doc.data().to
							? moment(doc.data().to.toDate()).isBefore(moment())
								? "Expired"
								: doc.data().status
								? doc.data().status
								: "Active"
							: "-",
					});
					callback();
				});
				this.setState({
					carInsurances: allClients,
					loading: false,
					last5CarInsurances: [...allClients].splice(0, 5),
				});
			});
	};

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		if (nextProps.contactList) {
			this.setState({
				contactList: nextProps.contactList,
			});
		}
		if (nextProps.agents) {
			this.setState({
				agents: nextProps.agents,
			});
		}
	}
	async get() {
		//const data = await functions.httpsCallable("dashboard")({});
		this.setState({
			isAdmin: true,
			loading: false,
			//...data.data,
			//insurances: data.data.carInsurances.concat(data.data.truckInsurances).sort((a, b) => moment(b.timestamp).valueOf() - moment(a.timestamp).valueOf())
		});
	}

	render() {
		return (
			<Auxiliary>
				<Row>
					{this.props.auth?.type?.endsWith("Admin") ? (
						<React.Fragment>
							<Col span={24}>
								<h1 className="gx-BoxOverview-tittle">Overview</h1>
							</Col>
							<Col xl={6} lg={12} xs={24}>
								<BoxOverview id={this.state.carInsurances.length} icon="car-side" name="Car Insurances" />
							</Col>
							<Col xl={6} lg={12} xs={24}>
								<BoxOverview id={this.state.truckInsurances.length} icon="truck-moving" name="Truck Insurances" />
							</Col>
							<Col xl={6} lg={12} xs={24}>
								<BoxOverview id={this.state.contactList?.contactList?.length} icon="user-tie" name="Users" />
							</Col>
							<Col xl={6} lg={12} xs={24} className="gx-mb-4">
								<BoxOverview id={this.state.agents?.length} icon="briefcase" name="Agents" />
							</Col>
						</React.Fragment>
					) : null}
					{this.props.auth.type === "Agent" ? (
						<React.Fragment>
							<Col xl={24} lg={12} xs={24}>
								<h1 className="gx-BoxOverview-tittle">Overview</h1>
							</Col>
							<Col xl={6} lg={12} xs={24}>
								<BoxOverview id={this.state.carInsurances.length} icon="car-side" name="Car Insurances" />
							</Col>
							<Col xl={6} lg={12} xs={24}>
								<BoxOverview id={this.state.truckInsurances.length} icon="truck-moving" name="Truck Insurances" />
							</Col>
							<Col xl={6} lg={12} xs={24}>
								<BoxOverview id={this.state.contactList?.contactList?.length} icon="user-tie" name="Users" />
							</Col>
						</React.Fragment>
					) : null}

					<Col span={24}>
						<MoneyChart adminInsurances={this.state.insurances} />
					</Col>
					<Col xl={12} lg={24} md={12} sm={24} xs={24}>
						<CarChart adminInsurances={this.state.carInsurances} />
					</Col>
					<Col xl={12} lg={24} md={12} sm={24} xs={24}>
						<TruckChart adminInsurances={this.state.truckInsurances} />
					</Col>
					<Col xl={12} lg={24} md={12} sm={24} xs={24}>
						<Widget
							styleName="gx-order-history"
							title={<h2 className="h4 gx-text-capitalize gx-mb-0">Last 5 Car Insurances</h2>}
							extra={
								<Link to={"/car-insurance"}>
									<p className="gx-text-primary gx-mb-0 gx-pointer">Detailed History</p>
								</Link>
							}>
							<div className="gx-table-responsive">
								<Table
									rowKey="insuranceID"
									className="gx-table-no-bordered"
									columns={columns}
									dataSource={this.state.carInsurances.slice(0, 5)}
									pagination={false}
									bordered={false}
									size="small"
								/>
							</div>
						</Widget>
					</Col>
					<Col xl={12} lg={24} md={12} sm={24} xs={24}>
						<Widget
							styleName="gx-order-history"
							title={<h2 className="h4 gx-text-capitalize gx-mb-0">Last 5 Truck Insurances</h2>}
							extra={
								<Link to={"/truck-insurance"}>
									<p className="gx-text-primary gx-mb-0 gx-pointer">Detailed History</p>
								</Link>
							}>
							<div className="gx-table-responsive">
								<Table
									rowKey="insuranceID"
									className="gx-table-no-bordered"
									columns={columns}
									dataSource={this.state.truckInsurances.slice(0, 5)}
									pagination={false}
									bordered={false}
									size="small"
								/>
							</div>
						</Widget>
					</Col>
				</Row>
			</Auxiliary>
		);
	}
}

const mapStateToProps = state => {
	return {
		auth: state.auth,
		users: Object.keys(state.users.contactList).map(key => state.users.contactList[key]),
		agents: state.agents.contactList,
		clients: state.clients.contactList,
		contactList: state.clients,
	};
};
export default connect(mapStateToProps, {
	onGetAllUsers,
	onGetAllClient,
	onGetAllAgents,
})(Dashboard);
