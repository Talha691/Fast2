import React from "react";
import moment from "moment";
import { Card, Typography, Form, Button, Input, DatePicker, Divider, Row, Col, InputNumber, Upload, Checkbox } from "antd";
import { firestore, storage } from "../../../firebase/firebase";
// import { Icon } from 'antd-icons';

const required = {
	rules: [
		{
			required: true,
			message: "This field is required",
		},
	],
};

let vehicleID = 1;
const ClaimForm = ({ match, history, form }) => {
	const { id } = match.params;
	const [claimID, setClaimID] = React.useState(id);
	const [loading, setLoading] = React.useState(false);
	const { getFieldDecorator, getFieldValue, setFieldsValue } = form;

	// Load
	React.useEffect(() => {
		if (id !== "new") {
			firestore
				.doc(`claims/${id}`)
				.get()
				.then(r => {
					setFieldsValue({
						keys: r.data().keys,
					});

					const images = r.data().keys.map(x => {
						const vehicle = r.data().vehicles[x];
						return vehicle.images.map(y => ({
							uid: y,
							status: "done",
							url: y,
						}));
					});

					setFieldsValue({
						...r.data(),
						images,
						date: moment(r.data().date.toDate()),
						reportedDate: r.data().reportedDate ? moment(r.data().reportedDate.toDate()) : null,
					});
				});
		} else {
			setClaimID(firestore.collection("claims").doc().id);
		}
	}, [id, setFieldsValue]);

	getFieldDecorator("keys", { initialValue: [0] });
	const keys = getFieldValue("keys");

	const remove = k => {
		if (keys.length === 1) return;
		form.setFieldsValue({
			keys: keys.filter(key => key !== k),
		});
	};

	const add = () => {
		const nextKeys = keys.concat(vehicleID++);
		form.setFieldsValue({
			keys: nextKeys,
		});
	};

	const submit = e => {
		e.preventDefault();
		form.validateFields((err, values) => {
			if (!err) {
				setLoading(true);
				const vehicles = values.keys.map(x => ({
					type: values.types[x],
					year: values.years[x],
					make: values.makes[x],
					model: values.models[x],
					//
					vin: values.vin[x],
					license: values.licenses[x],
					name: values.names[x],
					address: values.addresses[x],
					email: values.emails[x],
					images: values.images[x] ? values.images[x].map(x => (x.response ? x.response : x.url)) : [],
					description: values["descriptions"][x],
					//
					bodyShopInfo: values["bodyShopInfo"][x],
					bodyShopAddress: values["bodyShopAddress"][x],
					bodyShopPhone: values["bodyShopPhone"][x],
					//
					insuranceInfo: values["insuranceInfo"][x],
					insurancePhone: values["insurancePhone"][x],
					insuranceId: values["insuranceId"][x],
					//
					injured: values.injured[x],
					injuries: values.injuries[x],
					hospital: values.hospital[x],
					ambulance: values.ambulance[x],
					treatment: values.treatment[x],
					passengers: values.passengers[x],
				}));

				firestore
					.doc(`claims/${claimID}`)
					.set(
						{
							...values,
							images: null,
							date: values.date.toDate(),
							reportedDate: values.reportedDate?.toDate() ?? null,
							vehicles,
						},
						{ merge: true }
					)
					.then(() => {
						setLoading(false);
						history.push("/claims");
					});
			}
		});
	};

	const formItems = keys.map(k => (
		<div key={k} style={{ marginBottom: 50 }}>
			<Row type={"flex"} align={"middle"}>
				<Col span={23}>
					<Row type={"flex"}>
						<Col span={6}>
							<Form.Item label={"Vehicle Type"} required={false}>
								{getFieldDecorator(`types[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item label={"Year"} required={false}>
								{getFieldDecorator(`years[${k}]`)(<InputNumber style={{ width: "100%" }} />)}
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item label={"Make"} required={false}>
								{getFieldDecorator(`makes[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item label={"Model"} required={false}>
								{getFieldDecorator(`models[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label={"VIN"} required={false}>
								{getFieldDecorator(`vin[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label={"License"} required={false}>
								{getFieldDecorator(`licenses[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Name"} required={false}>
								{getFieldDecorator(`names[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Address"} required={false}>
								{getFieldDecorator(`addresses[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Email Address"} required={false}>
								{getFieldDecorator(`emails[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Body Shop Information"} required={false}>
								{getFieldDecorator(`bodyShopInfo[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Body Shop Address"} required={false}>
								{getFieldDecorator(`bodyShopAddress[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Body Shop Phone"} required={false}>
								{getFieldDecorator(`bodyShopPhone[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Insurance Information"} required={false}>
								{getFieldDecorator(`insuranceInfo[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Insurance Phone"} required={false}>
								{getFieldDecorator(`insurancePhone[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item label={"Insurance ID"} required={false}>
								{getFieldDecorator(`insuranceId[${k}]`)(<Input />)}
							</Form.Item>
						</Col>
						<Col span={4}>
							<Form.Item label={"Number of Passengers"} required={false}>
								{getFieldDecorator(`passengers[${k}]`)(<InputNumber style={{ width: "100%" }} />)}
							</Form.Item>
						</Col>
						<Col span={4}>
							<Form.Item label={"People Injured?"} required={false}>
								{getFieldDecorator(`injured[${k}]`)(<InputNumber style={{ width: "100%" }} />)}
							</Form.Item>
						</Col>
						<Col span={4}>
							<Form.Item label={"Ambulance Called?"} required={false}>
								{getFieldDecorator(`ambulance[${k}]`, { valuePropName: "checked" })(<Checkbox />)}
							</Form.Item>
						</Col>
						<Col span={4}>
							<Form.Item label={"Taken to Hospital?"} required={false}>
								{getFieldDecorator(`hospital[${k}]`, { valuePropName: "checked" })(<Checkbox />)}
							</Form.Item>
						</Col>
						<Col span={4}>
							<Form.Item label={"Receiving Treatment?"} required={false}>
								{getFieldDecorator(`treatment[${k}]`, { valuePropName: "checked" })(<Checkbox />)}
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label={"Description of Injuries"} required={false}>
								{getFieldDecorator(`injuries[${k}]`)(<Input.TextArea rows={3} />)}
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label={"Description of Images"} required={false}>
								{getFieldDecorator(`descriptions[${k}]`)(<Input.TextArea rows={3} />)}
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label="Images">
								{getFieldDecorator(`images[${k}]`, {
									valuePropName: "fileList",
									getValueFromEvent: e => {
										if (Array.isArray(e)) {
											return e;
										}
										return e && e.fileList;
									},
								})(
									<Upload
										name="images"
										customRequest={async ({ file, onSuccess }) => {
											const upload = await storage.ref(`claims/${claimID}`).child(`${moment().valueOf()}.png`).put(file);
											const url = await upload["ref"].getDownloadURL();
											onSuccess(url);
										}}
										listType="picture-card">
										<div>
											<Icon type="plus" />
											<div className="ant-upload-text">Upload</div>
										</div>
									</Upload>
								)}
							</Form.Item>
						</Col>
					</Row>
				</Col>
				<Col span={1}>
					{keys.length > 1 && <Button onClick={() => remove(k)} size={"small"} shape={"circle"} danger icon={"minus"} type={"danger"} />}
				</Col>
			</Row>
			<Divider />
		</div>
	));

	return (
		<Card>
			<Typography.Title level={2}>{id === "new" ? "New" : "Update"} Claim</Typography.Title>
			<Form onSubmit={submit} layout={"vertical"}>
				<Typography.Title level={4}>Basic Information</Typography.Title>
				<Row type={"flex"}>
					<Col span={8}>
						<Form.Item label="Claim Number">{getFieldDecorator("claimID", required)(<Input />)}</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item label="Insurance ID">{getFieldDecorator("insuranceID", required)(<Input />)}</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item label="Case No.">{getFieldDecorator("case")(<Input />)}</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item label="Location">{getFieldDecorator("location", required)(<Input />)}</Form.Item>
					</Col>
					<Col span={6}>
						<Form.Item label="Date of Accident">
							{getFieldDecorator("date", required)(<DatePicker style={{ width: "100%" }} showTime={true} />)}
						</Form.Item>
					</Col>
					<Col span={6}>
						<Form.Item label="Police Dpt. Notified">
							{getFieldDecorator("reportedDate")(<DatePicker style={{ width: "100%" }} showTime={true} />)}
						</Form.Item>
					</Col>
				</Row>
				<Divider />

				<Typography.Title level={4}>
					Vehicles Involved{" "}
					<Button onClick={add} style={{ marginTop: 8, marginLeft: 8 }} type={"primary"} shape={"circle"} size={"small"} icon={"plus"} />
				</Typography.Title>
				{formItems}

				<Button type="primary" htmlType="submit" loading={loading}>
					{id === "new" ? "Create" : "Update"} Claim
				</Button>
			</Form>
		</Card>
	);
};

export default Form.create({ name: "claimForm" })(ClaimForm);
