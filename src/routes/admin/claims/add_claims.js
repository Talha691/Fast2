import React from "react";
import { Modal, Row, Col, Input, DatePicker, notification } from "antd";
import async from "async";
import { storage, firestore } from "../../../firebase/firebase";

class AddClaims extends React.Component {
	state = {
		ID: "",
		date: null,
		notes: "",
		files: [],
		urls: [],
		imageURL: "",
		progress: 0,
		insurance: null,
		refID: null,
	};

	saveClaim = async () => {
		const { ID, date, notes, files } = this.state;
		await async.eachOf(files, (file, key, callback) => {
			const uploadTask = storage.ref().child(`claims/${ID}/${file.name}`).put(file);
			uploadTask.on(
				"state_changed",
				snapshot => {
					const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
					this.setState({ progress });
				},
				error => {
					notification.error({ message: "Unable to upload image", description: error.message });
				},
				() => {
					return uploadTask.snapshot.ref.getDownloadURL().then(url => {
						if (url) {
							this.setState({ urls: [...this.state.urls, url] });
							callback();
						} else {
							notification.error({
								message: "Something went wrong",
								description: url,
							});
						}
						return null;
					});
				}
			);
		});
		await firestore
			.collection(this.state.ID.startsWith("C") ? "car-insurance" : "truck-insurance")
			.where("insuranceID", "==", this.state.ID)
			.get()
			.then(items => {
				items.docs.map(item => this.setState({ refID: item.id }));
			});
		await firestore
			.collection("claims")
			.add({
				insuranceID: ID,
				date,
				notes,
				insurance: ID.startsWith("C") ? firestore.doc("car-insurance/" + this.state.refID) : firestore.doc("truck-insurance/" + this.state.refID),
				images: this.state.urls,
			})
			.then(() => {
				this.setState({
					ID: "",
					date: null,
					notes: "",
					files: [],
					urls: [],
					imageURL: "",
					insurance: null,
					progress: 0,
				});
				notification.success({
					message: "Upload successful!",
					description: "A Representative will contact you.",
				});
			});
	};

	onFilesChange = e => {
		const files = [];
		Object.values(e.target.files).forEach(file => files.push(file));
		this.setState({ files });
	};

	render() {
		const { visible, close } = this.props;
		return (
			<Modal title="Create Insurance Claim" visible={visible} onCancel={close} onOk={this.saveClaim}>
				<Row style={{ paddingLeft: 10, paddingRight: 10 }} gutter={[10, 10]}>
					<Col span={24}>
						<Row span={24}>
							<h3>Insurance ID</h3>
						</Row>
						<Row span={24}>
							<Input style={{ height: 42 }} value={this.state.ID} onChange={e => this.setState({ ID: e.currentTarget.value })} />
						</Row>
					</Col>
					<Col span={24}>
						<Row span={24}>
							<h3>Date of accident</h3>
						</Row>
						<Row span={24}>
							<DatePicker
								format={"ll"}
								size="large"
								onChange={e => this.setState({ date: e.toDate() })}
								style={{ width: "100%", fontSize: 20 }}
							/>
						</Row>
					</Col>
					<Col span={24}>
						<Row span={24}>
							<h3>Upload photos of accident</h3>
						</Row>
						<Row span={24}>
							<input className="file-input" type="file" onChange={this.onFilesChange} multiple />
						</Row>
					</Col>
					<Col span={24}>
						<Row span={24}>
							<h3>Please briefly explain what caused the accident.</h3>
						</Row>
						<Row span={24}>
							<Input.TextArea
								rows={6}
								style={{ width: "100% !important", fontSize: 20 }}
								value={this.state.notes}
								onChange={e => this.setState({ notes: e.currentTarget.value })}
							/>
						</Row>
					</Col>
				</Row>
			</Modal>
		);
	}
}

export default AddClaims;
