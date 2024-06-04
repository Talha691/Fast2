import React from "react";
import {Typography} from "antd";

function ConfirmVin(props) {
	const {vin} = props;
	return (
		<React.Fragment>
			<Typography.Text>Please double check everything.</Typography.Text> <br/>
			<Typography.Text>Once payment completes you will not be able to edit this policy</Typography.Text> <br/><br/>
			<Typography.Text strong>Last 6 Digits of Vin:</Typography.Text> <br/>
			<Typography.Title level={4}>{vin.substring(vin.length - 6)}</Typography.Title>
		</React.Fragment>
	);
}

export default ConfirmVin;