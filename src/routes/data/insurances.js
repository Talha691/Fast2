import React, { PureComponent } from "react";
import { Button, Card, Table, Row, Col, Typography, Input, Modal } from "antd";
// import { Icon } from 'antd-icons';
import Highlighter from "react-highlight-words";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, ElementsConsumer } from "@stripe/react-stripe-js";

import moment from "moment";
import axios from "axios";
import Swal from "sweetalert2";

import Add from "../../util/addInsurance";
import Edit from "../../util/editInsurance";
import { connect } from "react-redux";
import async from "async";

import { onAddCarInsurance, onDeleteCarInsurance, onUpdateCarInsurance } from "../../appRedux/actions/CarInsurance";

import { onAddTruckInsurance, onDeleteTruckInsurance, onUpdateTruckInsurance } from "../../appRedux/actions/TruckInsurance";

import { onGetAllClient } from "../../appRedux/actions/Clients";
import { onGetAllAgents } from "../../appRedux/actions/Agents";
import { onGetAllCoverages } from "../../appRedux/actions/Coverages";
import Can from "../../roles/Can";
import { firestore } from "../../firebase/firebase";

const stripe = loadStripe("pk_live_51OqggJIz0lpOCcFPmhpr8wOCcmZRafbxekCcRpb3Dbu5WdnKWHWScgA9A1sWXNsC0sJYXOgqfN8PJb8RAgc09qW300ROBMlIew");

class FirebaseCRUD extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			contactList: [],
			addContactState: false,
			configuration: null,
			truckInsurances: [],
			carInsurances: [],
			loading: false,
			limit: process.env.NODE_ENV === "development" ? 500 : 500,
		};
	}

	componentDidMount() {
	
		this.onGetAllCarInsurances(this.props.auth);
		this.onGetAllTruckInsurances(this.props.auth);
		this.props.onGetAllAgents();
		this.props.onGetAllClient(this.props.auth);
		
		this.props.onGetAllCoverages(this.props.auth);
		firestore
			.doc("configuration/panel")
			.get()
			.then(config => {
				this.setState({
					configuration: config.data().paymentMethod,
				});
			});
	}

	onGetAllCarInsurances = async auth => {
		if (auth.type === "Agent" || auth.type === "Group" || auth.agent || auth.type === "capturist") {
			return this.getAgentDataCar(auth);
		}
		const agents = await firestore.collection("agents").get();
		firestore
			.collection("car-insurance")
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(snapshot.docs, (doc, callback) => {
					let agent = "-";
					if (doc.data().fromAgent) {
						const myAgent = agents.docs.find(x => x.id === doc.data().agent.id);
						agent = myAgent ? myAgent.data().name : "--";
					}
					const insuranceID = doc.data().insuranceID;
						allClients.push({
							id: doc.id,
							agentName: agent,
							...doc.data(),
							status: doc.data().to
								? moment(doc.data().to.toDate()).isBefore(moment())
									? "Expired"
									: doc.data().status
										? doc.data().status
										: "Active"
								: "-",
						});
					callback();
				});
				//REDEPLOY
				const orderedIds = allClients.map(item => {
					return {
						...item,
						insuranceID: item.insuranceID,
						numericID: parseInt(item.insuranceID.substring(1)), // Extraemos solo la parte numérica para ordenar
					};
				});

				orderedIds.sort((a, b) => b.numericID - a.numericID); // Usamos numericID para ordenar
				// No necesitamos modificar el insuranceID de nuevo a formato con "C", ya lo hemos mantenido como cadena
				this.setState({
					carInsurances: orderedIds,
					loading: false,
				});
			});
	};
	onGetAllTruckInsurances = async auth => {
		if (auth.type === "Agent" || auth.type === "Group" || auth.agent || auth.type === "capturist") {
			return this.getAgentDataTruck(auth);
		}
		const agents = await firestore.collection("agents").get();
		firestore
			.collection("truck-insurance")
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(snapshot.docs, (doc, callback) => {
					let agent = "-";
					if (doc.data().fromAgent) {
						const myAgent = agents.docs.find(x => x.id === doc.data().agent.id);
						agent = myAgent ? myAgent.data().name : "--";
					}
					const insuranceID = doc.data().insuranceID;
						allClients.push({
							id: doc.id,
							agentName: agent,
							...doc.data(),
							status: doc.data().to
								? moment(doc.data().to.toDate()).isBefore(moment())
									? "Expired"
									: doc.data().status
										? doc.data().status
										: "Active"
								: "-",
						});
					
					callback();
				});
				const orderedIds = allClients.map(item => {
					const numericPart = item.insuranceID.substring(1); // Extraer la parte numérica como cadena
					return {
						...item,
						numericID: parseInt(numericPart), // Usar para ordenar
						insuranceID: item.insuranceID, // Mantener el original como cadena
						numericPart: numericPart, // Mantener también como cadena para reconstruir correctamente
					};
				});

				// Ordenar usando numericID
				orderedIds.sort((a, b) => b.numericID - a.numericID);

				// Mapear nuevamente para ajustar el formato de insuranceID y eliminar campos adicionales
				const newId = orderedIds.map(item => {
					// Asegurar que la reconstrucción de 'insuranceID' mantiene los ceros a la izquierda
					return {
						...item,
						insuranceID: "T" + item.numericPart, // Usar numericPart para mantener ceros
					};
				});

				this.setState({
					truckInsurances: newId,
					loading: false,
				});

			});
	};
	getAgentDataTruck = async auth => {
		const agent = firestore.doc("agents/" + auth.agent);
		const agentData = await agent.get();
		firestore
			.collection("truck-insurance")
			.where("agent", "==", agent)
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(snapshot.docs, async (doc, callback) => {
					const insuranceID = doc.data().insuranceID;
					// Filtrar por 'insuranceID' que no contenga "2023" o "2024"
						allClients.push({
							id: doc.id,
							agentName: agentData.data().name,
							...doc.data(),
							status: doc.data().to
								? moment(doc.data().to.toDate()).isBefore(moment())
									? "Expired"
									: doc.data().status
										? doc.data().status
										: "Active"
								: "-",
						});
					
					callback();
				}, () => {
					// Ordenar y actualizar el estado una vez completado el ciclo de todos los documentos
					allClients.sort((a, b) => parseInt(b.insuranceID.substring(1)) - parseInt(a.insuranceID.substring(1)));

					// Reconstruir el insuranceID asegurándose de mantener los ceros a la izquierda
					const newId = allClients.map(item => {
						// Asegurar que la reconstrucción de 'insuranceID' mantiene los ceros
						return {
							...item,
							insuranceID: "T" + item.insuranceID.substring(1),  // Usar substring(1) preserva los ceros a la izquierda
						};
					});

					this.setState({
						truckInsurances: newId,
						loading: false,
					});
				});
			});
	};


	getAgentDataCar = async auth => {
		const agent = firestore.doc("agents/" + auth.agent);
		const agentData = await agent.get();
		firestore
			.collection("car-insurance")
			.where("agent", "==", agent)
			.orderBy("timestamp", "desc")
			.limit(this.state.limit)
			.onSnapshot(snapshot => {
				let allClients = [];
				async.eachSeries(snapshot.docs, (doc, callback) => {
					const insuranceID = doc.data().insuranceID;
						allClients.push({
							id: doc.id,
							agentName: agentData.data().name,
							...doc.data(),
							status: doc.data().to
								? moment(doc.data().to.toDate()).isBefore(moment())
									? "Expired"
									: doc.data().status
										? doc.data().status
										: "Active"
								: "-",
						});
					callback();
				});
				const orderedIds = allClients.map(item => {
					return {
						...item,
						insuranceID: item.insuranceID,
						numericID: parseInt(item.insuranceID.substring(1)),
					};
				});

				orderedIds.sort((a, b) => b.numericID - a.numericID);

				this.setState({
					carInsurances: orderedIds.map(item => {
						delete item.numericID;
						return item;
					}),
					loading: false,
				});
			});
	};

	onAddContact = () => {
		this.setState({
			addContactState: true,
		});
	};

	onContactClose = () => {
		this.setState({
			addContactState: false,
		});
	};

	onDeleteContact = id => {
		const parent = this;
		Modal.confirm({
			title: "Are you sure you want to void this insurance?",
			content: "There is no going back after this",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				if (parent.props.type === "car") {
					parent.props.onDeleteCarInsurance(id);
				}
				if (parent.props.type === "truck") {
					parent.props.onDeleteTruckInsurance(id);
				}
			},
		});
	};

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={node => {
						this.searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
					style={{ width: 188, marginBottom: 8, display: "block" }}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{ width: 90, marginRight: 8 }}>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => <Icon type="search" style={{ color: filtered ? "#1890ff" : undefined }} />,
		onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
		render: text => {
			if (!text) {
				return null;
			}
			return (
				<Highlighter
					highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
					searchWords={[this.state.searchText]}
					autoEscape
					textToHighlight={text.toString()}
				/>
			);
		},
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({ searchText: selectedKeys[0] });
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({ searchText: "" });
	};

	refresh = async id => {
		await firestore.doc(this.props.type + "-insurance/" + id).update({
			refresh: moment().toDate(),
		});
		return Modal.success({ title: "Success!", content: "The insurance has been regenerated" });
	};

	email = id => {
		return Swal.fire({
			title: "Send PDF",
			text: "Would you like to email the PDF?",
			showCancelButton: true,
			confirmButtonText: "Email",
			showLoaderOnConfirm: true,
			reverseButtons: true,
			preConfirm: () => {
				return axios("https://us-central1-fast-in-transit.cloudfunctions.net/emailPDF?id=" + id + "&type=" + this.props.type);
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then(result => {
			if (result.value) {
				return Swal.fire("Success", "The file has been sent to the client", "success");
			}
		});
	};

	emailRequest = id => {
		return Swal.fire({
			title: "Send Signature Request",
			text: "Would you like to email the request?",
			showCancelButton: true,
			confirmButtonText: "Email",
			showLoaderOnConfirm: true,
			reverseButtons: true,
			preConfirm: () => {
				return axios("https://us-central1-fast-in-transit.cloudfunctions.net/emailRequest?id=" + id + "&type=" + this.props.type);
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then(result => {
			if (result.value) {
				return Swal.fire("Success", "The request has been sent to the client", "success");
			}
		});
	};

	fax = id => {
		return Swal.fire({
			title: "Fax PDF",
			html: "Where would you like to fax the PDF? <br/> (10 Digits only Eg. 9561231234)",
			showCancelButton: true,
			confirmButtonText: "Send",
			showLoaderOnConfirm: true,
			reverseButtons: true,
			input: "number",
			preConfirm: phone => {
				return axios("https://us-central1-fast-in-transit.cloudfunctions.net/faxPDF?id=" + id + "&type=" + this.props.type + "&phone=" + phone);
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then(result => {
			if (result.value) {
				return Swal.fire("Success", "The file has been sent to the client", "success");
			}
		});
	};

	sms = id => {
		return Swal.fire({
			title: "Sms JPG",
			html: "Where would you like to send the JPG? <br/> (Country code + Phone. No spaces or hyphens)<br/> +1 USA, +52 Mexico, +502 Guatemala",
			showCancelButton: true,
			confirmButtonText: "Send",
			showLoaderOnConfirm: true,
			reverseButtons: true,
			input: "text",
			preConfirm: phone => {
				return axios("https://us-central1-fast-in-transit.cloudfunctions.net/smsJPG?id=" + id + "&type=" + this.props.type + "&phone=" + phone);
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then(result => {
			if (result.value) {
				return Swal.fire("Success", "The file has been sent to the client", "success");
			}
		});
	};

	smsRequest = id => {
		return Swal.fire({
			title: "Sms JPG",
			html: "Where would you like to send the request? <br/> (Country code + Phone. No spaces or hyphens)<br/> +1 USA, +52 Mexico, +502 Guatemala",
			showCancelButton: true,
			confirmButtonText: "Send",
			showLoaderOnConfirm: true,
			reverseButtons: true,
			input: "text",
			preConfirm: phone => {
				return axios("https://us-central1-fast-in-transit.cloudfunctions.net/smsRequest?id=" + id + "&type=" + this.props.type + "&phone=" + phone);
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then(result => {
			if (result.value) {
				return Swal.fire("Success", "The request has been sent to the client", "success");
			}
		});
	};

	download = record => {
		const policy = `https://firebasestorage.googleapis.com/v0/b/fast-in-transit.appspot.com/o/insurances%2F${record.insuranceID}.pdf?alt=media`;
		Modal.success({
			title: "Download Files",
			content: (
				<div>
					<a style={{ display: "block" }} rel="noopener noreferrer" target={"_blank"} href={policy}>
						Policy
					</a>
					{record.agreement && (
						<a style={{ display: "block" }} rel="noopener noreferrer" target={"_blank"} href={record.agreement}>
							Agreement
						</a>
					)}
					{record.image && (
						<a style={{ display: "block" }} rel="noopener noreferrer" target={"_blank"} href={record.image}>
							Title First Vehicle
						</a>
					)}
					{record.imageExtra && (
						<a style={{ display: "block" }} rel="noopener noreferrer" target={"_blank"} href={record.imageExtra}>
							Title Second Vehicle
						</a>
					)}
				</div>
			),
		});
	};

	render() {
		const columns = [
			{
				...this.getColumnSearchProps("insuranceID"),
				title: "Insurance ID",
				dataIndex: "insuranceID",
				key: "insuranceID",
				width: 180,
				sorter: (a, b) => {
					// Primero ordena por timestamp, luego por numericID si los timestamps son iguales
					const timeDiff = a.timestamp.seconds - b.timestamp.seconds;
					if (timeDiff === 0) {
						return parseInt(a.insuranceID.substring(a.insuranceID.length - 5)) - parseInt(b.insuranceID.substring(b.insuranceID.length - 5));
					}
					return timeDiff;
				},
				sortDirections: ["descend", "ascend"],
			},
			{
				key: "status",
				title: "Status",
				dataIndex: "status",
				width: 130,
				filters: [
					{
						text: "Active",
						value: "Active",
					},
					{
						text: "Pending",
						value: "Pending",
					},
					{
						text: "Expired",
						value: "Expired",
					},
					{
						text: "Void",
						value: "Void",
					},
				],
				onFilter: (value, record) => record.status === value,
			},
			{
				title: "Source",
				dataIndex: "source",
				key: "source",
				render: text => (text ? text : "Software"),
				width: 120,
			},
			{
				title: "Agent",
				dataIndex: "agentName",
				key: "agentName",
				sorter: (a, b) => a.agentName.localeCompare(b.agentName),
				width: 120,
			},
			{
				...this.getColumnSearchProps("clientName"),
				title: "Client",
				dataIndex: "clientName",
				key: "clientName",
				onFilter: (value, record) => record.clientName.indexOf(value) === 0,
				sorter: (a, b) => a.clientName.length - b.clientName.length,
			},
			{
				...this.getColumnSearchProps("coverageName"),
				title: "Coverage",
				dataIndex: "coverageName",
				key: "coverageName",
				onFilter: (value, record) => record.coverageName.indexOf(value) === 0,
				sorter: (a, b) => a.coverageName.length - b.coverageName.length,
			},
			{
				title: "Total",
				dataIndex: "total",
				key: "total",
				sorter: (a, b) => a.total - b.total,
				render: text => "$" + text + " dlls",
				width: 120,
			},
			{
				title: "Date",
				dataIndex: "timestamp",
				key: "timestamp",
				sorter: (a, b) => a.timestamp.seconds - b.timestamp.seconds,
				render: text => moment(text.seconds, "X").utcOffset(-300).format("lll"),
				defaultSortOrder: "descend",
				width: 220,
			},
			{
				title: "Action",
				width: 250,
				dataIndex: "",
				key: "x",
				render: record => {
					if (record.insuranceID === "-") {
						return null;
					}
					if (record.status === "Pending") {
						return (
							<div className={"actions"}>
								<i className={"fas fa-envelope"} onClick={() => this.emailRequest(record.id)} />
								<i className={"fas fa-sms"} onClick={() => this.smsRequest(record.id)} />
							</div>
						);
					}
					return (
						<div className={"actions"}>
							<a
								target={"_blank"}
								rel="noopener noreferrer"
								href={`https://firebasestorage.googleapis.com/v0/b/fast-in-transit.appspot.com/o/insurances%2F${record.insuranceID}.pdf?alt=media`}>
								<i className={"fas fa-eye"} style={{ color: "#555" }} />
							</a>
							<Can I={"edit"} a={"insurances"}>
								<i className={"fas fa-pencil"} onClick={() => this.setState({ edit: record.id })} />
							</Can>
							<i className={"fas fa-sync"} onClick={() => this.refresh(record.id)} />
							<i className={"fas fa-envelope"} onClick={() => this.email(record.id)} />
							<i className={"fas fa-sms"} onClick={() => this.sms(record.id)} />
							<i className={"fas fa-fax"} onClick={() => this.fax(record.id)} />
							<i className={"fas fa-download"} onClick={() => this.download(record)} />
							{record.agreement ? <i className={"fas fa-file-contract"} onClick={() => window.location.assign(record.agreement)} /> : null}
							{record.void ? null : (
								<Can I={"void"} a={"insurances"}>
									<i className={"fas fa-ban"} onClick={() => this.onDeleteContact(record.id)} />
								</Can>
							)}
						</div>
					);
				},
			},
		];
		return (
			<Card>
				<Row>
					<Col span={12}>
						<div style={{ width: 100 }} />
						<Typography.Title level={2}>{this.props.type.charAt(0).toUpperCase() + this.props.type.substring(1)} Insurance</Typography.Title>
					</Col>
					<Col span={4} push={8}>
						<Can I={"add"} a={"insurances"}>
							<Button type="primary" block={true} onClick={this.onAddContact}>
								Add Insurance
							</Button>
						</Can>
					</Col>
				</Row>
				<Table
					pagination={{ pageSize: 30 }}
					className="gx-table-responsive"
					columns={columns}
					rowKey={"id"}
					dataSource={this.state[this.props.type + "Insurances"]}
				/>
				<Edit id={this.state.edit} type={this.props.type} onClose={() => this.setState({ edit: false })} />
				<Elements stripe={stripe}>
					<ElementsConsumer>
						{({ stripe, elements }) => {
							if (this.state.addContactState && stripe && elements) {
								return (
									<Add
										configuration={this.state.configuration}
										stripe={stripe}
										elements={elements}
										type={this.props.type}
										open={true}
										onContactClose={this.onContactClose}
									/>
								);
							} else {
								return null;
							}
						}}
					</ElementsConsumer>
				</Elements>
			</Card>
		);
	}
}

const mapStateToProps = ({ auth }) => {
	return {
		auth,
	};
};
export default connect(mapStateToProps, {
	onAddCarInsurance,
	onDeleteCarInsurance,
	onUpdateCarInsurance,

	onAddTruckInsurance,
	onDeleteTruckInsurance,
	onUpdateTruckInsurance,

	onGetAllClient,
	onGetAllAgents,
	onGetAllCoverages,
})(FirebaseCRUD);
