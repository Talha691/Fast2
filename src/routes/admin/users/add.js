import React from "react";
import { storage } from "../../../firebase/firebase";
import { Avatar, Input, Modal, Button, Row, Col, Select } from "antd";
import MaskedInput from "react-text-mask";
import moment from "moment";

class Add extends React.Component {
	constructor(props) {
		super(props);
		const { thumb, name, type, email, phone, designation, starred, frequently } = props.contact;
		this.fileInput = React.createRef();
		this.state = {
			thumb,
			name,
			type,
			email,
			phone,
			designation,
			starred,
			frequently,
			password: "",
		};
	}

	_uploadPicture = () => {
		this.fileInput.current.click();
	};

	_fileChange = () => {
		const parent = this;
		const file = this.fileInput.current.files[0];
		const name = file.name;
		const extension = name.substr(name.lastIndexOf(".") + 1, name.length);
		storage
			.ref("users")
			.child(moment().valueOf() + "." + extension)
			.put(file)
			.then(function (snapshot) {
				snapshot.ref.getDownloadURL().then(function (downloadURL) {
					parent.setState({
						thumb: downloadURL,
					});
				});
			});
	};

	render() {
		const { contactId, onSaveContact, onContactClose, open, contact } = this.props;
		const { name, type, email, phone, designation, starred, password } = this.state;
		let { thumb } = this.state;
		if (!thumb) {
			thumb =
				"https://firebasestorage.googleapis.com/v0/b/fast-in-transit.appspot.com/o/public%2Fuser.png?alt=media&token=15678e70-024e-4205-afb9-9b2322c30b74";
		}
		return (
			<Modal
				title={contact.name === "" ? "Add User" : "Update User"}
				toggle={onContactClose}
				visible={open}
				closable={false}
				onOk={() => {
					if (!name || !type || !email) {
						return;
					} else if (!password) {
						onSaveContact(contactId, {
							name: name,
							type: type,
							email: email,
							thumb: thumb,
							phone: phone,
							designation: designation,
							starred: starred,
						});
					} else {
						onSaveContact(contactId, {
							name: name,
							type: type,
							email: email,
							password: password,
							thumb: thumb,
							phone: phone,
							designation: designation,
							starred: starred,
						});
					}
					onContactClose();
					this.setState({
						name: "",
						type: "",
						email: "",
						password: "",
						thumb: "",
						phone: "",
						designation: "",
					});
				}}
				onCancel={() => {
					this.setState(
						{
							name: "",
							type: "",
							thumb: "",
							email: "",
							phone: "",
							designation: "",
						},
						() => onContactClose()
					);
				}}>
				<div className="gx-modal-box-row">
					<div className="gx-modal-box-avatar">
						<Avatar size="large" src={thumb} />
						<br />
						<input type="file" ref={this.fileInput} onChange={this._fileChange} style={{ display: "none" }} accept="image/x-png,image/jpeg" />
						<br />
						<Button className="gx-btn-block ant-btn" type="primary" aria-label="add" onClick={this._uploadPicture}>
							<span>Upload Picture</span>
						</Button>
					</div>

					<div className="gx-modal-box-form-item">
						<div className="gx-form-group">
							<Input required placeholder="Name *" onChange={event => this.setState({ name: event.target.value })} value={name} margin="none" />
						</div>
						<Row gutter={12}>
							<Col span={12}>
								<Select
									style={{ width: "100%" }}
									placeholder={"User Type *"}
									required
									onChange={event => this.setState({ type: event })}
									value={type ? type : undefined}>
									<Select.Option key={0} value={"Admin"}>
										Admin
									</Select.Option>
									<Select.Option key={1} value={"Super Admin"}>
										Super Admin
									</Select.Option>
								</Select>
							</Col>
							<Col span={12}>
								<div className="gx-form-group">
									<MaskedInput
										placeholder="Phone"
										onChange={event => this.setState({ phone: event.target.value })}
										value={this.state.phone}
										margin="normal"
										className={"ant-input"}
										guide={false}
										mask={["(", /[1-9]/, /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]}
									/>
								</div>
							</Col>
						</Row>
						<div className="gx-form-group">
							<Input
								placeholder="Designation"
								onChange={event => this.setState({ designation: event.target.value })}
								value={designation}
								autosize={{ minRows: 2, maxRows: 6 }}
								margin="normal"
							/>
						</div>
						<Row gutter={10}>
							<Col span={12}>
								<div className="gx-form-group">
									<Input
										placeholder="Email*"
										required={true}
										type={"email"}
										onChange={event => this.setState({ email: event.target.value })}
										value={email}
										margin="normal"
									/>
								</div>
							</Col>
							<Col span={12}>
								<div className="gx-form-group">
									<Input
										placeholder="Password*"
										required={true}
										type={"password"}
										onChange={event => this.setState({ password: event.target.value })}
										value={password}
										margin="normal"
									/>
								</div>
							</Col>
						</Row>
					</div>
				</div>
			</Modal>
		);
	}
}

export default Add;
