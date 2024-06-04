import React from "react";
import moment from "moment";

import { Button, Card, Col, Row, Table, Typography } from "antd";
import { firestore } from "../../../firebase/firebase";

import "./styles.css";

class Claims extends React.Component {
	state = {
		data: [],
		loading: true,
	};

	async componentDidMount() {
		const { docs } = await firestore.collection("claims").get();
		this.setState({
			loading: false,
			data: docs.map(x => {
				return {
					...x.data(),
					date: x.data().date ? moment(x.data().date.toDate()).format("ll") : "null",
					id: x.id,
				};
			}),
		});
	}

	render() {
		const columns = [
			{
				title: "Date",
				dataIndex: "date",
			},
			{
				title: "Claim ID",
				dataIndex: "claimID",
			},
			{
				title: "Insurance ID",
				dataIndex: "insuranceID",
			},
			{
				title: "Case No",
				dataIndex: "case",
			},
			{
				title: "Actions",
				key: "actions",
				render: info => {
					const url = "https://firebasestorage.googleapis.com/v0/b/fast-in-transit.appspot.com/o/claims%2F";
					return (
						<Row style={{ width: 100 }}>
							<Col style={{ cursor: "pointer" }} span={6}>
								<a href={`/claims/${info.id}`} style={{ color: "#333" }}>
									<i className="fas fa-pencil" />
								</a>
							</Col>
							<Col style={{ cursor: "pointer" }} span={6}>
								<a target={"_blank"} rel={"noopener noreferrer"} href={`${url}${info.id}%2Fclaim.pdf?alt=media`} style={{ color: "#333" }}>
									<i className="fas fa-download" />
								</a>
							</Col>
						</Row>
					);
				},
			},
		];

		return (
			<Card>
				<Row>
					<Col span={12}>
						<Typography.Title level={2}>Claims</Typography.Title>
					</Col>
					<Col style={{ textAlign: "right" }} span={12}>
						<Button type="primary" style={{ width: 200 }} block={true} onClick={() => this.props.history.push("/claims/new")}>
							Create Insurance Claim
						</Button>
					</Col>
				</Row>
				<Table
					loading={this.state.loading}
					pagination={{ pageSize: 30 }}
					className="gx-table-responsive"
					columns={columns}
					rowKey={"claimID"}
					dataSource={this.state.data}
				/>
			</Card>
		);
	}
}
export default Claims;
