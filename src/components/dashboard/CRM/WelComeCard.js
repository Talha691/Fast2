import React from "react";
import {connect} from "react-redux";

const WelComeCard = (props) => {
	return (
		<div className="gx-wel-ema gx-pt-xl-2">
			<h1 className="gx-mb-3">Welcome {props.auth.displayName}!</h1>
		</div>

	);
};

const mapStateToProps = (state) => {
	return {
		auth: state.auth,
	}
};

export default connect(
	mapStateToProps,
)(WelComeCard)
