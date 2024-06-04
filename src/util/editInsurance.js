import React from "react";
import moment from "moment";
import { Modal, Button, Typography, Select } from "antd";
import { connect } from "react-redux";
import { firestore } from "../firebase/firebase";

import Vehicles from "./addInsurance/vehicles";
import Dates from "./addInsurance/dates";

class Edit extends React.PureComponent {
	state = {
		loading: false,
	};

	componentDidUpdate = prevProps => {
		if (this.props.id && prevProps.id !== this.props.id) {
			firestore
				.doc(`${this.props.type}-insurance/${this.props.id}`)
				.get()
				.then(r => {
					this.setState({
						agent: r.data().agent.id,

						year: r.data().year,
						make: r.data().make,
						model: r.data().model,
						plates: r.data().plates ? r.data().plates : null,
						vin: r.data().vin.toUpperCase(),
						image: r.data().image,

						driver: r.data().driver ? r.data().driver : null,
						extra: r.data().extra ? r.data().extra : null,
						cargoExtra: r.data().extra && r.data().cargoExtra && this.props.type === "truck" ? r.data().cargoExtra : null,
						yearExtra: r.data().extra ? r.data().yearExtra : null,
						makeExtra: r.data().extra ? r.data().makeExtra : null,
						modelExtra: r.data().extra ? r.data().modelExtra : null,
						platesExtra: r.data().extra && r.data().platesExtra ? r.data().platesExtra : null,
						vinExtra: r.data().extra ? r.data().vinExtra.toUpperCase() : null,
						imageExtra: r.data().extra ? r.data().imageExtra : null,

						from: r.data().from ? moment(r.data().from["toDate"]()) : null,
						to: r.data().to ? moment(r.data().to["toDate"]()) : null,
						dateRange: [moment(r.data().from.toDate()), moment(r.data().to.toDate())],
						days: r.data().days,
					});
				});
		}
	};

	verify = async e => {
		e.preventDefault();
		await this.setState({ loading: true });

		const agentData = this.props.agents.contactList.find(x => x.id === this.state.agent);
		const insuranceData = {
			agent: firestore.doc(`agents/${agentData.id}`),
			agentName: agentData.company,
			agentType: agentData.special ? "Group" : "Agent",
			edited:true,
			year: this.state.year,
			make: this.state.make,
			model: this.state.model,
			plates: this.state.plates ? this.state.plates : null,
			vin: this.state.vin.toUpperCase(),
			image: this.state.image,

			driver: this.state.driver ? this.state.driver : null,
			extra: this.state.extra ? this.state.extra : null,
			cargoExtra: this.state.extra && this.state.cargoExtra && this.props.type === "truck" ? this.state.cargoExtra : null,
			yearExtra: this.state.extra ? this.state.yearExtra : null,
			makeExtra: this.state.extra ? this.state.makeExtra : null,
			modelExtra: this.state.extra ? this.state.modelExtra : null,
			platesExtra: this.state.extra && this.state.platesExtra ? this.state.platesExtra : null,
			vinExtra: this.state.extra ? this.state.vinExtra.toUpperCase() : null,
			imageExtra: this.state.extra ? this.state.imageExtra : null,

			from: this.state.from ? this.state.from.toDate() : null,
			to: this.state.to ? this.state.to.toDate() : null,
			days: this.state.days,
		};

		await firestore.doc(`${this.props.type}-insurance/${this.props.id}`).update(insuranceData);
		await this.setState({ loading: false });
		this.props.onClose();
	};

	close = () => {
		this.setState({ loading: false });
		this.props.onClose();
	};

	render() {
		return (
			<Modal title={"Edit Insurance"} visible={this.props.id} closable={false} onCancel={this.close} footer={null}>
				<form onSubmit={this.verify}>
					<Typography.Title level={4}>Agent</Typography.Title>
					<Select style={{ marginBottom: 10 }} value={this.state.agent} onChange={agent => this.setState({ agent })}>
						{this.props.agents.contactList.map(x => (
							<Select.Option value={x.id} key={x.id}>
								{x.company}
							</Select.Option>
						))}
					</Select>
					<Vehicles state={this.state} type={this.props.type} onChange={e => this.setState(e)} />
					<Dates state={this.state} onChange={e => this.setState(e)} />
					<div className={"gx-form-group"} style={{ textAlign: "right", marginTop: 20, marginBottom: -20 }}>
						<Button onClick={this.close}>Cancel</Button>
						<Button htmlType={"submit"} type={"primary"} loading={this.state.loading}>
							Update
						</Button>
					</div>
				</form>
			</Modal>
		);
	}
}

const mapStateToProps = state => {
	return {
		agents: state.agents,
	};
};

export default connect(mapStateToProps)(Edit);
