import React from "react";
import { storage } from "../../../firebase/firebase";
import { Avatar, Input, DatePicker, Select, Modal, Row, Col, Spin } from "antd";
import { validateEmail } from "../../../util/helpers";
import MaskedInput from "react-text-mask";
import moment from "moment";

class Add extends React.Component {
	constructor(props) {
		super(props);
		this.fileInput = React.createRef();
		this.state = {
			thumb: props.contact.thumb,
			type: props.contact.type,
			phone: props.contact.phone,
			name: props.contact.name,
			email: props.contact.email,
			rfc: props.contact.rfc,
			dob: null,
			address: props.contact.address,
			city: props.contact.city,
			state: props.contact.state,
			zip: props.contact.zip,
			country: props.contact.country,
			notes: props.contact.notes,
			uploading: false,
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		if (nextProps.contact.id === this.props.contact.id) {
			return null;
		}
		this.setState({
			thumb: nextProps.contact.thumb,
			type: nextProps.contact.type,
			phone: nextProps.contact.phone,
			name: nextProps.contact.name,
			email: nextProps.contact.email,
			rfc: nextProps.contact.rfc,
			address: nextProps.contact.address,
			city: nextProps.contact.city,
			state: nextProps.contact.state,
			zip: nextProps.contact.zip,
			country: nextProps.contact.country,
			notes: nextProps.contact.notes,
		});

		if (nextProps.contact.dob) {
			if (nextProps.contact.dob.seconds) {
				this.setState({
					dob: moment(nextProps.contact.dob.seconds, "X"),
				});
			}
		} else {
			this.setState({
				dob: null,
			});
		}
	}

	_uploadPicture = () => {
		this.fileInput.current.click();
	};

	_fileChange = () => {
		const parent = this;
		const file = this.fileInput.current.files[0];
		const name = file.name;
		this.setState({ uploading: true });
		const extension = name.substr(name.lastIndexOf(".") + 1, name.length);
		storage
			.ref("licenses")
			.child(moment().valueOf() + "." + extension)
			.put(file)
			.then(function (snapshot) {
				snapshot.ref.getDownloadURL().then(function (downloadURL) {
					parent.setState({
						thumb: downloadURL,
						license: downloadURL,
						uploading: false,
					});
				});
			});
	};

	render() {
		const { onSaveContact, onContactClose, open, contact } = this.props;
		let { thumb } = this.state;
		if (!thumb) {
			thumb = require("assets/images/license.png");
		}
		return (
			<Modal
				title={contact.name === "" ? "Add Client" : "Update Client"}
				toggle={onContactClose}
				visible={open}
				closable={false}
				onCancel={() => {
					this.setState(
						{
							thumb: null,
							type: null,
							phone: null,
							name: null,
							email: null,
							rfc: null,
							dob: null,
							address: null,
							city: null,
							state: null,
							zip: null,
							country: null,
							license: null,
							notes: null,
						},
						() => onContactClose()
					);
				}}
				onOk={() => {
					if (!this.state.license) {
						return Modal.error({ title: "Something is missing", content: "You must upload the driver's license" });
					}
					if (this.state.name === "" || !this.state.email || !this.state.type) {
						return;
					}
					if (!validateEmail(this.state.email)) {
						return Modal.error({
							title: "Something is wrong",
							content: "The email does not appear to be valid",
						});
					}
					onSaveContact(contact.id, {
						thumb: this.state.thumb,
						type: this.state.type,
						phone: this.state.phone,
						name: this.state.name,
						email: this.state.email,
						rfc: this.state.rfc,
						dob: this.state.dob ? this.state.dob.toDate() : null,
						address: this.state.address,
						city: this.state.city,
						state: this.state.state,
						zip: this.state.zip,
						country: this.state.country,
						license: this.state.license,
						notes: this.state.notes,
					});
					onContactClose();
				}}>
				<Row>
					<Col span={7}>
						<Avatar size={128} src={thumb} onClick={this._uploadPicture} />
						<Spin style={{ position: "absolute", left: "40%", top: "40%" }} spinning={this.state.uploading} />
						<input type="file" ref={this.fileInput} onChange={this._fileChange} style={{ display: "none" }} accept="image/x-png,image/jpeg" />
					</Col>
					<Col span={17}>
						<Row gutter={10}>
							<Col span={12}>
								<div className="gx-form-group">
									<Select
										placeholder="Type*"
										style={{ width: "100%" }}
										onChange={value => this.setState({ type: value })}
										value={this.state.type ? this.state.type : undefined}>
										<Select.Option key={0} value={"Turista"}>
											Turista
										</Select.Option>
										<Select.Option key={1} value={"Transmigrante"}>
											Transmigrante
										</Select.Option>
									</Select>
								</div>
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
										mask={["+", /\d/, /\d/, " ", "(", /[1-9]/, /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/]}
									/>
								</div>
							</Col>
						</Row>
						<div className="gx-form-group">
							<Input
								required
								placeholder="Name*"
								onChange={event => this.setState({ name: event.target.value })}
								value={this.state.name}
								margin="none"
							/>
						</div>
						<div className="gx-form-group">
							<Input
								placeholder="Email*"
								onChange={event => this.setState({ email: event.target.value })}
								value={this.state.email}
								margin="normal"
							/>
						</div>
					</Col>
				</Row>
				<Row gutter={10}>
					<Col span={12}>
						<div className="gx-form-group">
							<Input placeholder="RFC" onChange={event => this.setState({ rfc: event.target.value })} value={this.state.rfc} margin="normal" />
						</div>
					</Col>
					<Col span={12}>
						<div className="gx-form-group">
							<DatePicker
								format={"ll"}
								placeholder="DOB"
								style={{ width: "100%" }}
								onChange={date => this.setState({ dob: date })}
								value={this.state.dob}
								margin="normal"
							/>
						</div>
					</Col>
					<Col span={24}>
						<div className="gx-form-group">
							<Input
								placeholder="Address"
								onChange={event => this.setState({ address: event.target.value })}
								value={this.state.address}
								margin="normal"
							/>
						</div>
					</Col>
					<Col span={6}>
						<div className="gx-form-group">
							<Input placeholder="City" onChange={event => this.setState({ city: event.target.value })} value={this.state.city} margin="normal" />
						</div>
					</Col>
					<Col span={6}>
						<div className="gx-form-group">
							<Input
								placeholder="State"
								onChange={event => this.setState({ state: event.target.value })}
								value={this.state.state}
								margin="normal"
							/>
						</div>
					</Col>
					<Col span={6}>
						<div className="gx-form-group">
							<Input
								placeholder="Zip Code"
								onChange={event => this.setState({ zip: event.target.value })}
								value={this.state.zip}
								margin="normal"
							/>
						</div>
					</Col>
					<Col span={6}>
						<div className="gx-form-group">
							<Input
								placeholder="Country"
								onChange={event => this.setState({ country: event.target.value })}
								value={this.state.type === "Turista" ? "México" : this.state.country}
								disabled={this.state.type === "Turista"}
								margin="normal"
							/>
						</div>
					</Col>
					<Col span={24}>
						<div className="gx-form-group">
							<Input.TextArea
								rows={6}
								placeholder="Notes"
								onChange={event => this.setState({ notes: event.target.value })}
								value={this.state.notes}
								margin="normal"
							/>
						</div>
					</Col>
				</Row>
			</Modal>
		);
	}
}

export default Add;
