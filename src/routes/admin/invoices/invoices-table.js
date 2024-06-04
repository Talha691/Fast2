import React, { Component } from "react";
import { Table, Typography } from "antd";
import async from "async";
import moment from "moment";
import { firestore } from "../../../firebase/firebase";

import Widget from "../../../components/Widget";
import Swal from "sweetalert2";
import axios from "axios";

class InvoicesTable extends Component {
	constructor() {
		super();

		this.state = {
			data: [],
			loading: true,
		};
	}

	componentDidMount() {
		return firestore
			.collection("invoices")
			.orderBy("date", "desc")

			.get()

			.then(invoice => {
				const allInvoices = [];
				return async.eachOfSeries(
					invoice.docs,
					(invoice, key, callback) => {
						allInvoices.push({
							key: invoice.id,
							date: moment(invoice.data().date.toDate()).format("ll"),
							invoiceID: invoice.data().invoiceID,
							name: invoice.data().name,
							insuranceId: invoice.data().insuranceID,
							total: invoice.data().total,
							invoiceUrl: invoice.data().pdf,
							pngUrl: invoice.data().png,
						});
						callback();
					},
					() => this.setState({ data: allInvoices, loading: false })
				);
			});
	}

	email = id => {
		return Swal.fire({
			title: "Send PDF",
			text: "Would you like to email the PDF?",
			showCancelButton: true,
			confirmButtonText: "Email",
			showLoaderOnConfirm: true,
			reverseButtons: true,
			preConfirm: () => {
				return axios("https://us-central1-fast-in-transit.cloudfunctions.net/emailInvoice?id=" + id + "&type=" + this.props.type);
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then(result => {
			if (result.value) {
				return Swal.fire("Success", "The file has been sent to the client", "success");
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
				return axios(
					"https://us-central1-fast-in-transit.cloudfunctions.net/faxInvoice?id=" + id + "&type=" + this.props.type + "&phone=" + phone
				);
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
			html: "Where would you like to send the JPG? <br/> (10 Digits only Eg. 9561231234)",
			showCancelButton: true,
			confirmButtonText: "Send",
			showLoaderOnConfirm: true,
			reverseButtons: true,
			input: "number",
			preConfirm: phone => {
				return axios("https://us-central1-fast-in-transit.cloudfunctions.net/smsInvoice?invoiceID=" + id + "&phone=" + phone);
			},
			allowOutsideClick: () => !Swal.isLoading(),
		}).then(result => {
			if (result.value) {
				return Swal.fire("Success", "The file has been sent to the client", "success");
			}
		});
	};

	render() {
		const { data } = this.state;
		const columns = [
			{
				title: "Date",
				dataIndex: "date",
				key: "date",
				sorter: (a, b) => a.date.length - b.date.length,
				sortDirections: ["descend", "ascend"],
			},
			{
				title: "Invoice ID",
				dataIndex: "invoiceID",
				key: "invoiceID",
				sorter: (a, b) => a.invoiceID.localeCompare(b.invoiceID),
				sortDirections: ["descend", "ascend"],
			},
			{
				title: "Name",
				dataIndex: "name",
				key: "name",
				sorter: (a, b) => a.name.localeCompare(b.name),
				sortDirections: ["descend", "ascend"],
			},
			{
				title: "Insurance ID",
				dataIndex: "insuranceId",
				key: "insuranceId",
			},
			{
				title: "Total",
				dataIndex: "total",
				key: "total",
				sorter: (a, b) => a.total - b.total,
				sortDirections: ["descend", "ascend"],
				render: total => <p>${total}</p>,
			},
			{
				title: "Action",
				dataIndex: "invoiceUrl",
				render: (record, invoice) => (
					<div className="actions">
						<i className={"fas fa-envelope"} onClick={() => this.email(invoice.invoiceID)} />
						<i className={"fas fa-sms"} onClick={() => this.sms(invoice.invoiceID)} />
						<i className={"fas fa-fax"} onClick={() => this.fax(invoice.invoiceID)} />
						<i className="fas fa-download" onClick={() => window.location.assign(record)} />
					</div>
				),
			},
		];
		return (
			<Widget styleName="gx-order-history">
				<Typography.Title level={2}>Invoices</Typography.Title>
				<div className="gx-table-responsive">
					<Table dataSource={data} columns={columns} pagination={{ pageSize: 50 }} loading={this.state.loading} />
				</div>
			</Widget>
		);
	}
}

export default InvoicesTable;
