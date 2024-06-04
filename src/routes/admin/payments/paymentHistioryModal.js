import React, { useEffect, useState } from "react";
import { Button, Modal, Table, DatePicker, InputNumber, Row, Col, Form, Input } from "antd";
import moment from "moment";
import { fieldValue, firestore } from "../../../firebase/firebase";

const { RangePicker } = DatePicker;

const PaymentHistoryModal = props => {
	const { cancel, visible, uid, paymentHistoryLoading, paymentHistory } = props;
	const [state, setState] = useState({ visible, loading: paymentHistoryLoading, searchData: paymentHistory, dateRange: [], uid, docID: "" });
	const [modalVisible, setModalVisible] = useState(false);
	const [checkNumber, setCheckNumber] = useState("");
	const [amount, setAmount] = useState(null);
	const [notes, setNotes] = useState("");
	const [previousAmount, setPreviousAmount] = useState(null);

	useEffect(() => {
		setState({ ...state, visible });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [visible, state.searchData]);

	const dateChange = dates => {
		search(dates);
	};

	const search = dates => {
		let searchData = [...paymentHistory];

		if (dates.length) {
			searchData = searchData.filter(e => moment(e.date).isAfter(dates[0]) && moment(e.date).isBefore(dates[1]));
		}

		return setState({ ...state, searchData });
	};

	const updatePayment = async () => {
		let newAmount = previousAmount - amount;
		let changeValueBy = fieldValue.increment(-newAmount);

		await firestore.doc("agents/" + uid).update({ creditAmount: changeValueBy });
		return firestore.doc("agents/" + uid + "/payments/" + state.docID).update({ paymentAmount: amount, notes, checkNumber });
	};

	const Footer = () => {
		let total = 0;
		state.searchData.forEach(item => {
			total += item.paymentAmount;
		});
		return (
			<div style={{ textAlign: "end" }}>
				<p>Total: ${total.toLocaleString("en-US")}</p>
			</div>
		);
	};

	const paymentHistoryCol = [
		{
			title: "Date",
			dataIndex: "date",
			render: date => {
				if (!date) return "";
				return <p>{moment(date).format("ll")}</p>;
			},
		},
		{
			title: "Type",
			dataIndex: "type",
		},
		{
			title: "Check Number",
			dataIndex: "checkNumber",
		},
		{
			title: "Amount",
			dataIndex: "paymentAmount",
			render: amount => {
				return `$${amount}`;
			},
		},
		{
			title: "Notes",
			dataIndex: "notes",
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<>
					<Button
						style={{ padding: 0 }}
						onClick={() => {
							setModalVisible(true);
							setState({ ...state, docID: record.id });
							setCheckNumber(record.checkNumber);
							setPreviousAmount(record.paymentAmount);
							setAmount(record.paymentAmount);
							setNotes(record.notes);
						}}
						type={"link"}>
						Edit
					</Button>
					<Button
						style={{ padding: 0 }}
						type={"link"}
						onClick={() => {
							Modal.confirm({
								title: "Please confirm",
								content: "This will delete the payment and adjust the amount owed accordingly",
								okText: "Delete",
								okType: "danger",
								onOk: async () => {
									await firestore.doc("agents/" + uid).update({ creditAmount: fieldValue.increment(record.paymentAmount) });
									await firestore.doc("agents/" + uid + "/payments/" + record.id).delete();
									window.location.reload();
								},
							});
						}}>
						Delete
					</Button>
				</>
			),
		},
	];
	return (
		<Modal
			title="Payment History"
			visible={state.visible}
			zIndex={20}
			onCancel={() => {
				cancel();
				setPreviousAmount(null);
				setCheckNumber("");
				setAmount(null);
				setNotes("");
			}}
			footer={[
				<Button key={"close"} onClick={() => cancel()}>
					Close
				</Button>,
			]}>
			<Modal
				visible={modalVisible}
				onOk={async () => {
					await updatePayment();
					setModalVisible(false);
					setPreviousAmount(null);
					setCheckNumber("");
					setAmount(null);
					setNotes("");
				}}
				onCancel={() => {
					setModalVisible(false);
				}}
				width={1000}
				zIndex={25}>
				<Row style={{ width: "100% !important" }}>
					<Form layout={"vertical"} style={{ width: "100% !important", flex: 1 }}>
						<Col span={24}>
							<Form.Item label={"Check Number"} name={"checkNumber"}>
								<Input style={{ width: "100%" }} value={checkNumber} onChange={e => setCheckNumber(e.currentTarget.value)} />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label={"Amount"} name={"amount"}>
								<InputNumber style={{ width: "100%" }} value={amount} onChange={e => setAmount(e)} />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label={"Notes"} name={"notes"}>
								<Input.TextArea style={{ width: "100%" }} value={notes} onChange={e => setNotes(e.currentTarget.value)} rows={5} />
							</Form.Item>
						</Col>
					</Form>
				</Row>
			</Modal>
			<RangePicker style={{ width: "100%", marginBottom: 10 }} format={"ll"} onChange={e => dateChange(e)} />
			<Table loading={state.paymentHistoryLoading} columns={paymentHistoryCol} dataSource={state.searchData} footer={() => <Footer />} />
		</Modal>
	);
};

export default PaymentHistoryModal;
