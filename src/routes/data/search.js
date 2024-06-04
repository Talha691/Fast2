import React from "react";
import { Card, Row, Col, Typography, Input, message, Button, Spin } from "antd";
import { firestore } from "../../firebase/firebase";

const Search = () => {
	const [loading, setLoading] = React.useState(false);
	const [data, setData] = React.useState(null);

	const search = async value => {
		setLoading(true);
		const policy = value.toUpperCase();
		const type = policy.charAt(0) === "C" ? "car" : policy.charAt(0) === "T" ? "truck" : null;
		if (!type) {
			message.error("Insurance ID appears to be wrong");
			return setLoading(false);
		}
		const collection = await firestore.collection(`${type}-insurance`).where("insuranceID", "==", policy).get();
		if (collection.docs.length === 0) {
			message.error("Policy not found");
			return setLoading(false);
		}

		const policyData = collection.docs[0];
		setData({
			collection: `${type}-insurance`,
			id: policyData.id,
			...policyData.data(),
		});
		setLoading(false);
	};

	const regenerate = async () => {
		const { insuranceID, collection, id } = data;
		setLoading(true);
		setData(null);

		await firestore.doc(`${collection}/${id}`).update({
			updated: new Date(),
		});
		setTimeout(() => {
			search(insuranceID).catch();
		}, 3500);
	};

	return (
		<Card style={{ minHeight: "92vh" }}>
			<Row>
				<Col xs={24} md={12}>
					<Typography.Title level={2}>Search Policy</Typography.Title>
				</Col>
				<Col xs={24} md={12}>
					<Input.Search loading={loading} placeholder={"Enter Policy Number"} onSearch={search} />
				</Col>
			</Row>
			{loading && <Spin />}
			{data && (
				<div>
					<Row>
						<Col xs={24} md={12}>
							<iframe
								src={`https://firebasestorage.googleapis.com/v0/b/fast-in-transit.appspot.com/o/insurances%2F${data.insuranceID}.pdf?alt=media`}
								height={500}
								width={"100%"}
								title={"Policy"}
							/>
						</Col>
						<Col xs={24} md={12}>
							<iframe src={data.agreement} height={500} width={"100%"} title={"Agreement"} />
						</Col>
					</Row>
					<Button type={"primary"} style={{ marginTop: 20, marginRight: 10 }} onClick={regenerate}>
						Regenerate
					</Button>
					This will recreate the policy PDF
				</div>
			)}
		</Card>
	);
};

export default Search;
