import React, { useEffect, useState } from "react";
import { AutoComplete, Button, Col, Row, Typography } from "antd";
import { connect } from "react-redux";
import async from "async";

function Customers(props) {
	const [clientID, setClientID] = useState("");
	useEffect(() => {
		setClientID(props.state?.client ?? null);
	}, [props]);

	const clients = props.type === "truck" ? props.clients.filter(x => x.type === "Transmigrante") : props.clients;

	if (!clientID && props.route === "drafts") {
		return null;
	}
	return (
		<>
			<Row gutter={10}>
				<Col span={24}>
					<Typography.Title level={4}>Insurance Information</Typography.Title>
					<div className="gx-form-group">
						<AutoComplete disabled={props.state.editing}
							defaultValue={props.state.editing ?? clientID}
							style={{ width: props.state.editing ? "100%" : "94%" }}
							placeholder="Client*"
							dataSource={clients.map(item => {
								return (
									<AutoComplete.Option key={item.id} text={item.name} value={item.id}>
										{item.name}
									</AutoComplete.Option>
								);
							})}
							filterOption={(inputValue, option) => {
								// noinspection JSUnresolvedVariable
								return option.props.text.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
							}}
							onSelect={value => {
								const clientType = props.clients.find(x => x.id === value).type;
								const coveragesForThisTypeOfInsurance =
									props.type === "car" ? props.coverages.filter(x => x.type === "Car") : props.coverages.filter(x => x.type === "Truck");
								const coverages =
									clientType === "Turista"
										? coveragesForThisTypeOfInsurance.filter(x => x.days === 0)
										: coveragesForThisTypeOfInsurance.filter(x => x.days > 0);
								props.onChange({
									card: null,
									cards: [],
									client: value,
									clientName: props.clients.find(x => x.id === value).name,
									customer: props.clients.find(x => x.id === value).stripe,
									coverage: null,
									coverages: coverages,
								});
							}}
						/>
						{
							!props.state.editing && <Button
								style={{ marginTop: 10, marginLeft: 6 }}
								onClick={() => props.onChange({ addClient: true })}
								type={"primary"}
								shape="circle"
								icon={"plus"}
								size={"small"}
							/>
						}
					</div>
				</Col>
			</Row>
		</>
	);
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
		clients: state.clients.contactList,
	};
};

export default connect(mapStateToProps)(Customers);
