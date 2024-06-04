import React, {Component} from "react";
import {Button, Card, Row, Col, Typography, Input} from "antd";
// import { Icon } from 'antd-icons';
import Highlighter from "react-highlight-words";
import {Elements} from "react-stripe-elements";

import AddExpense from "./add-expense";
import ExpenseList from "./expense-list";
import Categories from "./categories";
import {firestore} from "../../../firebase/firebase";
import async from "async";
import Can from "../../../roles/Can";

class FirebaseCRUD extends Component {
	constructor(props) {
		super(props);
		this.state = {
			addExpenseModalState: false,
			expenseCategoryModalState: false,
			editExpenseState: false,
			expense: null,
			client: null,
			allExpenses: [],
			allCategories: [],
			categoryId: ""
		}
	}

	componentDidMount() {
		this.fetchExpenses();
	}

	fetchExpenses = () => {
		firestore.collection("expenses").onSnapshot(expense => {
			const allExpenses = [];
			return async.eachOfSeries(expense.docs, (expense, key, callback) => {
				allExpenses.push({
					category: expense.data().category,
					amount: expense.data().amount,
					tax: expense.data().tax,
					total: expense.data().total,
					reference: expense.data().reference,
					notes: expense.data().notes,
				});
				callback();
			}, () => this.setState({ allExpenses }));
		})
	};

	onOpenAddExpenseModal = () => {
		this.setState({
			addExpenseModalState: true,
		})
	};

	onOpenExpenseCategoryModal = () => {
		this.setState({
			expenseCategoryModalState: true
		})
	};

	onModalClose = () => {
		this.setState({
			addExpenseModalState: false,
			expenseCategoryModalState: false,
			editExpenseState: false,
			expense: null,
		});
	};

	getColumnSearchProps = dataIndex => ({
		filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
			<div style={{padding: 8}}>
				<Input ref={node => {
					this.searchInput = node
				}}
					   placeholder={`Search ${dataIndex}`}
					   value={selectedKeys[0]}
					   onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					   onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
					   style={{width: 188, marginBottom: 8, display: "block"}}
				/>
				<Button
					type="primary"
					onClick={() => this.handleSearch(selectedKeys, confirm)}
					icon="search"
					size="small"
					style={{width: 90, marginRight: 8}}
				>
					Search
				</Button>
				<Button onClick={() => this.handleReset(clearFilters)} size="small" style={{width: 90}}>
					Reset
				</Button>
			</div>
		),
		filterIcon: filtered => (
			<Icon type="search" style={{color: filtered ? "#1890ff" : undefined}}/>
		),
		onFilter: (value, record) =>
			record[dataIndex]
				.toString()
				.toLowerCase()
				.includes(value.toLowerCase()),
		onFilterDropdownVisibleChange: visible => {
			if (visible) {
				setTimeout(() => this.searchInput.select());
			}
		},
		render: text => (
			<Highlighter
				highlightStyle={{backgroundColor: "#ffc069", padding: 0}}
				searchWords={[this.state.searchText]}
				autoEscape
				textToHighlight={text ? text.toString() : ""}
			/>
		),
	});

	handleSearch = (selectedKeys, confirm) => {
		confirm();
		this.setState({searchText: selectedKeys[0]});
	};

	handleReset = clearFilters => {
		clearFilters();
		this.setState({searchText: ""});
	};

	render() {
		const { addExpenseModalState, expenseCategoryModalState, editExpenseState } = this.state;
		return (
			<Card>
				<Row>
					<Col span={16}>
						<div style={{width: 100}}/>
						<Typography.Title level={2}>
							Expenses
						</Typography.Title>
					</Col>
					<Col span={4} >
						<Can I={"add"} a={"expenses"}>
							<Button type="default" block={true} onClick={this.onOpenExpenseCategoryModal}>
								Categories
							</Button>
						</Can>
					</Col>
					<Col span={4}>
						<Can I={"add"} a={"expenses"}>
							<Button type="primary" block={true} onClick={this.onOpenAddExpenseModal}>
								Add Expense
							</Button>
						</Can>
					</Col>
				</Row>
				<Categories id={this.state.categoryId} open={ expenseCategoryModalState } categories={ this.state.allCategories } onModalClose={ this.onModalClose }/>
				<AddExpense open={ addExpenseModalState } id={this.state.expense} onModalClose={ this.onModalClose }/>
				<Elements>
					<ExpenseList onEdit={async key => {
						await this.setState({expense: key});
						await this.setState({addExpenseModalState: true})
					}} open={ editExpenseState } data={this.state.expenses} />
				</Elements>
			</Card>
		)
	}
}

export default FirebaseCRUD;
