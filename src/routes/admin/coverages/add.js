import React from "react";
import {storage} from "../../../firebase/firebase";
import {Row, Col, Avatar, Input, Modal, Button, Select, Divider, Checkbox} from "antd";
import moment from "moment";

class Add extends React.Component {
	constructor(props) {
		super(props);
		const { thumb, starred, name, type, vehicles, days, price, priceAgent, commission, commissionType, profit, sr22, notes, pipe } = props.contact;
		this.fileInput = React.createRef();
		this.state = {
			thumb,
			starred,
			vehicles,
			name,
			type,
			days,
			price,
			priceAgent,
			commission,
			commissionType,
			profit,
			notes: notes ? notes : "",
			sr22: sr22 ? sr22 :  false,
			pipe: pipe ? pipe : false,
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
		storage.ref("coverages").child(moment().valueOf() + "." + extension).put(file)
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
		const { name, type, vehicles, price, priceAgent, commission, commissionType, days, profit, notes, sr22, starred, pipe } = this.state;
		let { thumb } = this.state;
		if (!thumb) {
			thumb = require("../../../assets/images/coverage.png");
		}
		return (
			<Modal
				title={contact.name === "" ?
					"Add Coverage" :
					"Update Coverage"}
				toggle={onContactClose} visible={open}
				closable={false}
				onOk={() => {
					if (!name || !price || !type || !priceAgent || !profit || days < 0 || !commission || !commissionType) {
						return;
					}
					onContactClose();
					onSaveContact(contactId,
						{
							"name": name,
							"type": type,
							"vehicles": JSON.parse(vehicles),
							"days": JSON.parse(days),
							"price": JSON.parse(price),
							"priceAgent": JSON.parse(priceAgent),
							"commission": JSON.parse(commission),
							"commissionType": commissionType,
							"profit": JSON.parse(profit),
							"notes": notes,
							"thumb": thumb,
							"sr22": sr22,
							"pipe": pipe,
							"starred": starred,
						});
					this.setState({
						"name": "",
						"type": "",
						"vehicles": "",
						"days": "",
						"price": "",
						"priceAgent": "",
						"commission": "",
						"commissionType": "",
						"profit": "",
						"notes": "",
						"thumb": "",
						"sr22": false,
						"pipe": false,
						"starred": "",
					});

				}}
				onCancel={() => {
					this.setState({
						"name": "",
						"type": "",
						"vehicles": "",
						"days": "",
						"price": "",
						"priceAgent": "",
						"commission": "",
						"commissionType": "",
						"profit": "",
						"notes": "",
						"thumb": "",
						"sr22": false,
						"pipe": false,
						"starred": "",
					}, () => onContactClose());
				}}>

				<div className="gx-modal-box-row">
					<div className="gx-modal-box-avatar">
						<Avatar size="large" src={thumb}/>
						<br/>
						<input type="file" ref={this.fileInput} onChange={this._fileChange} style={{display: "none"}} accept="image/x-png,image/jpeg"/>
						<br/>
						<Button className="gx-btn-block ant-btn" type="primary" aria-label="add" onClick={this._uploadPicture}>
							<span>Upload Picture</span>
						</Button>
					</div>

					<div className="gx-modal-box-form-item">
						<Row gutter={10}>
							<Col span={12}>
								<div className="gx-form-group">
									Name: *
									<Input
										required
										onChange={(event) => this.setState({name: event.target.value})}
										value={name}
										margin="none"/>
								</div>
							</Col>
							<Col span={12}>
								Days: *
								<div className="gx-form-group">
									<Input
										required
										type={"number"}
										min={1}
										onChange={(event) => this.setState({days: event.target.value})}
										value={days}
										margin="normal"
									/>
								</div>
							</Col>
						</Row>
						<Row gutter={10}>
							<Col span={12}>
								Vehicles: *
								<Select
									className={"gx-form-group"}
									style={{width: "100%"}}
									required
									onChange={(event) => this.setState({vehicles: event})}
									value={vehicles ? vehicles : undefined}>
									<Select.Option key={0} value={"1"}>1</Select.Option>
									<Select.Option key={1} value={"2"}>2</Select.Option>
								</Select>
							</Col>
							<Col span={12}>
								Type: *
								<Select
									className={"gx-form-group"}
									style={{width: "100%"}}
									required
									onChange={(event) => this.setState({type: event})}
									value={type ? type : undefined}>
									<Select.Option key={0} value={"Car"}>Car</Select.Option>
									<Select.Option key={1} value={"Truck"}>Truck</Select.Option>
								</Select>
							</Col>
						</Row>
						<Row gutter={10}>
							<Col span={12}>
								Price: *
								<div className="gx-form-group">
									<Input
										required
										type={"number"}
										min={1}
										onChange={(event) => this.setState({price: event.target.value})}
										value={price}
										margin="normal"
									/>
								</div>
							</Col>
							<Col span={12}>
								Profit: *
								<div className="gx-form-group">
									<Input
										required
										type={"number"}
										min={1}
										onChange={(event) => this.setState({profit: event.target.value})}
										value={profit}
										margin="normal"
									/>
								</div>
							</Col>
							<Col span={12}>
								{
									this.state.type === "Car" ? (
										<>
											SR-22 Insurance
											<div className="gx-form-group">
												<Checkbox checked={this.state.sr22} onChange={e => this.setState({ sr22: e.target.checked })}/>
											</div>
										</>
									) : null
								}
								{
									this.state.type === "Truck" ? (
										<>
											Pipe Insurance
											<div className="gx-form-group">
												<Checkbox checked={this.state.pipe} onChange={e => this.setState({ pipe: e.target.checked })}/>
											</div>
										</>
									) : null
								}
							</Col>
						</Row>
						<Divider/>
						<Row gutter={10}>
							<Col span={24}>
								Price for Agents: *
								<div className="gx-form-group">
									<Input
										required
										type={"number"}
										min={1}
										onChange={(event) => this.setState({priceAgent: event.target.value})}
										value={priceAgent}
										margin="normal"
									/>
								</div>
							</Col>
						</Row>
						<Divider/>
						<Row gutter={10}>
							<Col span={12}>
								Commission Type for Groups: *
								<div className="gx-form-group">
									<Select
										style={{width: "100%"}}
										required
										onChange={(event) => this.setState({commissionType: event})}
										value={commissionType ? commissionType : undefined}>
										<Select.Option key={0} value={"$"}>Dollars</Select.Option>
										<Select.Option key={1} value={"%"}>Percentage</Select.Option>
									</Select>
								</div>
							</Col>
							<Col span={12}>
								Commission for Groups: *
								<div className="gx-form-group">
									<Input
										required
										type={"number"}
										onChange={(event) => this.setState({commission: event.target.value})}
										value={commission}
										margin="normal"
									/>
								</div>
							</Col>
						</Row>
						<Divider/>
						<div className="gx-form-group">
							Notes:
							<Input.TextArea
								type={"notes"}
								rows={4}
								onChange={(event) => this.setState({notes: event.target.value})}
								value={notes}
								margin="normal"/>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}

export default Add;
