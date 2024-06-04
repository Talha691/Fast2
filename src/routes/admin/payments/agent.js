import React from "react";
import moment from "moment";
import { Button, Typography, Table, Card } from "antd";

import { firestore } from "../../../firebase/firebase";

const AgentPaymentsReport = props => {
	const agent = props.match.params.agent;
	const [name, setName] = React.useState(null);
	const [loading, setLoading] = React.useState(true);
	const [weeks, setWeeks] = React.useState([]);
	console.log(weeks)
	const load = () => {
		const run = async () => {
			if (!agent) return props.history.push("/payments");

			const agentData = await firestore.doc(`agents/${agent}`).get();
			if (!agentData.exists) return props.history.push("/payments");

			const weeks = await firestore.collection(`agents/${agent}/week`).orderBy("id", "desc").get();
			setWeeks(weeks.docs.map(x => x.data()));
			setName(agentData.data().company);
			setLoading(false);
		};

		run().catch();
	};

	React.useEffect(load, []);

	const formatMoney = number => {
		return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(number);
	};

	return (
		<Card loading={loading}>
			<Typography.Title level={2}>Agent: {name}</Typography.Title>

			<Table
				dataSource={weeks}
				pagination={{ defaultPageSize: 50 }}
				columns={[
					{ title: "Week", dataIndex: "id" },
					{ title: "From Day", dataIndex: "start", render: x => moment(x.toDate()).format("ll") },
					{ title: "To Day", dataIndex: "end", render: x => moment(x.toDate()).format("ll") },
					{ title: "Credit", dataIndex: "global", render: x => (x ? formatMoney(x) : null) },
					{ title: "Commissions", dataIndex: "agent", render: x => (x ? formatMoney(x) : null) },
					{
						title: "Payments Money",
						dataIndex: "payments",
						render: x => {
							return <span style={{ color: x < 0 ? "red" : "green" }}>{x ? formatMoney(x) : null}</span>;
						},
					},
					{ title: "Subtotal", dataIndex: "subtotal", render: x => (x ? formatMoney(x) : null) },
					{
						title: "Total",
						dataIndex: "total",
						render: x => {
							return <span style={{ color: x < 0 ? "red" : "green" }}>{x ? formatMoney(x) : null}</span>;
						},
					},
					{
						title: "Payment",
						render: x => {
							return (
								<a
									href={`https://firebasestorage.googleapis.com/v0/b/fast-in-transit.appspot.com/o/agents%2F${agent}%2Freport%2F${x.id}.pdf?alt=media&token=report`}
									rel={"noreferrer noopener"}
									target={"_blank"}>
									<Button type={"primary"} icon={"file-pdf"}>
										View
									</Button>
								</a>
							);
						},
					},
				]}
			/>
		</Card>
	);
};

export default AgentPaymentsReport;
