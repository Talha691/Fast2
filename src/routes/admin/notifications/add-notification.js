import React from "react";
import {firestore} from "../../../firebase/firebase";
import {Input, Modal, Row, Col, notification} from "antd";

import moment from "moment";

class AddNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: "",
			content: "",
			chars_left: 0,
		}
	}

	handleWordCount = (e) => {
		this.setState({ content: e.target.value });
		let charCount = e.target.value.length;
		let charLeft =  +charCount;
		this.setState({ chars_left: charLeft });
	};

	saveNotification = () => {
		const { title, content } = this.state;
		if(!title || !content) {
			return null;
		}
		firestore.collection("notifications").add({
			title, content, timestamp: moment().toDate()
		}).then(() => {
			notification.success({ message: "Success!", description: "Expense saved successfully!" });
			this.setState({
				title: "",
				content: "",
				}, () => this.props.onModalClose())
			});
		};
	render() {
		const { onModalClose, open } = this.props;
		const { title, content } = this.state;
		return (
			<Modal
				width={50}
				title={"Add Notification"}
				toggle={onModalClose} visible={open}
				closable={false}
				onCancel={() => {
					this.setState({
						title: "",
						content: "",
					}, () => onModalClose())
				}}
				onOk={() => {
					this.saveNotification()
				}}>
				<Row gutter={10}>
					<Col span={24}>
						<div className="gx-form-group">
							<Input
								placeholder="Title"
								onChange={(e) => this.setState({title: e.target.value})}
								value={title}
								margin="normal"/>
						</div>
					</Col>
					<Col span={24}>
						<div className="gx-form-group">
							<Input.TextArea
								rows={6}
								placeholder="Content"
								onChange={this.handleWordCount}
								value={content}
								maxLength="150"
								margin="normal"/>

						</div>
					</Col>
					<Col span={24} push={22}>
						<p>{this.state.chars_left}/150</p>
					</Col>
				</Row>
			</Modal>
		);
	}
}

export default AddNotification;
