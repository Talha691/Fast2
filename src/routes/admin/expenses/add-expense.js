import React from "react";
import async from "async";
import { firestore } from "../../../firebase/firebase";
import { Input, DatePicker, Modal, Row, Col, Select, notification } from "antd";

import moment from "moment";

const { Option } = Select;

class AddExpense extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			date: "",
			name: "",
			amount: null,
			tax: null,
			total: null,
			sum: null,
			reference: "",
			notes: "",
			timestamp: new Date(),
			allCategories: [],
			category: null,
			account: "",
		};
	}

	componentDidMount() {
		this.load(this.props.id);
	}

	componentWillReceiveProps(nextProps, nextContext) {
		this.load(nextProps.id);
	}

	load = id => {
		if (id) {
			firestore
				.doc("expenses/" + id)
				.get()
				.then(expense => {
					return this.setState({
						expenseId: id,
						date: moment(expense.data().date.toDate()),
						category: expense.data().category,
						tax: expense.data().tax,
						amount: expense.data().amount.toString(),
						total: expense.data().total,
						reference: expense.data().reference,
						notes: expense.data().notes,
						account: expense.data().account ? expense.data().account : "",
					});
				});
		} else {
			this.setState({
				expenseId: "",
				date: null,
				category: null,
				tax: null,
				amount: null,
				total: "",
				reference: null,
				notes: "",
			});
		}

		firestore
			.collection("expense-categories")
			.get()
			.then(category => {
				const allCategories = [];
				return async.eachOfSeries(
					category.docs,
					(category, key, callback) => {
						allCategories.push({
							key: category.id,
							cateName: category.data().name,
						});
						callback();
					},
					() => this.setState({ allCategories })
				);
			});
	};

	onChange = date => {
		this.setState({ date: moment(date) });
	};

	saveExpense = () => {
		const { date, category, amount, tax, total, reference, notes, timestamp, account } = this.state;

		if (!date || !category || !amount || !total || !reference) {
		
			return null;
		}

		if (this.props.id) {
			firestore
				.doc("expenses/" + this.props.id)
				.update({
					date: date.toDate(),
					category,
					amount,
					tax,
					total,
					reference,
					notes,
					account,
				})
				.then(() => notification.success({ message: "Success!", description: "Expense updated successfully!" }));
			return this.props.onModalClose();
		} else {
			firestore
				.collection("expenses")
				.add({
					date: date.toDate(),
					category,
					amount,
					tax,
					total,
					reference,
					notes,
					timestamp,
					account,
				})
				.then(() => {
					notification.success({ message: "Success!", description: "Expense saved successfully!" });
					this.setState(
						{
							date: "",
							name: "",
							amount: null,
							category: null,
							tax: null,
							total: null,
							reference: "",
							notes: "",
							account: "",
						},
						() => this.props.onModalClose()
					);
				});
		}
	};

	handleCategoryChange = category => {
		if (!("value" in this.props)) {
			this.setState({ category });
		}
		this.triggerChange({ category });
	};

	handleAccountChange = account => {
		if (!("value" in this.props)) {
			this.setState({ account });
		}
		this.triggerChange({ account });
	};

	handleAmountChange = async e => {
		await this.setState({ amount: e.target.value });

		const { amount, tax } = this.state;
		const sum = +tax * +amount;
		await this.setState({ sum: sum, total: +amount + +sum });
	};

	handleTaxChange = async tax => {
		const { amount } = this.state;
		const sum = +tax * +amount;
		await this.setState({ tax: tax, sum: sum, total: +amount + +sum });
	};

	triggerChange = changedValue => {
		const { onChange } = this.props;
		if (onChange) {
			onChange({
				...this.state,
				...changedValue,
			});
		}
	};

	render() {
		const { onModalClose, open } = this.props;
		const { amount, total, reference, notes, allCategories } = this.state;
		return (
			<Modal
				width={50}
				title={this.props.id ? "Update Expense" : "Add Expense"}
				toggle={onModalClose}
				visible={open}
				closable={false}
				onCancel={() => {
					this.setState(
						{
							date: "",
							name: "",
							amount: null,
							category: null,
							tax: null,
							total: null,
							reference: "",
							notes: "",
							account: "",
						},
						() => onModalClose()
					);
				}}
				onOk={() => {
					this.saveExpense();
				}}>
				<Row gutter={10}>
					<Col span={8}>
						<div className="gx-form-group">
							<DatePicker format={"ll"} style={{ width: "100%" }} value={this.state.date} onChange={this.onChange} />
						</div>
					</Col>
					<Col span={8}>
						<div className="gx-form-group">
							<Select value={this.state.category} style={{ width: "100%" }} onChange={this.handleCategoryChange}>
								<Option value={null} disabled>
									Category
								</Option>
								{allCategories.map(category => (
									<Option key={category.key} value={category.cateName}>
										{category.cateName}
									</Option>
								))}
							</Select>
						</div>
					</Col>
					<Col span={8}>
						<div className="gx-form-group">
							<Select value={this.state.account} style={{ width: "100%" }} onChange={this.handleAccountChange}>
								<Option value="" disabled>
									Account
								</Option>
								<Option value="Main 7901">Main 7901</Option>
								<Option value="Expense 0002">Expense 0002</Option>
								<Option value="Savings 9701">Savings 9701</Option>
							</Select>
						</div>
					</Col>
				</Row>
				<Row gutter={10}>
					<Col span={8}>
						<div className="gx-form-group">
							<Input placeholder="Amount" type="number" step="any" onChange={this.handleAmountChange} value={amount} margin="normal" />
						</div>
					</Col>
					<Col span={8}>
						<div className="gx-form-group">
							<Select value={this.state.tax} style={{ width: "100%" }} onChange={this.handleTaxChange}>
								<Option value={null}>No Tax</Option>
								<Option value={0.085}>8.25%</Option>
							</Select>
						</div>
					</Col>
					<Col span={8}>
						<div className="gx-form-group">
							<Input disabled placeholder="Total" type="number" step="any" onChange={this.handleAmountChange} value={total} margin="normal" />
						</div>
					</Col>
					<Col span={24}>
						<div className="gx-form-group">
							<Input
								placeholder="Reference"
								onChange={event => this.setState({ reference: event.target.value })}
								value={reference}
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
								value={notes}
								margin="normal"
							/>
						</div>
					</Col>
				</Row>
			</Modal>
		);
	}
}

export default AddExpense;
