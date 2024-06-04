import React from "react";
import {Button, Input,  Modal, Row, Col, notification} from "antd";

import {firestore} from "../../../firebase/firebase";
import CategoriesList from "./categories-list";


class Categories extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: "",
			timestamp: new Date(),
		}
	}

	saveCategoryName = () => {
		const { name, timestamp } = this.state;
		return firestore.collection("expense-categories").add({ name, timestamp })
			.then(() => {
				notification.success({
					message: "Success!",
					description: "Category created successfully"
				});
				return this.setState({ name: "" });
			});
	};

	render() {
		const { onModalClose, open } = this.props;
		const { name } = this.state;
		return (
			<Modal
				toggle={onModalClose} visible={open}
				closable={false}
				onCancel={onModalClose}
				>
				<Row gutter={10}>
					<Col span={18}>
						<div className="gx-form-group">
							<Input
								placeholder="Category Name"
								onChange={(event) => this.setState({name: event.target.value})}
								value={this.state.name}
								margin="normal"/>
						</div>
					</Col>
					<Col span={6}>
						<div className="gx-form-group">
							<Button onClick={() => {
								if (name === "")
									return;
								this.saveCategoryName();
								onModalClose();
							}} htmlType="button" type="primary">Add Category</Button>
						</div>
					</Col>
				</Row>
				<Row gutter={10}>
					<Col span={24}>
						<div className="gx-form-group">
							<CategoriesList />
						</div>
					</Col>
				</Row>
			</Modal>
		);
	}
}

export default Categories;
