import React from "react";
import { Modal, Button, Select, Input, Checkbox, Row, Col, Typography } from "antd";
import { connect } from "react-redux";
import moment from "moment";
import async from "async";

import Customers from "./addInsurance/customers";
import Coverages from "./addInsurance/coverages";
import Vehicles from "./addInsurance/vehicles";
import Dates from "./addInsurance/dates";
import Price from "./addInsurance/price";
import PaymentMethod from "./addInsurance/paymentMethod";

import ConfirmVin from "./addInsurance/confirmVin";
import purchase from "./addInsurance/purchase";
import errors from "./addInsurance/errors";
import save from "./addInsurance/save";

import { onAddClient } from "../appRedux/actions/Clients";
import AddClient from "../routes/data/clients/add";
import saveDraft from "./addInsurance/saveDraft";
import { disconnect } from "./terminal";
import { firestore } from "../firebase/firebase";
import { Switch } from "antd-new";

class Add extends React.PureComponent {
	state = {
		loading: false,
		loadingDraft: false,
		terminal: false,
		payingWithTerminal: false,
		coverages: [],
		availableAgents: [],
		isPolicyPaid: false,
		policyPaidId: "",
		partial_payment: false,
		partial_payment_sw:false,
		token_payment_data:[]
	};
	

	componentDidCatch(error, errorInfo) {
		this.setState({ loading: false });
		Modal.error({
			title: "Looks like there something went wrong",
			content: error + " " + errorInfo + " Logs:" + JSON.stringify({ ...this.state, coverages: null }),
		});
		
	}

	autorizeCompleted = (newState) => {
		this.setState(newState);
	  };

	verify = e => {
		e.preventDefault();
		const parent = this;
		errors(this.state, this.props, this.state.token_payment_data)
		.then((paymentMethodId) => {
		
				Modal.confirm({
					title: "Are you sure you want to create this insurance?",
					content: <ConfirmVin vin={this.state.vin} />,
					onOk() {
						return parent.purchase(paymentMethodId);
					},
				});
			})
			.catch(e => {
				return Modal.error(e);
			});
	};

	purchase = async (paymentMethodId) => {
		//console.log(this.state)
		this.loadingHandler(true);
		purchase(this.state, this.props,paymentMethodId)
			.then(res => {
				console.log(res)
				/*save(res.receipt, res.charge, res.method, res.methodSource, this.state, this.props)
					.then(() => {
						this.loadingHandler(false);
						this.props.onContactClose();
					})
					.catch(e => {
						this.loadingHandler(false);
						return Modal.error(e);
					});*/
			})
			.catch(e => {
				this.loadingHandler(false);
				return Modal.error(e);
			});
	};

	loadingHandler = load => {
		if (this.state.terminal) {
			this.setState({ payingWithTerminal: load });
		} else {
			this.setState({ loading: load });
		}
	};

	saveAsDraft = () => {
		this.setState({ loadingDraft: true });
		saveDraft(this.state, this.props).then(() => {
			this.setState({ loadingDraft: false });
			this.props.onContactClose();
		});
	};

	paypalCompleted = (details, data) => {
		save(data["orderID"], null, "Card", "Paypal", this.state, this.props)
			.then(() => {
				this.setState({ loading: false });
				this.props.onContactClose();
			})
			.catch(e => {
				return Modal.error(e);
			});
	};

	onSaveClient = (id, data) => {
		this.props.onAddClient(
			{
				...data,
				timestamp: moment().toDate(),
			},
			this.props.auth
		);
	};

	onClientClose = () => {
		this.setState({
			addClient: false,
		});
	};

	componentDidMount() {
		if (this.props.auth.type === "capturist") {
			this.getAgents();
		}
		if(this.props.auth.type === "Agent"){
			const agentRef = firestore.doc("agents/" + this.props.auth.uid);
			agentRef.get().then((e)=>{
				//console.log(e.data().partial_payment)
				this.setState({ partial_payment: e.data().partial_payment });
			})
		}
		//console.log(this.props.auth);
		//console.log(this.state);
	}
	async getMyAgents() {
		if (this.props.auth.type === "capturist") {
			const agentRef = firestore.doc("capturists/" + this.props.auth.uid);
			const agentData = await agentRef.get();
			return agentData.data().selectedAgents;
		}
	}
	async getAgents() {
		const myAgents = await this.getMyAgents();
		return firestore
			.collection("agents")
			.orderBy("name", "asc")
			.get()
			.then(agent => {
				const allAgents = [];
				return async.eachOfSeries(
					agent.docs,
					(agent, key, callback) => {
						if (myAgents.includes(agent.id)) {
							allAgents.push({
								key: agent.id,
								agentName: agent.data().name,
							});
						}

						callback();
					},

					() => {
						this.setState({ availableAgents: allAgents });
					}
				);
			});
	}
	render() {
		const { open } = this.props;
		const { Option } = Select;
		console.log(this.props)
		return (
			<React.Fragment>
				<Modal
					title={"Add Insurance"}
					toggle={this.props.onContactClose}
					visible={open}
					confirmLoading={this.state.loading}
					closable={false}
					onCancel={this.props.onContactClose}
					footer={null}>
					<form onSubmit={this.verify}>
						<Customers route={"car insurance"} state={this.state} type={this.props.type} onChange={e => this.setState(e)} />
						{this.props.auth.type === "capturist" && (
							<div className="gx-form-group">
								<Select
									value={this.state.selectedAgent}
									style={{ width: "100%" }}
									placeholder="Select Agent*"
									onChange={e => {
										this.setState({ selectedAgent: e });
									}}
									required>
									{this.state.availableAgents?.map(item => (
										<Option value={item.key} key={item.key}>
											{item.agentName}
										</Option>
									))}
								</Select>
							</div>
						)}
						<Coverages state={this.state} onChange={e => this.setState(e)} />
						<Vehicles state={this.state} type={this.props.type} onChange={e => this.setState(e)} />
						<Dates state={this.state} onChange={e => this.setState(e)} partial_payment_sw={this.state.partial_payment_sw} />
						<Price route={"car insurance"} state={this.state} />
						{this.props.auth.type === "capturist" && (
							<Row>
								<Col span={24}>
									<Typography.Title level={4}>Is Policy Paid</Typography.Title>
								</Col>

								<Col span={12}>
									<Checkbox
										onChange={value => {
											this.setState({
												isPolicyPaid: value.target.checked,
											});
										}}
									/>
									{this.state.isPolicyPaid && (
										<Input
											placeholder={"Policy Paid Id"}
											onChange={e => this.setState({ policyPaidId: e.target.value })}
											value={this.state.policyPaidId}
										/>
									)}
								</Col>
							</Row>
						)}

						<PaymentMethod state={this.state} props={this.props} autorizeCompleted={this.autorizeCompleted} paypalCompleted={this.paypalCompleted} />
						<div className={"gx-form-group"} style={{ textAlign: "right", marginTop: 20, marginBottom: -20 }}>
							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<div>
									<Button onClick={this.saveAsDraft} type={"default"} loading={this.state.loading} disabled={this.state.loadingDraft}>
										Save as Draft
									</Button>
								</div>
								<div>
									<Button
										type={"danger"}
										onClick={() => {
											if (this.state.payingWithTerminal) {
												this.setState({ payingWithTerminal: false });
												return disconnect();
											} else {
												this.props.onContactClose();
											}
										}}>
										Cancel
									</Button>
									{this.props.configuration === "paypal" ? null : (
										<>
											<Button
												htmlType={"submit"}
												onClick={() => this.setState({ terminal: true })}
												type={"primary"}
												loading={this.state.payingWithTerminal}>
												Use terminal
											</Button>
											<Button
												htmlType={"submit"}
												onClick={() => this.setState({ terminal: false })}
												type={"primary"}
												loading={this.state.loading}>
												Submit
											</Button>
										</>
									)}
								</div>
							</div>
						</div>
					</form>
				</Modal>
				<AddClient
					open={this.state.addClient}
					onSaveContact={this.onSaveClient}
					onContactClose={this.onClientClose}
					contact={{
						thumb: "",
						type: "",
						phone: "",
						name: "",
						email: "",
						rfc: "",
						dob: null,
						address: "",
						city: "",
						state: "",
						zip: "",
						country: "",
						notes: "",
					}}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {
	let coverages = [];
	async.forEachOf(state.coverage.contactList, (element, index, callback) => {
		coverages.push({
			id: index,
			name: element.name,
			type: element.type,
			price: element.price,
			profit: element.profit,
			notes: element.notes,
			days: element.days,
			sr22: element.sr22 ? element.sr22 : false,
			pipe: element.pipe ? element.pipe : false,
			vehicles: element.vehicles,
		});
		callback();
	});
	return {
		coverages,
		auth: state.auth,
		clients: state.clients.contactList,
	};
};

export default connect(mapStateToProps, {
	onAddClient,
})(Add);
