import React from "react";
import async from "async";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Card, Col, Row, Typography, Table, Modal, DatePicker, InputNumber, Input, notification, Spin, Select } from "antd";
import { onGetAllAgentsAsync } from "../../../appRedux/actions/Agents";
import { firestore } from "../../../firebase/firebase";
import PaymentHistoryModal from "./paymentHistioryModal";
import { CSVLink } from "react-csv";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentMethod from "../../../../src/util/addInsurance";
import {CardElement} from "@stripe/react-stripe-js";
import {functions} from "../../../firebase/firebase"; //firebase/firebase
import StripePaymentProcessor from "./StripePaymentProcessor";




class Payments extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			agents: [],
			visiblePaymentModal: false,
			visibleHistoryModal: false,
			date: null,
			paymentAmount: null,
			checkNumber: "",
			notes: "",
			userPaymentID: "",
			userPaymentName: "",
			tableLoading: true,
			paymentHistoryLoading: true,
			paymentHistory: [],
			makePaymentLoading: false,
			agentsStandingBalance: 0,
			uid: "",
			csvData: [],
			openCSVModal: false,
			generatedCSVData: false,
			configuration: null,
			stripe: null,
			elements: null,
		};
	}

	handleStripeReady = (stripe, elements) => {
		this.setState({ stripe: stripe, elements: elements });
    }

	async componentDidMount() {
		await this.props.getAgents();
		this.setState({ agents: this.props.agents, tableLoading: false });
		firestore
			.doc("configuration/panel")
			.get()
			.then(config => {
				this.setState({
					configuration: config.data().paymentMethod,
				});
			});
		const stripePromise = await loadStripe("pk_live_51OqggJIz0lpOCcFPmhpr8wOCcmZRafbxekCcRpb3Dbu5WdnKWHWScgA9A1sWXNsC0sJYXOgqfN8PJb8RAgc09qW300ROBMlIew");
		this.setState({ stripe: await stripePromise });

		//this.setState({ configuration:"asdasdasdasd" })
	}

	makePayment = async () => {
		const { date, type, paymentAmount, checkNumber, notes, userPaymentID } = this.state;
		this.setState({ makePaymentLoading: true });
		if (!paymentAmount) {
			this.setState({ makePaymentLoading: false }, () => notification.error({ message: "Ooops!", description: "Payment amount is missing." }));
			return null;
		}
		if (!date) {
			this.setState({ makePaymentLoading: false }, () => notification.error({ message: "Ooops!", description: "Date is missing." }));
			return null;
		}
		// if (paymentAmount > agentsStandingBalance) {
		// 	this.setState({ makePaymentLoading: false }, () => notification.error({message: "Ooops!", description: `Payment amount cant be more than standing balance. Standing balance is $${agentsStandingBalance}.`}));
		// 	return null;
		// }

		if (this.state.type === "card" && this.state.configuration === "stripe") {
			if (!this.state.stripe || !this.state.elements) {
				console.error("Stripe has not been initialized properly.");
				this.setState({ makePaymentLoading: false });
				return;
			}
	
			const elements = this.state.elements;
			const cardElement = elements.getElement(CardElement);
	
			try {
				const paymentIntentResponse = await functions.httpsCallable("paymentIntent")({
					amount: paymentAmount,
				});
	
				const confirmPaymentResponse = await this.state.stripe.confirmCardPayment(paymentIntentResponse.data, {
					payment_method: {
						card: cardElement,
						billing_details: {
							name: this.state.userPaymentName,
						},
					},
				});
	
				if (confirmPaymentResponse.error) {
					throw confirmPaymentResponse.error;
				}

				notification.success({ message: "Success!", description: "The stripe payment success" });
	
			} catch (error) {
				notification.error({ message: "Stripe Payment Failed", description: error.message });
				this.setState({ makePaymentLoading: false });
				return;
			}
		}

		try {
			await firestore.collection("agents/" + userPaymentID + "/payments").add({
				date: date.toDate() ?? null,
				type,
				checkNumber,
				notes,
				paymentAmount: type === "payment" ? paymentAmount : paymentAmount * -1,
			});
			notification.success({ message: "Success!", description: "The payment was entered properly" });
		} catch (error) {
			notification.error({ message: "Oops! something went wrong.", description: error.message });
		}
	
		this.setState({
			date: null,
			paymentAmount: null,
			checkNumber: "",
			notes: "",
			makePaymentLoading: false,
			visiblePaymentModal: false,
		});

	};

	getUserPaymentsInfo = uid => {
		this.setState({ paymentHistoryLoading: true });
		const paymentHistory = [];
		firestore
			.collection("agents/" + uid + "/payments")
			.orderBy("date", "desc")
			.get()
			.then(items => {
				async.eachOf(
					items.docs,
					(payment, key, callback) => {
						paymentHistory.push({
							id: payment.id,
							date: payment.data().date?.toDate() ?? null,
							type: payment.data().type,
							checkNumber: payment.data().checkNumber,
							paymentAmount: payment.data().paymentAmount ? payment.data().paymentAmount : 0,
							notes: payment.data().notes,
						});
						callback();
					},
					() => this.setState({ paymentHistory, uid: uid, paymentHistoryLoading: false, visibleHistoryModal: true })
				);
			});
	};

	onDateChange = date => {
		this.setState({ date });
	};

	onCancel = () => {
		this.setState({
			visiblePaymentModal: false,
			date: "",
			amount: null,
			checkNumber: "",
			notes: "",
		});
	};

	render() {
		const columns = [
			{
				title: "Company",
				dataIndex: "company",
			},
			{
				title: "Name",
				dataIndex: "name",
			},
			{
				title: "Email",
				dataIndex: "email",
			},
			// {
			// 	title: "Amount",
			// 	dataIndex: "creditAmount",
			// 	render: (data) => <p>${data ? data : 0}</p>,
			// },
			{
				title: "Actions",
				render: data => {
					return (
						<Row gutter={20}>
							<Col>
								<i
									style={{ cursor: "pointer", color: "#11489F" }}
									onClick={() =>
										this.setState({
											visiblePaymentModal: true,
											userPaymentID: data.id,
											userPaymentName: data.name,
											agentsStandingBalance: data.creditAmount ? data.creditAmount : 0,
										})
									}
									className="fas fa-hand-holding-usd"
								/>
							</Col>
							<Col>
								<i
									style={{ cursor: "pointer", color: "#11489F" }}
									onClick={() => this.getUserPaymentsInfo(data.id)}
									className="fas fa-money-bill-alt"
								/>
							</Col>
							<Col>
								<Link to={`/payments/${data.id}`}>
									<i className="fas fa-eye" />
								</Link>
							</Col>
						</Row>
					);
				},
			},
		];
		return (
			<Elements stripe={this.state.stripe}>
			<Card>
				<Modal visible={this.state.openCSVModal} footer={null} onCancel={() => this.setState({ openCSVModal: false })}>
					{this.state.generatedCSVData ? (
						<div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
							<Typography.Title level={3}>Your CSV File is ready for download...</Typography.Title>
							<CSVLink
								data={this.state.csvData}
								filename={"reports-" + this.state.name + ".csv"}
								asyncOnClick={false}
								onClick={() => this.setState({ openCSVModal: false })}>
								<Button>Download</Button>
							</CSVLink>
						</div>
					) : (
						<div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
							<Typography.Title level={3}>Preparing CSV for download...</Typography.Title>
							<Spin size={"large"} />
						</div>
					)}
				</Modal>
				<Modal
					title="Make a payment"
					visible={this.state.visiblePaymentModal}
					onCancel={this.onCancel}
					footer={[
						<Button key={"cancel"} onClick={this.onCancel}>
							Cancel
						</Button>,
						<Button type="primary" key={"create"} loading={this.state.makePaymentLoading} onClick={() => this.makePayment()}>
							Create
						</Button>,
					]}>
					<Row gutter={[8, 20]}>
						<Col span={12}>
							<label>
								Payment Type
								<Select value={this.state.type} onChange={type => this.setState({ type })} style={{ width: "100%" }}>
									<Select.Option value={"commission"}>Commission</Select.Option>
									<Select.Option value={"payment"}>Payment</Select.Option>
									{
										this.state.configuration === "stripe"?
											<Select.Option value={"card"}>Card</Select.Option>
										:null
									}
								</Select>
							</label>
						</Col>
						<Col span={12}>
							<label>
								Amount
								<InputNumber
									value={this.state.paymentAmount}
									onChange={amount => this.setState({ paymentAmount: amount })}
									style={{ width: "100%" }}
								/>
							</label>
						</Col>
						<Col span={12}>
							<label>
								Check Date
								<DatePicker format={"ll"} value={this.state.date} onChange={this.onDateChange} style={{ width: "100%" }} />
							</label>
						</Col>
						<Col span={12}>
							<label>
								Check Number (Optional)
								<Input
									value={this.state.checkNumber}
									onChange={e => this.setState({ checkNumber: e.target.value })}
									style={{ width: "100%" }}
								/>
							</label>
						</Col>
						<Col span={24}>
							<label style={{ fontSize: 16 }}>
								Notes (Optional)
								<Input.TextArea
									value={this.state.notes}
									onChange={e => this.setState({ notes: e.target.value })}
									rows={10}
									style={{ width: "100%" }}
								/>
							</label>
						</Col>
						{
							this.state.type === "card" && this.state.configuration === "stripe" && (
								<StripePaymentProcessor onStripeReady={this.handleStripeReady} />
							)
						}
					</Row>
				</Modal>
				{this.state.visibleHistoryModal ? (
					<PaymentHistoryModal
						paymentHistory={this.state.paymentHistory}
						uid={this.state.uid}
						cancel={() => this.setState({ visibleHistoryModal: false })}
						visible={this.state.visibleHistoryModal}
						paymentHistoryLoading={this.state.paymentHistoryLoading}
					/>
				) : null}
				<Row>
					<Col span={12}>
						<div style={{ width: 100 }} />
						<Typography.Title level={2}>Payments</Typography.Title>
					</Col>
				</Row>
				<Table pagination={{ pageSize: 30 }} loading={this.state.tableLoading} columns={columns} dataSource={this.state.agents} />
			</Card>
			</Elements>
		);
	}
}

const mapStateToProps = state => ({
	agents: state.agents.contactList,
});

const mapDispatchToProps = dispatch => ({
	getAgents: () => dispatch(onGetAllAgentsAsync()),
});
export default connect(mapStateToProps, mapDispatchToProps)(Payments);
