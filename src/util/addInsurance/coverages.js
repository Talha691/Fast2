import React from "react";
import async from "async";
import { Col, Row, Select } from "antd";
import { connect } from "react-redux";

function Coverages(props) {
	return (
		<>
			<Row gutter={10}>
				<Col span={24}>
					<div className="gx-form-group">
						<Select
							placeholder="Coverage*"
							style={{ width: "100%" }}
							required={true}
							onChange={value => {
								props.onChange(
									{
										days: null,
										to: null,
										from: null,
										dateRange: null,
										coverage: value,
										coverageDays: props.coverages.find(x => x.id === value).days,
										coveragePrice: props.coverages.find(x => x.id === value).price,
										coverageProfit: props.coverages.find(x => x.id === value).profit,
										coverageName: props.coverages.find(x => x.id === value).name,
										coverageNotes: props.coverages.find(x => x.id === value).notes,
										extra: props.coverages.find(x => x.id === value).vehicles === 2,
										sr22: props.coverages.find(x => x.id === value).sr22,
										pipe: props.coverages.find(x => x.id === value).pipe,
									},
									() => {
										if (props.state.days) {
											props.onChange({
												total: props.state.partial_payment_sw? props.state.days * props.state.coverageProfit: props.state.days * props.state.coveragePrice,
											});
										}
									}
								);
							}}
							value={props.state.coverage ? props.state.coverage : undefined}>
							{props.state.coverages.map(coverage => (
								<Select.Option
									key={coverage.id}
									disabled={!props.auth.type.endsWith("Admin") && (coverage.sr22 || coverage.pipe)}
									value={coverage.id}>
									{coverage.name}
								</Select.Option>
							))}
						</Select>
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
			profit: element.profit,
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
	};
};

export default connect(mapStateToProps)(Coverages);
