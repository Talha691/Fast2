import React from "react";
import { Button, Col, DatePicker, Row, Select, Spin, Modal } from "antd";
import { Table } from "antd-new";
import Widget from "../../components/Widget";
import Auxiliary from "../../util/Auxiliary";

import async from "async";
import axios from "axios";
import moment from "moment";
import { connect } from "react-redux";

import { onGetAllCoverages } from "../../appRedux/actions/Coverages";

import { firestore } from "../../firebase/firebase";
import csv from "../../util/csv";

class Summary extends React.Component {
	state = {
		thirdReport: [],
		searchThirdReport: [],
		agents: [],
		coverages: [],
		firstDate: moment().subtract(1, "weeks"),
		secondDate: moment(),
		agent: "",
		method: "",
		vehicle: "",
		coverage: "",
		loading: true,
	};

	async componentDidMount() {
		await this.getAgents();
		await this.getCoverages();
		await this.getSummaryData();
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
						return this.setState({ agents: allAgents });
					}
				);
			});
	}

	getCoverages() {
		return firestore
			.collection("coverage")
			.orderBy("name", "asc")
			.get()
			.then(coverage => {
				const allCoverages = [];
				return async.eachOf(
					coverage.docs,
					(coverage, key, callback) => {
						allCoverages.push({
							key: coverage.id,
							coverage: coverage.data().name,
							active: coverage.data().active,
						});
						callback();
					},
					() => this.setState({ coverages: allCoverages })
				);
			});
	}

	async getSummaryData(loading) {
		const res = await axios.get("https://global-functions.cr.studiomediaagency.com/fast-transit", {
			params: {
				agent: this.props.auth.agent,
				from: this.state.firstDate.format(),
				to: this.state.secondDate.format(),
			},
		});
		if (this.props.auth.type === "Agent" || this.props.auth.type === "Group") {
			let agentData = [...res.data];
			agentData.forEach(i => {
				delete i.fee;
				delete i.total;
			});
			return this.setState({
				thirdReport: res.data,
				searchThirdReport: agentData.filter(e => e.agent === this.props.auth.displayName),
				loading: loading ?? false,
			});
		} else {
			let data = [...res.data];
			return this.setState({
				thirdReport: data,
				searchThirdReport: data,
				loading: loading ?? false,
			});
		}
	}

	search = async () => {
		this.setState({ loading: true });
		await this.getSummaryData(true);
		const { thirdReport, agent, method, vehicle, coverage } = this.state;
		let searchThirdReport = [...thirdReport];
		let newReport = [];
		if (this.props.auth.type === "Agent" || this.props.auth.type === "Group") {
			searchThirdReport = searchThirdReport.filter(e => e.agentID === this.props.auth.agent);
		} else {
			if (agent) {
				searchThirdReport = searchThirdReport.filter(e => e.agentID === agent);
			}
		}
		if (method) {
			searchThirdReport = searchThirdReport.filter(e => e.method === method);
		}
		if (vehicle) {
			searchThirdReport = searchThirdReport.filter(e => e.type === vehicle);
		}

		let reports = [];
		for (let i = 0; i < coverage.length; i++) {
			reports.push(searchThirdReport.filter(e => e.coverageID === coverage[i]));
		}
		if (coverage.includes("") || coverage.length === 0) {
			this.setState({ searchThirdReport: searchThirdReport, loading: false });
		} else {
			reports.forEach(report => {
				report.forEach(report => {
					newReport.push({
						...report,
					});
				});
			});
			this.setState({ searchThirdReport: newReport, loading: false });
		}
	};

	render() {
		const { searchThirdReport } = this.state;
		const columns3 = [
			{
				title: "ID",
				key: "insuranceID",
				dataIndex: "insuranceID",
			},
			{
				title: "Date",
				key: "date",
				dataIndex: "date",
				render: text => {
					return moment(text).format("lll");
				},
			},
			{
				title: "Method",
				dataIndex: "method",
			},
			{
				title: "Type",
				dataIndex: "type",
			},
			{
				title: "Client",
				dataIndex: "client",
			},
			{
				key: "Price",
				title: "price",
				dataIndex: "price",
				render: text => {
					return <span className="gx-text-primary">${text}</span>;
				},
			},
			{
				key: "Global",
				title: "Fast In Transit",
				dataIndex: "global",
				render: global => {
					return <span className="gx-text-primary">${global}</span>;
				},
			},
			{
				key: "Commission",
				title: "commission",
				dataIndex: "commission",
				render: commission => {
					return <span className="gx-text-primary">${commission}</span>;
				},
			},
			{
				title: "Coverage",
				dataIndex: "coverage",
			},
		];

		if (this.props.auth.type.endsWith("Admin")) {
			columns3.splice(2, 0, {
				title: "Agent",
				dataIndex: "agent",
				filters: null,
				onFilter: (value, record) => String(value) === record.agent,
			});

			columns3.splice(7, 0, {
				key: "Stripe",
				title: "fee",
				dataIndex: "fee",
				render: fee => {
					return <span className="gx-text-primary">${fee}</span>;
				},
			});

			columns3.splice(8, 0, {
				title: "Total",
				dataIndex: "total",
				render: text => {
					return <span className="gx-text-primary">${text}</span>;
				},
			});
		}

		const extra = ["Report Summary"];
		if (this.state.firstDate) {
			extra.push("From Date, " + moment(this.state.firstDate).format("MMMM Do YYYY"));
		}
		if (this.state.secondDate) {
			extra.push("To Date, " + moment(this.state.secondDate).format("MMMM Do YYYY"));
		}

		const footer = () => {
			let sales = 0;
			let commissions = 0;
			let totalFee = 0;
			let global = 0;
			searchThirdReport.forEach(insurance => {
				sales += Number(insurance.price);
				commissions += insurance.commission;
				totalFee += insurance.fee;
				global += +insurance.global;
			});
			extra.push("Insurances, " + searchThirdReport.length);
			extra.push("Sales, " + sales.toFixed(2));
			extra.push("Fast In Transit, " + global.toFixed(2));
			extra.push("Commissions, " + commissions.toFixed(2));
			extra.push("Total, " + (sales - commissions).toFixed(2));
			return (
				<div style={{ textAlign: "end" }}>
					<p>Insurances: {searchThirdReport.length}</p>
					{this.props.auth.type.endsWith("Admin") ? (
						<React.Fragment>
							<p>Sales: $ {sales.toLocaleString("en-US")}</p>
							<p>Fast In Transit: $ {global.toLocaleString("en-US")}</p>
							<p>Commissions: $ {commissions.toLocaleString("en-US")}</p>
							<p>Fees: $ {totalFee.toLocaleString("en-US")}</p>
						</React.Fragment>
					) : null}
					<p>Total: $ {(sales - commissions).toLocaleString("en-US")}</p>
				</div>
			);
		};

		const open = async type => {
			const m = Modal.warning({
				title: "Your file is being processed. Please Wait...",
				content: <Spin />,
				okText: "Close",
			});

			const extra = ["Report Summary"];
			if (this.state.firstDate) {
				extra.push("From Date, " + moment(this.state.firstDate).format("MMMM Do YYYY"));
			}
			if (this.state.secondDate) {
				extra.push("To Date, " + moment(this.state.secondDate).format("MMMM Do YYYY"));
			}

			const data = this.state.searchThirdReport;
			const transformedData = data.map(item => {
				const localDate = new Date(item.date).toLocaleString();
				return {
					...item,
					date: localDate
				};
			});
			const sales = transformedData.reduce((a, b) => a + b.price, 0).toFixed(2);
			const global = transformedData.reduce((a, b) => a + b.global, 0).toFixed(2);
			const commission = transformedData.reduce((a, b) => a + b.commission, 0).toFixed(2);
			extra.push("Insurances, " + transformedData.length);
			extra.push("Sales, " + sales);
			extra.push("Fast In Transit, " + global);
			extra.push("Commissions, " + commission);
			extra.push("Total, " + (sales - commission).toFixed(2));

			const url = await axios({
				url: `https://us-central1-fast-in-transit.cloudfunctions.net/getSummary${type}`,
				method: "POST",
				data: {
					data: transformedData,
					extra: extra,
				},
			});
			console.log(url)

			m.update({
				title: "Your file is ready!",
				content: (
					<>
						<Button type={"link"}>
							<a href={url.data} rel={"noreferrer noopener"} target={"_blank"}>
								Download
							</a>
						</Button>
						<Button type={"link"}>
							<a
								href={`https://api.whatsapp.com/send?text=Report%20${encodeURIComponent(url.data)}`}
								target={"_blank"}
								rel={"noreferrer noopener"}>
								Share on Whatsapp
							</a>
						</Button>
					</>
				),
			});
		};

		return (
			<Auxiliary>
				<Row>
					<Col span={24}>
						<Widget
							styleName="gx-order-history"
							title={<h2 className="h1 gx-text-capitalize gx-mb-0">Reports</h2>}
							extra={
								<>
									<Button type={"link"} onClick={() => open("PNG")}>
										Export to Image
									</Button>
									<Button type={"link"} onClick={() => open("PDF")}>
										Export to PDF
									</Button>
									<Button type={"link"} onClick={() => csv(this.state.searchThirdReport, "Fast In Transit Insurance Report", extra)}>
										Export to Excel
									</Button>
								</>
							}>
							<div className="gx-table-responsive">
								<Row gutter={12} style={{ padding: "20px 0" }}>
									<Col span={8}>
										<DatePicker.RangePicker
											style={{ width: "100%" }}
											format={"ll"}
											defaultValue={[moment().subtract(1, "weeks"), moment()]}
											onChange={e => {
												this.setState({
													firstDate: e?.[0]?.startOf("day") ?? null,
													secondDate: e?.[1]?.endOf("day") ?? null,
												});
											}}
										/>
									</Col>
									<Col span={3}>
										<Select defaultValue={this.state.method} onChange={e => this.setState({ method: e })} style={{ width: "100%" }}>
											<Select.Option value="">All Methods</Select.Option>
											<Select.Option value="Card">Card</Select.Option>
											<Select.Option value="Credit">Credit</Select.Option>
										</Select>
									</Col>
									{this.props.auth.type === "Agent" || this.props.auth.type === "Group" ? null : (
										<Col span={3}>
											<Select
												defaultValue={this.state.agent}
												onChange={e =>
													this.setState({
														agent: e,
													})
												}
												style={{ width: "100%" }}>
												<Select.Option value="">All Agents</Select.Option>
												{this.state.agents.map(agent => (
													<Select.Option key={agent.key} value={agent.key}>
														{agent.agentName}
													</Select.Option>
												))}
											</Select>
										</Col>
									)}

									<Col span={3}>
										<Select defaultValue={this.state.vehicle} onChange={e => this.setState({ vehicle: e })} style={{ width: "100%" }}>
											<Select.Option value="">All Vehicles</Select.Option>
											<Select.Option value="Car">Car</Select.Option>
											<Select.Option value="Truck">Truck</Select.Option>
										</Select>
									</Col>
									{console.log(this.state.coverage)}
									<Col span={3}>
										<Select
											defaultValue={this.state.coverage}
											onChange={e => this.setState({ coverage: e })}
											style={{ width: "100%" }}
											mode="multiple">
											<Select.Option value="">All Coverages</Select.Option>
											{this.state.coverages
											.filter(item => item.active)
											.map(item => (
												<Select.Option key={item.key} value={item.key}>
													{item.coverage}
												</Select.Option>
											))}
										</Select>
									</Col>
									<Col>
										<Button type={"primary"} onClick={this.search}>
											Search
										</Button>
									</Col>
								</Row>
								<Table
									summary={pageData => {
										return (
											<Table.Summary.Row>
												<Table.Summary.Cell />
												<Table.Summary.Cell />
												<Table.Summary.Cell />
												<Table.Summary.Cell />
												<Table.Summary.Cell />
												<Table.Summary.Cell />
												<Table.Summary.Cell>${pageData.reduce((a, b) => a + b.price, 0).toLocaleString("en-US")}</Table.Summary.Cell>
												<Table.Summary.Cell>${pageData.reduce((a, b) => a + b.fee, 0).toLocaleString("en-US")}</Table.Summary.Cell>
												<Table.Summary.Cell>${pageData.reduce((a, b) => a + b.total, 0).toLocaleString("en-US")}</Table.Summary.Cell>
												<Table.Summary.Cell>${pageData.reduce((a, b) => a + b.global, 0).toLocaleString("en-US")}</Table.Summary.Cell>
												<Table.Summary.Cell>
													${pageData.reduce((a, b) => a + b.commission, 0).toLocaleString("en-US")}
												</Table.Summary.Cell>
											</Table.Summary.Row>
										);
									}}
									footer={footer}
									rowKey="insuranceID"
									loading={this.state.loading}
									pagination={{ pageSize: 30 }}
									className="gx-table-no-bordered"
									columns={columns3}
									dataSource={this.state.searchThirdReport}
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
	};
};
export default connect(mapStateToProps, {
	onGetAllCoverages,
})(Summary);
