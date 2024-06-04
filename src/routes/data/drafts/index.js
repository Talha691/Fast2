import React, { useState, useEffect } from "react";
import { Button, Card, Table, Row, Col, Typography, Popconfirm } from "antd";
import moment from "moment";
import { connect } from "react-redux";
import { firestore } from "../../../firebase/firebase";
import EditDraft from "../../../util/editDraft";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { onAddCarInsurance, onDeleteCarInsurance, onUpdateCarInsurance } from "../../../appRedux/actions/CarInsurance";
import { onAddTruckInsurance, onDeleteTruckInsurance, onUpdateTruckInsurance } from "../../../appRedux/actions/TruckInsurance";
import { onGetAllClient } from "../../../appRedux/actions/Clients";
import { onGetAllCoverages } from "../../../appRedux/actions/Coverages";

const stripe = loadStripe("pk_live_51OqggJIz0lpOCcFPmhpr8wOCcmZRafbxekCcRpb3Dbu5WdnKWHWScgA9A1sWXNsC0sJYXOgqfN8PJb8RAgc09qW300ROBMlIew");

const InsuranceDrafts = props => {
	const [drafts, setDrafts] = useState([]);
	const [edit, setEdit] = useState("");
	const [isDraft, setIsDraft] = useState(false);
	const [configuration, setConfigurationState] = useState(null);

	const load = () => {
		props.onGetAllClient(props.auth);
		props.onGetAllCoverages(props.auth);
		firestore
			.collection("drafts")
			.get()
			.then(drafts => {
				setDrafts(
					drafts.docs.map(item => {
						return {
							id: item.id,
							...item.data(),
						};
					})
				);
			});
		firestore
			.doc("configuration/panel")
			.get()
			.then(config => {
				setConfigurationState(config.data().paymentMethod);
			});
	};

	useEffect(load, []);

	const columns = [
		{
			title: "Date",
			dataIndex: "timestamp",
			key: "timestamp",
			sorter: (a, b) => a.timestamp.seconds - b.timestamp.seconds,
			render: text => moment(text.seconds, "X").format("lll"),
			width: 220,
		},
		{
			key: "status",
			title: "Status",
			dataIndex: "status",
			width: 130,
			filters: [
				{
					text: "Active",
					value: "Active",
				},
				{
					text: "Pending",
					value: "Pending",
				},
				{
					text: "Expired",
					value: "Expired",
				},
				{
					text: "Void",
					value: "Void",
				},
			],
			onFilter: (value, record) => record.status === value,
		},
		{
			title: "Source",
			dataIndex: "source",
			key: "source",
			render: text => (text ? text : "Software"),
			width: 120,
		},
		{
			title: "Agent",
			dataIndex: "agentName",
			key: "agentName",
			sorter: (a, b) => a.agentName.localeCompare(b.agentName),
			width: 120,
		},
		{
			title: "Client",
			dataIndex: "clientName",
			key: "clientName",
			onFilter: (value, record) => record.clientName.indexOf(value) === 0,
			sorter: (a, b) => a.clientName.length - b.clientName.length,
		},
		{
			title: "Coverage",
			dataIndex: "coverageName",
			key: "coverageName",
			onFilter: (value, record) => record.coverageName.indexOf(value) === 0,
			sorter: (a, b) => a.coverageName.length - b.coverageName.length,
		},
		{
			title: "Total",
			dataIndex: "total",
			key: "total",
			sorter: (a, b) => a.total - b.total,
			render: text => (text ? `$${text} dlls` : null),
			width: 120,
		},
		{
			title: "Action",
			width: 250,
			dataIndex: "",
			key: "x",
			render: (_, record) => {
				return (
					<>
						<Button
							style={{ margin: 0, padding: 5 }}
							onClick={() => {
								setEdit(record.id);
								setIsDraft(true);
							}}
							type={"link"}>
							<i className={"fas fa-file-alt"} />
						</Button>
						<Popconfirm
							okText={"Yes"}
							cancelText={"No"}
							title={"Are you sure you want to delete this?"}
							onConfirm={() => firestore.doc("drafts/" + record.id).delete()}
							onCancel={null}>
							<Button type={"link"} style={{ margin: 0, padding: 5 }}>
								<i className={"fas fa-trash"} />
							</Button>
						</Popconfirm>
					</>
				);
			},
		},
	];
	return (
		<Card>
			<Row>
				<Col span={12}>
					<div style={{ width: 100 }} />
					<Typography.Title level={2}>Drafts</Typography.Title>
				</Col>
				<Col span={4} push={8} />
			</Row>
			<Table pagination={{ pageSize: 30 }} className="gx-table-responsive" columns={columns} rowKey={"id"} dataSource={drafts} />
			<Elements stripe={stripe}>
				<ElementsConsumer>
					{({ stripe, elements }) => {
						if (stripe && elements && props.clients.length && drafts.length) {
							return (
								<EditDraft
									configuration={configuration}
									stripe={stripe}
									elements={elements}
									id={edit}
									type={props.type}
									isDraft={isDraft}
									onClose={() => {
										setEdit(false);
									}}
								/>
							);
						} else {
							return null;
						}
					}}
				</ElementsConsumer>
			</Elements>
		</Card>
	);
};

const mapStateToProps = ({ auth, clients }) => {
	return {
		auth,
		clients: clients.contactList,
	};
};
export default connect(mapStateToProps, {
	onAddCarInsurance,
	onDeleteCarInsurance,
	onUpdateCarInsurance,

	onAddTruckInsurance,
	onDeleteTruckInsurance,
	onUpdateTruckInsurance,

	onGetAllClient,
	onGetAllCoverages,
})(InsuranceDrafts);
