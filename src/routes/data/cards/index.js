import React, {Component} from "react";
import {Button, Card, Table, Row, Col, Typography} from "antd";
import {Elements} from "react-stripe-elements";
import moment from "moment";
import {connect} from "react-redux";

import {firestore} from "../../../firebase/firebase";
import Stripe from "../agents/stripe";
import Can from "../../../roles/Can";

class FirebaseCRUD extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cards: [],
			modal: false,
			loading: false,
		}
	}

	componentDidMount() {
		return this._loadCards();
	}

	_loadCards = async () => {
		await this.setState({cards: [], modal: false, loading: false});
		firestore.collection("agents/" + this.props.auth.agent + "/cards").get()
			.then(cards => {
				cards.forEach(card => {
					this.setState({
						cards: [
							...this.state.cards,
							card.data(),
						]
					})
				})
			})
	};

	render() {
		return (
			<Card>
				<Row>
					<Col span={12}>
						<div style={{width: 100}}/>
						<Typography.Title level={2}>
							Cards
						</Typography.Title>
					</Col>
					<Col span={4} push={8}>
						<Can I={"manage"} a={"cards"}>
							<Button type="primary" block={true} onClick={() => this.setState({modal: true})}>
								Manage Cards
							</Button>
						</Can>
					</Col>
				</Row>

				<Table pagination={{pageSize: 30}} className="gx-table-responsive" columns={[
					{
						title: "Date Added",
						dataIndex: "created",
						key: "created",
						sorter: (a, b) => a.created - b.created,
						render: text => moment(text).format("ll"),
						width: 120,
					},
					{
						title: "Card Name",
						dataIndex: "billing_details.name",
						key: "billing_details.name",
						sorter: (a, b) => a.billing_details.name - b.billing_details.name,
						width: 120,
					},
					{
						title: "Brand",
						dataIndex: "card.brand",
						key: "card.brand",
						sorter: (a, b) => a.card.brand - b.card.brand,
						width: 120,
					},
					{
						title: "Last 4",
						dataIndex: "card.last4",
						key: "card.last4",
						sorter: (a, b) => a.card.last4 - b.card.last4,
						width: 120,
					},
				]} rowKey={"id"} dataSource={this.state.cards}/>

				<Elements>
					<Stripe auth={this.props.auth} open={this.state.modal} close={() => {
						this.setState({modal: false});
						return this._loadCards();
					}} client={this.props.auth.agent} sameAgent={true}/>
				</Elements>
			</Card>
		)
	}
}

const mapStateToProps = ({auth}) => {
	return {
		auth,
	}
};
export default connect(mapStateToProps)(FirebaseCRUD);