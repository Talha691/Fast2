import React from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Col, Typography } from "antd";

function StripePaymentProcessor({ onStripeReady }) {
    const stripe = useStripe();
    const elements = useElements();

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

    // Llamar a la función del padre con stripe y elements cuando estén listos
    React.useEffect(() => {
        if (stripe && elements) {
            onStripeReady(stripe, elements);
        }
    }, [stripe, elements, onStripeReady]);

    return (
        <Col span={24}>
			<Typography.Title level={4}>Credit Card*</Typography.Title>
				<div style={{
					border: "1px #DDD solid",
					padding: 8,
					paddingTop: 0,
					borderRadius: 5,
				}}>
					<CardElement onChange={(e)=>{console.log(e)}} options={CARD_ELEMENT_OPTIONS}/>
				</div>
		</Col>
    );
}

export default StripePaymentProcessor;