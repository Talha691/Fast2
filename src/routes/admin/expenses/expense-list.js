import React, { Component } from "react";
import { useNavigate } from 'react-router-dom';
import async from "async";
import moment from "moment";
import { notification, Row, Col, Modal, Table, Select, DatePicker, Button } from "antd";
import { firestore } from "../../../firebase/firebase";
import Can from "../../../roles/Can";
import csv from "../../../util/csv";

class ExpenseList extends Component {
	constructor() {
		super();
		this.state = {
			data: [],
			allCategories: [],
			categoryName: "",
			firstDate: "",
			secondDate: "",
			searchExpenses: [],
			exportToExcel: [],
			id: "",
			account: "",
		};
	}

	componentDidMount() {
		this.getExpenses();
		this.getCategories();
	}

	getCategories = () => {
		return firestore.collection("expense-categories").onSnapshot(category => {
			const allCategories = [];
			return async.eachOfSeries(
				category.docs,
				(category, key, callback) => {
					allCategories.push({
						key: category.id,
						name: category.data().name,
					});
					callback();
				},
				() => this.setState({ allCategories })
			);
		});
	};

	getExpenses = () => {
		return firestore
			.collection("expenses")
			.orderBy("timestamp", "desc")
			.onSnapshot(expense => {
				const allExpenses = [];
				return async.eachOfSeries(
					expense.docs,
					(expense, key, callback) => {
						allExpenses.push({
							key: expense.id,
							date: expense.data().date.toDate(),
							category: expense.data().category,
							amount: expense.data().total,
							reference: expense.data().reference,
							account: expense.data().account ? expense.data().account : "",
						});
						callback();
					},
					() =>
						this.setState({ data: allExpenses, searchExpenses: allExpenses, exportToExcel: allExpenses }, () =>
							allExpenses.forEach(i => {
								delete i.key;
							})
						)
				);
			});
	};

	deleteExpenseItem = key => {
		Modal.confirm({
			title: "Are you sure you want to delete this item?",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				return firestore
					.doc("expenses/" + key)
					.delete()
					.then(() => {
						notification.success({ message: "Success", description: "Deleted item successfully!" });
					});
			},
			onCancel() {
				return null;
			},
		});
	};

	search = () => {
		const { data, categoryName, account, firstDate, secondDate } = this.state;
		let searchExpenses = [...data];

		if (categoryName) {
			searchExpenses = searchExpenses.filter(e => e.category === categoryName);
		}
		if (account) {
			searchExpenses = searchExpenses.filter(e => e.account === account);
		}

		if (firstDate) {
			searchExpenses = searchExpenses.filter(e => moment(e.date).isAfter(firstDate));
		}
		if (secondDate) {
			searchExpenses = searchExpenses.filter(e => moment(e.date).isBefore(secondDate));
		}

		this.setState({ searchExpenses, exportToExcel: searchExpenses });
	};

	render() {
		const { searchExpenses } = this.state;
		const { Option } = Select;
		const footer = () => {
			let total = 0;
			searchExpenses.forEach(expense => {
				total += expense.amount;
			});
			return (
				<div style={{ textAlign: "end" }}>
					<p>Total: $ {total.toLocaleString("en-US")}</p>
				</div>
			);
		};
		return (
			<React.Fragment>
				<Row gutter={10} style={{ padding: "10px" }}>
					<Col span={5}>
						<DatePicker style={{ width: "100%" }} format={"ll"} onChange={e => this.setState({ firstDate: e }, () => this.search())} />
					</Col>
					<Col span={5}>
						<DatePicker style={{ width: "100%" }} format={"ll"} onChange={e => this.setState({ secondDate: e }, () => this.search())} />
					</Col>
					<Col span={5}>
						<Select
							value={this.state.categoryName}
							onChange={e => this.setState({ categoryName: e }, () => this.search())}
							style={{ width: "100%" }}>
							<Option value="">All Categories</Option>
							{this.state.allCategories.map(category => (
								<Option value={category.name}>{category.name}</Option>
							))}
						</Select>
					</Col>
					<Col span={5}>
						<div className="gx-form-group">
							<Select value={this.state.account} style={{ width: "100%" }} onChange={e => this.setState({ account: e }, () => this.search())}>
								<Option value="">Account</Option>
								<Option value="Main 7901">Main 7901</Option>
								<Option value="Expense 0002">Expense 0002</Option>
								<Option value="Savings 9701">Savings 9701</Option>
							</Select>
						</div>
					</Col>
					<Col span={4}>
						<div style={{ textAlign: "end" }}>
							<Button type={"link"} onClick={() => csv(this.state.exportToExcel, "FAST IN TRANSIT INSURANCE CRM Expense Report")}>
								Export to Excel
							</Button>
						</div>
					</Col>
				</Row>
				<Table
					footer={footer}
					pagination={{ pageSize: 35 }}
					columns={[
						{
							title: "Date",
							dataIndex: "date",
							key: "date",
							sorter: (a, b) => a.date - b.date,
							render: date => {
								return <p>{moment(date).format("ll")}</p>;
							},
						},
						{
							title: "Category",
							dataIndex: "category",
							sorter: (a, b) => a.category > b.category,
						},
						{
							title: "Amount",
							dataIndex: "amount",
							sorter: (a, b) => a.amount - b.amount,
							render: amount => <p>${amount.toLocaleString("en-US")}</p>,
						},
						{
							title: "Account",
							dataIndex: "account",
							sorter: (a, b) => a.account - b.account,
							render: account => <p>{account ? account : "n/a"}</p>,
						},
						{
							title: "Reference",
							dataIndex: "reference",
							filters: [],
							filterMultiple: false,
							sorter: (a, b) => a.reference > b.reference,
						},
						{
							title: "Action",
							dataIndex: "key",
							key: "key",
							render: key => (
								<div className={"actions"}>
									<Can I={"edit"} a={"expenses"}>
										<i className="fas fa-pencil" onClick={() => this.props.onEdit(key)} />
									</Can>
									<Can I={"delete"} a={"expenses"}>
										<i className="fas fa-trash" onClick={() => this.deleteExpenseItem(key)} />
									</Can>
								</div>
							),
						},
					]}
					dataSource={searchExpenses}
				/>
			</React.Fragment>
		);
	}
}

export default ExpenseList;
