import React from "react";
import { Modal, Button } from "antd";
import { connect } from "react-redux";
import moment from "moment";
import async from "async";

import Vehicles from "./addInsurance/vehicles";
import Dates from "./addInsurance/dates";
import Price from "./addInsurance/price";
import PaymentMethod from "./addInsurance/paymentMethod";

import ConfirmVin from "./addInsurance/confirmVin";
import purchase from "./addInsurance/purchase";
import errors from "./addInsurance/errors";
import save from "./addInsurance/save";

import { onAddClient } from "../appRedux/actions/Clients";
import AddClient from "../routes/data/clients/add";
import { firestore } from "../firebase/firebase";
import updateDraft from "./addInsurance/updateDraft";
import Customers from "./addInsurance/customers";
import Coverages from "./addInsurance/coverages";

class EditDraft extends React.PureComponent {
	state = {
		loading: false,
		loadingDraft: false,
		editing: null,
		coverages: [],
	};

	componentDidUpdate = prevProps => {
		if (this.props.id && prevProps.id !== this.props.id) {
			return firestore
				.doc(`drafts/${this.props.id}`)
				.get()
				.then(r => {
					this.setState({
						coverages: this.props.coverages,
						editing: r.data().clientName,

						client: r.data().client?.id ?? null,
						clientName: r.data().clientName,
						coverage: r.data().coverage?.id ?? null,
						coverageData: {
							...r.data().coverage,
							thumb: null,
						},
						coverageDays: r.data().days,
						coverageName: r.data().coverageName,
						coverageNotes: r.data().coverageNotes,
						coveragePrice: r.data().coveragePrice,
						total: r.data().total,

						insurance: r.data().insurance,

						year: r.data().year,
						make: r.data().make,
						model: r.data().model,
						plates: r.data().plates ? r.data().plates : null,
						vin: r.data().vin?.toUpperCase() ?? null,
						image: r.data().image,

						driver: r.data().driver ? r.data().driver : null,
						extra: r.data().extra ? r.data().extra : null,
						cargoExtra: r.data().extra && r.data().cargoExtra && this.props.type === "truck" ? r.data().cargoExtra : null,
						yearExtra: r.data().extra ? r.data().yearExtra : null,
						makeExtra: r.data().extra ? r.data().makeExtra : null,
						modelExtra: r.data().extra ? r.data().modelExtra : null,
						platesExtra: r.data().extra && r.data().platesExtra ? r.data().platesExtra : null,
						vinExtra: r.data().extra ? r.data().vinExtra?.toUpperCase() ?? null : null,
						imageExtra: r.data().extra ? r.data().imageExtra : null,

						from: r.data().from ? moment(r.data().from["toDate"]()) : null,
						to: r.data().to ? moment(r.data().to["toDate"]()) : null,
						dateRange: [moment(r.data().from?.toDate()), moment(r.data().to?.toDate())],
						days: r.data().days,
					});
				});
		}
	};

	verify = e => {
		e.preventDefault();
		const parent = this;
		errors(this.state, this.props)
			.then(() => {
				Modal.confirm({
					title: "Are you sure you want to create this insurance?",
					content: <ConfirmVin vin={this.state.vin} />,
					onOk() {
						return parent.purchase();
					},
				});
			})
			.catch(e => {
				return Modal.error(e);
			});
	};

	purchase = async () => {
		await this.setState({ loading: true });
		purchase(this.state, this.props)
			.then(res => {
				save(res.receipt, res.charge, res.method, res.methodSource, this.state, this.props)
					.then(async () => {
						this.setState({ loading: false });
						await firestore.doc("drafts/" + this.props.id).delete();
						this.props.onClose();
					})
					.catch(e => {
						this.setState({ loading: false });
						return Modal.error(e.message);
					});
			})
			.catch(e => {
				this.setState({ loading: false });
				return Modal.error(e.message);
			});
	};

	updateDraft = () => {
		updateDraft(this.state, this.props, this.props.id).then(() => {
			this.setState({ loadingDraft: false });
			this.props.onClose();
		});
	};

	paypalCompleted = (details, data) => {
		save(data["orderID"], null, "Card", "Paypal", this.state, this.props)
			.then(() => {
				this.setState({ loading: false });
				this.props.onClose();
			})
			.catch(e => {
				return Modal.error(e);
			});
	};

	onSaveClient = (id, data) => {
		this.props.onAddClient(
			{
				...data,
				timestamp: moment().toDate(),
			},
			this.props.auth
		);
	};

	onClientClose = () => {
		this.setState({
			addClient: false,
		});
	};
	render() {
		if (!this.props.clients.length) {
			return null;
		}

		return (
			<React.Fragment>
				<Modal
					forceRender
					destroyOnClose
					title={"Draft"}
					visible={this.props.id}
					confirmLoading={this.state.loading}
					closable={false}
					onCancel={this.props.onClose}
					footer={null}>
					<form onSubmit={this.verify}>
						<Customers route={"drafts"} state={this.state} type={this.props.type} onChange={e => this.setState(e)} />
						<Coverages state={this.state} onChange={e => this.setState(e)} />
						<Vehicles state={this.state} type={this.props.type} onChange={e => this.setState(e)} />
						<Dates state={this.state} onChange={e => this.setState(e)} />
						<Price route={"drafts"} state={this.state} />
						<PaymentMethod state={this.state} props={this.props} paypalCompleted={this.paypalCompleted} />
						<div className={"gx-form-group"} style={{ textAlign: "right", marginTop: 20, marginBottom: -20 }}>
							<div style={{ display: "flex", justifyContent: "space-between" }}>
								<div>
									<Button onClick={this.saveAsDraft} type={"default"} loading={this.state.loadingDraft}>
										Save as Draft
									</Button>
								</div>
								<div>
									<Button type={"danger"} onClick={this.props.onClose}>
										Cancel
									</Button>
									{this.props.configuration === "paypal" ? null : (
										<Button htmlType={"submit"} type={"primary"} loading={this.state.loading}>
											Submit
										</Button>
									)}
								</div>
							</div>
						</div>
					</form>
				</Modal>
				<AddClient
					open={this.state.addClient}
					onSaveContact={this.onSaveClient}
					onContactClose={this.onClientClose}
					contact={{
						thumb: "",
						type: "",
						phone: "",
						name: "",
						email: "",
						rfc: "",
						dob: null,
						address: "",
						city: "",
						state: "",
						zip: "",
						country: "",
						notes: "",
					}}
				/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = state => {
	let coverages = [];

	async.forEachOf(state.coverage.contactList, (element, index, callback) => {
		coverages.push({
			id: index,
			name: element.name,
			type: element.type,
			price: element.price,
			notes: element.notes,
			days: element.days,
			sr22: element.sr22 ? element.sr22 : false,
			pipe: element.pipe ? element.pipe : false,
			vehicles: element.vehicles,
		});
		callback();
	});

	return {
		coverages,
		auth: state.auth,
		clients: state.clients.contactList,
	};
};

export default connect(mapStateToProps, {
	onAddClient,
})(EditDraft);
