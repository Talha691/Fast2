import React from "react";
import { Col, Row, Table, Button } from "antd";

import WelComeCard from "components/dashboard/CRM/WelComeCard";
import Auxiliary from "util/Auxiliary";
import Widget from "components/Widget/index";

import { connect } from "react-redux";
import { onGetAllCoverages } from "../../appRedux/actions/Coverages";

import csv from "../../util/csv";
import moment from "moment";
import async from "async";
import { firestore } from "../../firebase/firebase";

const columns = [
	{
		title: "Insurance ID",
		dataIndex: "insuranceID",
	},
	{
		key: "type",
		title: "Type",
		dataIndex: "insuranceID",
		render: text => {
			if (!text) {
				return null;
			}
			if (text.toString().charAt(0) === "T") {
				return "Truck Insurance";
			}
			if (text.toString().charAt(0) === "C") {
				return "Car Insurance";
			}
			return null;
		},
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
			const date = text ? text.toDate() : null;
			if (date) {
				return <span>{moment(date).format("lll")}</span>;
			}
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

const columns2 = [
	{
		key: "date",
		title: "Date",
		dataIndex: "timestamp",
		render: text => {
			const date = text ? text.toDate() : null;
			if (date) {
				return <span>{moment(date).format("lll")}</span>;
			}
			return null;
		},
	},
	{
		title: "User",
		dataIndex: "userName",
	},
	{
		title: "Client",
		dataIndex: "clientName",
	},
	{
		title: "Insurance Type",
		dataIndex: "coverageName",
	},
	{
		key: "total",
		title: "Total",
		dataIndex: "total",
		render: text => {
			return <span className="gx-text-primary">${text}</span>;
		},
	},
	{
		title: "Profit",
		dataIndex: "profit",
		render: text => {
			return <span className="gx-text-primary">${text}</span>;
		},
	},
];

const columns3 = [
	{
		key: "date",
		title: "Date",
		dataIndex: "timestamp",
		render: text => {
			const date = text ? text.toDate() : null;
			if (date) {
				return <span>{moment(date).format("lll")}</span>;
			}
			return null;
		},
	},
	{
		title: "User",
		dataIndex: "userName",
	},
	{
		title: "Client",
		dataIndex: "clientName",
	},
	{
		title: "Insurance Type",
		dataIndex: "coverageName",
	},
	{
		key: "total",
		title: "Total",
		dataIndex: "total",
		render: text => {
			return <span className="gx-text-primary">${text}</span>;
		},
	},
	{
		title: "Profit",
		dataIndex: "profit",
		render: text => {
			return <span className="gx-text-primary">${text}</span>;
		},
	},
];

class CRM extends React.Component {
	state = {
		firstReport: [],
		secondReport: [],
		voids: [],
		insurances: [],
		limit: process.env.NODE_ENV === "development" ? 1000 : 1000,
	};
	componentDidMount() {
		
		this.onGetAllCarInsurances(this.props.auth);
		this.onGetAllTruckInsurances(this.props.auth);
		this.props.onGetAllCoverages(this.props.auth);
	}
	componentDidUpdate(prevProps, prevstate) {
		if (this.state.carInsurances && this.state.truckInsurances) {
			if (this.state.insurances.length <= 0) {
				this.setState({
					insurances: this.state.carInsurances.concat(this.state.truckInsurances).sort((a, b) => b.timestamp.seconds - a.timestamp.seconds),
				});
			}
		}
	}
	onGetAllCarInsurances = async auth => {
		try {
			if (auth.type === "Agent" || auth.type === "Group" || auth.agent) {
				return this.getAgentDataCar(auth);
			}
			const agentsSnapshot = await firestore.collection("agents").get();
			const agents = agentsSnapshot.docs.reduce((acc, doc) => {
				acc[doc.id] = doc.data().name;
				return acc;
			}, {});
	
			firestore
				.collection("car-insurance")
				.orderBy("timestamp", "desc")
				.limit(this.state.limit)
				.onSnapshot(snapshot => {
					let allClients = [];
					snapshot.docs.forEach(doc => {
						let agent = "-";
						if (doc.data().fromAgent) {
							const agentName = agents[doc.data().agent.id] || "--";
							agent = agentName;
						}
						const to = doc.data().to;
						let status = "-";
						if (to) {
							status = moment(to.toDate()).isBefore(moment()) ? "Expired" : doc.data().status || "Active";
						}
	
						allClients.push({
							id: doc.id,
							agentName: agent,
							...doc.data(),
							status: status,
						});
					});
					this.setState({
						carInsurances: allClients,
						loading: false,
					});
				}, error => {
					// Aquí capturamos errores específicos del onSnapshot
					console.error("Error al obtener los datos de seguros de coche: ", error);
					this.setState({ loading: false, error: error.toString() });
				});
		} catch (error) {
			// Aquí capturamos errores generales de la función
			console.error("Error al obtener seguros de coche: ", error);
			this.setState({ loading: false, error: error.toString() });
		}
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
				this.setState({
					truckInsurances: allClients,
					loading: false,
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
					this.setState({
						truckInsurances: allClients,
						loading: false,
					});
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
				});
			});
	};

	componentWillReceiveProps(nextProps, nextContext) {
		this._loadReports();
	}

	_loadReports = () => {
		const firstReport = [];
		const secondReport = [];
		const voids = [];
		return async.eachOf(
			this.state.insurances,
			(insurance, index, callback) => {
				const coverage = this.props.coverages[insurance.coverage.id];
				if (coverage) {
					// eslint-disable-next-line
					this.state.insurances[index].profit = coverage.profit;
					firstReport.push({
						"Insurance ID": insurance.insuranceID,
						"Insurance Type": insurance.insuranceID.toString().charAt(0) === "T" ? "Truck Insurance" : "Car Insurance",
						Client: insurance.clientName,
						Date: moment(insurance.timestamp.toDate()).format("lll"),
						Total: insurance.total,
					});

					secondReport.push({
						Date: moment(insurance.timestamp.toDate()).format("lll"),
						User: insurance.userName,
						Client: insurance.clientName,
						"Insurance Type": insurance.insuranceID.toString().charAt(0) === "T" ? "Truck Insurance" : "Car Insurance",
						Total: insurance.total,
						Profit: coverage.profit,
					});

					if (insurance.void) {
						voids.push({
							Date: moment(insurance.timestamp.toDate()).format("lll"),
							User: insurance.userName,
							Client: insurance.clientName,
							"Insurance Type": insurance.insuranceID.toString().charAt(0) === "T" ? "Truck Insurance" : "Car Insurance",
							Total: insurance.total,
							Profit: coverage.profit,
						});
					}
					callback();
				} else {
					callback();
				}
			},
			() => {
				this.setState({
					firstReport: firstReport,
					secondReport: secondReport,
					voids: voids,
				});
			}
		);
	};

	render() {
		return (
			<Auxiliary>
				<Row>
					<Col span={24}>
						<Row>
							<Col xl={6} lg={12} md={12} sm={12} xs={24}>
								<WelComeCard />
							</Col>
						</Row>
					</Col>
					<Col span={24}>
						<Widget
							styleName="gx-order-history"
							title={<h2 className="h4 gx-text-capitalize gx-mb-0">All Insurances</h2>}
							extra={
								<Button type={"link"} onClick={() => csv(this.state.firstReport, "First Report")}>
									Export to Excel
								</Button>
							}>
							<div className="gx-table-responsive">
								<Table
									rowKey="insuranceID"
									className="gx-table-no-bordered"
									columns={columns}
									dataSource={this.state.insurances}
									bordered={false}
									size="small"
								/>
							</div>
						</Widget>
					</Col>
					{this.props.auth.type.endsWith("Admin") ? (
						<Col span={24}>
							<Widget
								styleName="gx-order-history"
								title={<h2 className="h4 gx-text-capitalize gx-mb-0">Utilities</h2>}
								extra={
									<Button type={"link"} onClick={() => csv(this.state.secondReport, "Second Report")}>
										Export to Excel
									</Button>
								}>
								<div className="gx-table-responsive">
									<Table
										rowKey="insuranceID"
										className="gx-table-no-bordered"
										columns={columns2}
										dataSource={this.state.insurances}
										bordered={false}
										size="small"
									/>
								</div>
							</Widget>
						</Col>
					) : null}
					{this.props.auth.type.endsWith("Admin") ? (
						<Col span={24}>
							<Widget
								styleName="gx-order-history"
								title={<h2 className="h4 gx-text-capitalize gx-mb-0">Voids</h2>}
								extra={
									<Button type={"link"} onClick={() => csv(this.state.voids, "Voids Report")}>
										Export to Excel
									</Button>
								}>
								<div className="gx-table-responsive">
									<Table
										rowKey="insuranceID"
										className="gx-table-no-bordered"
										columns={columns3}
										dataSource={this.state.insurances.filter(x => x.void)}
										bordered={false}
										size="small"
									/>
								</div>
							</Widget>
						</Col>
					) : null}
				</Row>
			</Auxiliary>
		);
	}
}

const mapStateToProps = state => {
	const coverages = state.coverage.contactList;
	return {
		auth: state.auth,
		coverages,
	};
};
export default connect(mapStateToProps, {
	onGetAllCoverages,
})(CRM);
