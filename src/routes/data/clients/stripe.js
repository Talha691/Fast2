import React from "react";
import {firestore} from "../../../firebase/firebase";
import {Button, Input, Modal, Row, Col, Typography} from "antd";
import {injectStripe} from "react-stripe-elements";
import {CardNumberElement, CardExpiryElement, CardCvcElement} from "react-stripe-elements";

class Stripe extends React.PureComponent {
	constructor(props) {
		super(props);
		this.fileInput = React.createRef();
		this.state = {
			client: props.client,
			cards: [],
			addingCard: false,
			name: null,
		}
	}

	componentDidMount() {
		if (this.props.client){
			return this._loadCards();
		}
	}

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		if (nextProps.client !== this.props.client) {
			return this._loadCards();
		}
	}

	_loadCards = async () => {
		await this.setState({cards: []});
		const path = "/clients/" + this.props.client + "/cards";
		const agentPath = "agents/" + this.props.auth.agent + path;
		firestore.collection(this.props.auth.agent ? agentPath : path).get()
			.then(cards => {
				cards.forEach(card => {
					this.setState({
						cards: [
							...this.state.cards,
							card.data(),
						],
					});
				});
			});
	};

	_addCard = async (e) => {
		e.preventDefault();
		if (!this.state.name) return false;
		const cardID = firestore.collection("clients/" + this.props.client + "/cards").doc().id;
		await this.setState({addingCard: true});
		const path = "/clients/" + this.props.client + "/cards/" + cardID;
		const agentPath = "agents/" + this.props.auth.agent + path;
		await this.props.stripe.createPaymentMethod("card", {
			billing_details: {
				name: this.state.name
			},
			metadata: {
				cardID: cardID
			}
		}).then(res => {
			if (res.error) {
				this.setState({
					addingCard: false,
				});
				return Modal.error({
					title: res.error.type,
					content: res.error.message,
				})
			}
			firestore.doc(this.props.auth.agent ? agentPath : path).set(res.paymentMethod);
			this.setState({
				addingCard: false,
				name: "",
			}, () => this._loadCards());
		}).catch(e => {
			this.setState({
				addingCard: false,
			});
			return Modal.error({
				title: e.name,
				content: e.message,
			})
		});
	};

	deleteCard = (id) => {
		const parent = this;
		const path = "/clients/" + this.props.client + "/cards/" + id;
		const agentPath = "agents/" + this.props.auth.agent + path;
		Modal.confirm({
			title: "Are you sure delete this card?",
			content: "You will no longer be able to make purchases using this card",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk() {
				return firestore.doc(parent.props.auth.agent ? agentPath : path).delete()
					.then(() => {
						return parent._loadCards();
					});
			},
		});
	};

	close = () => {
		this.props.close();
	};

	render() {
		return (
			<Modal
				title={"Stripe Cards"}
				visible={this.props.open}
				closable={false}
				footer={[
					<Button key="submit" type="primary" onClick={this.close}>
						Close
					</Button>,
				]}>
				<Row>
					<Col span={24}>
						<Typography.Title level={3}>Current Cards</Typography.Title>
						{
							this.state.cards.length === 0 ? <Typography.Text type="secondary">No Cards</Typography.Text> : null
						}
						{
							this.state.cards.map(method => {
								return (
									<Row key={method.id}>
										<Col span={2} style={{paddingTop: 6}}>
											{method.card.brand === "visa" ? <i className={"fab fa-cc-visa"}/> : null}
											{method.card.brand === "mastercard" ? <i className={"fab fa-cc-mastercard"}/> : null}
											{method.card.brand === "amex" ? <i className={"fab fa-cc-amex"}/> : null}
										</Col>
										<Col span={10} style={{paddingTop: 6}}>
											<Typography.Text>{method.billing_details.name}</Typography.Text>
										</Col>
										<Col span={5} style={{paddingTop: 6}}>
											<Typography.Text>{method.card.last4}</Typography.Text>
										</Col>
										<Col span={4} style={{paddingTop: 6}}>
											<Typography.Text>{method.card.exp_month} / {method.card.exp_year}</Typography.Text>
										</Col>
										<Col span={3} align={"right"}>
											<Button type={"danger"} shape={"circle"} icon="delete" onClick={() => this.deleteCard(method.metadata.cardID)}/>
										</Col>
									</Row>
								)
							})
						}
					</Col>
				</Row>
				<hr/>
				<form onSubmit={this._addCard}>
					<Row>
						<Col span={24}>
							<Typography.Title level={3}>Add New Card</Typography.Title>
						</Col>
						<Col span={24}>
							<Row gutter={10}>
								<Col span={24}>
									<div className="gx-form-group">
										<Input placeholder={"Name on Card*"} value={this.state.name} onChange={e => this.setState({name: e.target.value})}/>
									</div>
								</Col>
								<Col span={8}>
									<div className="gx-form-group">
										<CardNumberElement className={"ant-input"} style={{
											base: {
												color: "#545454",
												fontFamily: "NoirPro, sans-serif",
												"::placeholder": {
													color: "#BFBFBF",
													fontFamily: "NoirPro, sans-serif",
												},
											}
										}} placeholder={"Card Number*"}/>
									</div>
								</Col>
								<Col span={6}>
									<div className="gx-form-group">
										<CardExpiryElement style={{
											base: {
												color: "#545454",
												fontFamily: "NoirPro, sans-serif",
												"::placeholder": {
													color: "#BFBFBF",
													fontFamily: "NoirPro, sans-serif",
												},
											}
										}} className={"ant-input"} placeholder={"Expiration*"}/>
									</div>
								</Col>
								<Col span={4}>
									<div className="gx-form-group">
										<CardCvcElement style={{
											base: {
												color: "#545454",
												fontFamily: "NoirPro, sans-serif",
												"::placeholder": {
													color: "#BFBFBF",
													fontFamily: "NoirPro, sans-serif",
												},
											}
										}} className={"ant-input"} placeholder={"CVC*"}/>
									</div>
								</Col>
								<Col span={6}>
									<div className="gx-form-group">
										<Button block={true} htmlType="submit" loading={this.state.addingCard} type={"primary"} onClick={this._addCard}>
											Add Card
										</Button>
									</div>
								</Col>
							</Row>
						</Col>
					</Row>
				</form>
			</Modal>
		);
	}
}

export default injectStripe(Stripe);
