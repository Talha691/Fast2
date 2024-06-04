import React, { Component } from "react";
import {Table, Typography, Card, Col, Button, Row} from "antd";
import {Elements} from "react-stripe-elements";
import async from "async";
import moment from "moment";
import { firestore } from "../../../firebase/firebase";
import AddNotification from "./add-notification";


class NotificationsTable extends Component {
	constructor() {
		super();

		this.state = {
			data: [],
			addNotificationModalState: false,
		}
	}

	componentDidMount() {
		return firestore.collection("notifications").orderBy("timestamp", "desc").onSnapshot(notif => {
			const allNotifs = [];
			return async.eachOfSeries(notif.docs, (notif, key, callback) => {
				allNotifs.push({
					key: notif.id,
					date: moment(notif.data().timestamp.toDate()).format("ll"),
					title: notif.data().title,
					content: notif.data().content
				});
				callback();
			}, () => this.setState({ data: allNotifs }));
		})
	}

	render() {
		const { data, addNotificationModalState, } = this.state;
		const columns = [
			{
				title: "Date",
				dataIndex: "date",
				key: "date",
				width: 200
			},
			{
				title: "Title",
				dataIndex: "title",
				key: "title",
			},
			{
				title: "Content",
				dataIndex: "content",
			}
		];
		return (
			<Card>
				<Row>
					<Col span={8}>
						<div style={{width: 100}}/>
						<Typography.Title level={2}>Notifications</Typography.Title>
					</Col>
					<Col span={4} push={12}>
						<Button type="primary" block={true} onClick={() => this.setState({addNotificationModalState: true})}>
							Add Notification
						</Button>
					</Col>
				</Row>

				<AddNotification open={ addNotificationModalState } onModalClose={() => this.setState({addNotificationModalState: false, expense: null})}/>
				<Elements>
					<Table dataSource={ data } columns={ columns } pagination={{ pageSize: 35 }} />
				</Elements>
			</Card>
		);
	}
}

export default NotificationsTable;