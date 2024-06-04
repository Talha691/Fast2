import React, { Component } from "react"
import {Table, Modal, notification} from "antd";
import {firestore} from "../../../firebase/firebase";
import async from "async";

function onChange(pagination, filters, sorter, extra) {

}

class CategoriesList extends Component {
	constructor() {
		super();

		this.state = {
			allCategories: [],
		}
	}

	componentDidMount() {
		this.fetchExpenseCategories();
	}

	fetchExpenseCategories = () => {
		firestore.collection("expense-categories").onSnapshot(category => {
			const allCategories = [];
			return async.eachOfSeries(category.docs, (category, key, callback) => {
				allCategories.push({
					key: category.id,
					categoryName: category.data().name
				});
				callback();
			}, () => this.setState({ allCategories }));
		})
	};

	deleteExpenseItem = (key) => {
		Modal.confirm({
			title: "Are you sure you want to delete this item?",
			okText: "Yes",
			okType: "danger",
			cancelText: "No",
			onOk() {
				return firestore.doc("expense-categories/" + key).delete().then(() => {
					notification.success({ message: "Success", description: "Deleted item successfully!" })
				})
			},
			onCancel() {
				return null;
			}
		})
	};
	render() {
		const columns = [
			{
				title: "Name",
				dataIndex: "categoryName",
				width: 300,
				filters: [],
				// specify the condition of filtering result
				// here is that finding the name started with `value`
				onFilter: (value, record) => record.name.indexOf(value) === 0,
				sorter: (a, b) => a.name.length - b.name.length,
				sortDirections: ["descend"],
			},
			{
				title: "Action",
				dataIndex: "key",
				key: "key",
				width: 10,
				render: (key) => (
					<i className="fas fa-trash" onClick={() => this.deleteExpenseItem(key)} />
				),
			},
		];
		return (
			<Table columns={columns} dataSource={this.state.allCategories} onChange={onChange} />
		)
	}
}


export default CategoriesList;
