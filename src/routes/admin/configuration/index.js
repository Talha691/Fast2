import React from "react";
import {Button, Card, Col, notification, Row, Select, Typography} from "antd";
import {firestore} from "../../../firebase/firebase";

class Configuration extends React.Component {
	state = {
		websitePayment: null,
		mobilePayment: null,
		adminPanelPayment: null,
	};

	componentDidMount() {
		firestore.doc("configuration/app/").get()
			.then(mobile => {
				return this.setState({mobilePayment: mobile.data().paymentMethod ? mobile.data().paymentMethod : null});
			});
		firestore.doc("configuration/web/").get()
			.then(website => {
				return this.setState({websitePayment: website.data().paymentMethod ? website.data().paymentMethod : null});
			});
		firestore.doc("configuration/panel/").get()
			.then(adminPanel => {
				return this.setState({adminPanelPayment: adminPanel.data().paymentMethod ? adminPanel.data().paymentMethod : null});
			});
	}

	saveConfiguration = async () => {
		await firestore.doc("configuration/app").update({paymentMethod: this.state.mobilePayment});
		await firestore.doc("configuration/web").update({paymentMethod: this.state.websitePayment});
		await firestore.doc("configuration/panel").update({paymentMethod: this.state.adminPanelPayment});
		return notification.success({message: "Success!", description: "Configuration saved successfully!", duration: 2});
	};

	render() {
		return (
			<Card>
				<Row>
					<Col span={8}>
						<div style={{width: 100}}/>
						<Typography.Title level={2}>Configuration</Typography.Title>
					</Col>
					<Col span={4} push={12}>
					</Col>
				</Row>
				<Card>
					<Row gutter={[10, 40]}>
						<Col span={8}>
							<Typography.Title level={3}><i className={"fas fa-desktop"}/> Software</Typography.Title>
							<Row>
								<Col span={6}>
									<Typography.Text style={{fontSize: 18}}>Payment Type: </Typography.Text>
								</Col>
								<Col style={{textAlign: "left"}} span={18}>
									<Select
										value={this.state.adminPanelPayment}
										size={"small"}
										style={{width: "30%"}}
										placeholder={"Select a payment option"}
										onChange={e => this.setState({adminPanelPayment: e})}
									>
										<Select.Option key={0} value={null} disabled>Select a payment method</Select.Option>
										<Select.Option key={1} value={"credit"}>Credit</Select.Option>
										<Select.Option key={2} value={"stripe"}>Stripe</Select.Option>
										<Select.Option key={3} value={"paypal"}>PayPal</Select.Option>
									</Select>
								</Col>
							</Row>
						</Col>
						<Col span={8}>
							<Typography.Title level={3}><i className={"fas fa-globe-americas"}/> Website</Typography.Title>
							<Row gutter={10}>
								<Col span={6}>
									<Typography.Text style={{fontSize: 18}}>Payment Type: </Typography.Text>
								</Col>
								<Col style={{textAlign: "left"}} span={18}>
									<Select
										value={this.state.websitePayment}
										size={"small"}
										style={{width: "30%"}}
										placeholder={"Select a payment option"}
										onChange={e => this.setState({websitePayment: e})}
									>
										<Select.Option key={0} value={null} disabled>Select a payment method</Select.Option>
										<Select.Option key={1} value={"credit"}>Credit</Select.Option>
										<Select.Option key={2} value={"stripe"}>Stripe</Select.Option>
										<Select.Option key={3} value={"paypal"}>PayPal</Select.Option>
									</Select>
								</Col>
							</Row>
						</Col>
						<Col span={8}>
							<Typography.Title level={3}><i className={"fas fa-mobile"}/> Mobile App</Typography.Title>
							<Row>
								<Col span={6}>
									<Typography.Text style={{fontSize: 18}}>Payment Type: </Typography.Text>
								</Col>
								<Col style={{textAlign: "left"}} span={18}>
									<Select
										value={this.state.mobilePayment}
										size={"small"}
										style={{width: "30%"}}
										placeholder={"Select a payment option"}
										onChange={e => this.setState({mobilePayment: e})}
									>
										<Select.Option key={0} value={null} disabled>Select a payment method</Select.Option>
										<Select.Option key={1} value="credit">Credit</Select.Option>
										<Select.Option key={2} value="stripe">Stripe</Select.Option>
										<Select.Option key={3} value="paypal">PayPal</Select.Option>
									</Select>
								</Col>
							</Row>
						</Col>
					</Row>
					<Row>
						<Col style={{textAlign: "left", marginTop: 20}} span={24}>
							<Button onClick={this.saveConfiguration} type="primary">Save</Button>
						</Col>
					</Row>
				</Card>
			</Card>
		);
	}
}

export default Configuration;