import React from "react";
import { storage } from "../../../firebase/firebase";
import { Avatar, Input, DatePicker, Modal, Select, Row, Col, Switch } from "antd";
import MaskedInput from "react-text-mask";
import moment from "moment";

class Add extends React.Component {
	constructor(props) {
		super(props);
		this.fileInput = React.createRef();

		this.state = {
			selectedAgents: [],
			agents: props.agents,
			thumb: props.contact.thumb,
			credit: props.contact.credit,
			company: props.contact.company,
			phone: props.contact.phone,
			name: props.contact.name,
			email: props.contact.email,
			password: props.contact.password,
			rfc: props.contact.rfc,
			dob: null,
			address: props.contact.address,
			city: props.contact.city,
			state: props.contact.state,
			zip: props.contact.zip,
			country: props.contact.country,
			notes: props.contact.notes,
			special: props.contact.special,
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
		this.setState({
			selectedAgents: nextProps.contact.selectedAgents,
			agents: nextProps.agents,
			thumb: nextProps.contact.thumb,
			company: nextProps.contact.company,
			credit: nextProps.contact.credit,
			phone: nextProps.contact.phone,
			name: nextProps.contact.name,
			email: nextProps.contact.email,
			password: nextProps.contact.password,
			rfc: nextProps.contact.rfc,
			address: nextProps.contact.address,
			city: nextProps.contact.city,
			state: nextProps.contact.state,
			zip: nextProps.contact.zip,
			country: nextProps.contact.country,
			notes: nextProps.contact.notes,
			special: nextProps.contact.special,
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
		const { onSaveContact, onContactClose, open, contact } = this.props;
		const { Option } = Select;
		let { thumb } = this.state;
		if (!thumb) {
			thumb =
				"https://firebasestorage.googleapis.com/v0/b/fast-in-transit.appspot.com/o/public%2Fagent.png?alt=media&token=a8a50505-0237-45e8-ba8f-6fa9e212dcef";
		}
		return (
			<Modal
				title={contact.name === "" ? "Add Capturist" : "Update Capturist"}
				toggle={onContactClose}
				visible={open}
				closable={false}
				onCancel={onContactClose}
				onOk={() => {
					if (
						this.state.selectedAgents <= 0 ||
						this.state.name === "" ||
						this.state.company === "" ||
						this.state.email === "" ||
						this.state.password === ""
					) {
						return;
					}
					onSaveContact(contact.id, {
						thumb: thumb,
						company: this.state.company,
						credit: this.state.credit,
						phone: this.state.phone,
						name: this.state.name,
						email: this.state.email,
						password: this.state.password,
						rfc: this.state.rfc,
						dob: this.state.dob ? this.state.dob.toDate() : null,
						address: this.state.address,
						city: this.state.city,
						state: this.state.state,
						zip: this.state.zip,
						country: this.state.country,
						notes: this.state.notes,
						special: this.state.special === "Special Agent",
						selectedAgents: this.state.selectedAgents,
						type: "capturist",
					});
					onContactClose();
				}}>
				<Row>
					<Col span={7}>
						<Avatar size={128} src={thumb} onClick={this._uploadPicture} />
						<input type="file" ref={this.fileInput} onChange={this._fileChange} style={{ display: "none" }} accept="image/x-png,image/jpeg" />
					</Col>
					<Col span={17}>
						<Row>
							<Col span={24}>
								<div className="gx-form-group">
									Credit Option
									<Switch style={{ marginLeft: 16 }} checked={this.state.credit} onChange={e => this.setState({ credit: e })} />
								</div>
							</Col>
						</Row>
						<Row gutter={5}>
							<Col span={24}>
								<div className="gx-form-group">
									<Select
										mode="multiple"
										value={this.state.selectedAgents}
										style={{ width: "100%" }}
										placeholder="Agents*"
										onChange={e => {
											this.setState({ selectedAgents: e });
										}}
										required>
										{this.state.agents?.map(item => (
											<Option value={item.key} key={item.key}>
												{item.agentName}
											</Option>
										))}
									</Select>
								</div>
							</Col>
							<Col span={24}>
								<div className="gx-form-group">
									<Input
										required
										placeholder="Company Name*"
										onChange={event => this.setState({ company: event.target.value })}
										value={this.state.company}
										margin="none"
									/>
								</div>
							</Col>
						</Row>
						<Row gutter={10}>
							<Col span={12}>
								<div className="gx-form-group">
									<Input
										required
										placeholder="Name*"
										onChange={event => this.setState({ name: event.target.value })}
										value={this.state.name}
										margin="none"
									/>
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
						<Row gutter={10}>
							<Col span={12}>
								<div className="gx-form-group">
									<Input
										placeholder="Email*"
										onChange={event => this.setState({ email: event.target.value })}
										value={this.state.email}
										margin="normal"
									/>
								</div>
							</Col>
							<Col span={12}>
								<div className="gx-form-group">
									<Input
										placeholder="Password*"
										type={"password"}
										onChange={event => this.setState({ password: event.target.value })}
										value={this.state.password}
										margin="normal"
									/>
								</div>
							</Col>
						</Row>
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
