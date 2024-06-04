import React from "react";
import { Typography } from "antd";

function Price(props) {
	return (
		<>
			<Typography.Title level={4}>Price</Typography.Title>
			{props.state.coverageDays === 0 && props.state.dateRange && props.state.coverage ? (
				<p style={{ textAlign: "center" }}>
					{props.state.days} Days <br />${props.state.coveragePrice} per day <br />
					<b>${props.state.total}</b> total <br />
				</p>
			) : null}
			{props.state.coverageDays > 0 && props.state.coverage ? (
				<p style={{ textAlign: "center" }}>
					{props.state.coverageDays} Days <br />
					<b>${props.state.partial_payment_sw ? props.state.coverageProfit: props.state.coveragePrice}</b> total <br />
				</p>
			) : null}
		</>
	);
}

export default Price;
