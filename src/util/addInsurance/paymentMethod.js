import React from "react";
import {Typography} from "antd";
import {CardElement} from "@stripe/react-stripe-js";
import {PayPalButton} from "react-paypal-button-v2";
import { HostedForm } from "react-acceptjs";
const CARD_ELEMENT_OPTIONS = {
	style: {
		base: {
			color: "#545454",
			fontFamily: "NoirPro, sans-serif",
			fontSize: "14px",
			"::placeholder": {
				color: "#54545488",
			},
		},
		invalid: {
			color: "#F00",
			iconColor: "#F00",
		},
	},
};

const authData = {
    apiLoginID: "4xwnCbQ7A9Zd",
    clientKey:
      "6jC2tFDDHDbPavmW7U9D36TkvnSGyVD9d72t999nxV5cCC68WFpzKq6d8kCS899c",
  };
  const handleAuthorizeSubmit = async (token, updateState) => {
   console.log(token)
   updateState({ token_payment_data: token });

  };
function PaymentMethod(props) {
	if (props.props.configuration === "credit" || props.props.auth.credit) {
		return <div/>;
	}

	if (props.props.configuration === "stripe") {
		return (
			<>
				<Typography.Title level={4}>Credit Card*</Typography.Title>
				<div style={{
					border: "1px #DDD solid",
					padding: 8,
					paddingTop: 0,
					borderRadius: 5,
				}}>
					<HostedForm
                          buttonText="Pay with AuthorizeNet"
                          authData={authData}
                          onSubmit={(token) => handleAuthorizeSubmit(token, props.autorizeCompleted)}
                          billingAddressOptions={{
                            required: false,
                            show: false,
                          }}
                          environment="SANDBOX"
                        />
				</div>
			</>
		);
	}

	if (props.props.configuration === "paypal") {
		return (
			<>
				<Typography.Title level={4}>Payment*</Typography.Title>
				{
					props.state.total ? <PayPalButton
						amount={props.state.total}
						onSuccess={props.paypalCompleted}
						options={{
							clientId: "Ae-aWZ-O9-eGV1WaJf-1jfwcEfolOUDLMhkfNNMG1uP41uATMDVQNoLxqIFNxr97SDYB6UxRnTUZDbfZ",
						}}
					/> : "Fill out everything to continue"
				}

			</>
		);
	}

	return <div/>;
}

export default PaymentMethod;