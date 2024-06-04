import React from "react";
import { Modal, Row, Col } from "antd";

class ClaimsInfo extends React.Component {

	state = {
		ID: "",
		date: null,
		notes: "",
		files: [],
		urls: [],
		imageURL: "",
		progress: 0,
		insurance: null,
		insuranceData: [],
	};

	componentDidMount() {
		this.props.info.insurance.get()
			.then(insurance => {
				this.setState({ insuranceData: insurance.data() });
			})
	}

	render() {
		const { visible, close, info } = this.props;
		const { images } = info;
		return(
			<Modal
				title="Insurance Claim Info"
				visible={visible}
				onCancel={() => {
					this.setState({
						ID: "",
						date: null,
						notes: "",
						files: [],
						urls: [],
						imageURL: "",
						progress: 0,
						insurance: null,
						insuranceData: [],
					}, close)
				}}
			>
				<Row style={{ padding: 20 }} gutter={[10, 10]}>
					<Col span={12}>
						<Row span={24}>
							<h2>Client Name</h2>
						</Row>
						<Row span={24}>
							<h4>{this.state.insuranceData.clientName}</h4>
						</Row>
					</Col>
					<Col span={12}>
						<Row span={24}>
							<h2>Insurance Type</h2>
						</Row>
						<Row span={24}>
							<h4>{info.insuranceID.startsWith("C") ? "Car" : "Truck"}</h4>
						</Row>
					</Col>
					<Col span={12}>
						<Row span={24}>
							<h2>Insurance ID</h2>
						</Row>
						<Row span={24}>
							<h4>{info.insuranceID}</h4>
						</Row>
					</Col>
					<Col span={12}>
						<Row span={24}>
							<h2>Coverage</h2>
						</Row>
						<Row span={24}>
							<h4>{this.state.insuranceData.coverageName}</h4>
						</Row>
					</Col>
					<Col span={12}>
						<Row span={24}>
							<h2>
								Coverage Price
							</h2>
						</Row>
						<Row span={24}>
							<h4>${this.state.insuranceData.coveragePrice}</h4>
						</Row>
					</Col>
					<Col span={12}>
						<Row span={24}>
							<h2>
								Coverage Days
							</h2>
						</Row>
						<Row span={24}>
							<h4>{this.state.insuranceData.days}</h4>
						</Row>
					</Col>
					<Col span={12}>
						<Row span={24}>
							<h2>
								Date of accident
							</h2>
						</Row>
						<Row span={24}>
							<h4>{info.date}</h4>
						</Row>
					</Col>
					<Col span={12}>
						<Row span={24}>
							<h2>
								Description of accident
							</h2>
						</Row>
						<Row span={24}>
							<h4>{info.notes}</h4>
						</Row>
					</Col>
					<Col span={24}>
						<Row span={24}>
							<h2>
								Photos of accident
							</h2>
						</Row>
						<Row span={24}>
							{
								images.length ? images.map((image, index) => (
									<img key={index} alt="car-crash" style={{ height: 200,  }} src={image} />
								)) : null
							}
						</Row>
					</Col>
				</Row>
			</Modal>
		)
	}
}

export default ClaimsInfo;