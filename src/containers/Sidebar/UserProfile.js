import React, {Component} from "react";
import {connect} from "react-redux";
import {Avatar, Popover} from "antd";
import {userSignOut} from "../../appRedux/actions";
import { Col, Row } from "antd-new";

class UserProfile extends Component {
	render() {
		const userMenuOptions = (
			<ul className="gx-user-popover">
				{/*<li>My Account</li>*/}
				{/*<li>Connections</li>*/}
				<li onClick={() => this.props.userSignOut()}>Logout</li>
			</ul>
		);

		return (
			<div className="gx-flex-row gx-align-items-center gx-mb-4 gx-avatar-row">
				<Popover placement="bottomRight" content={userMenuOptions} trigger="click">
					<div className="gx-flex-row">
						<div className="gx-mr-2 gx-flex-column gx-justify-content-around gx-align-items-end">
							<p className="gx-delete-margin-p"> <span className="gx-text-bold gx-text-profile-name">{this.props.auth.displayName}</span> </p>
							<p className="gx-delete-margin-p">{this.props.auth.type}</p>
						</div>
						<div className="gx-p-1 gx-bg-gray gx-flex-row gx-justify-content-center gx-rounded-lg">
							<Avatar src={this.props.auth.photoURL} className="gx-size-40 gx-pointer" alt=""/>
						</div>
					</div>
				</Popover>
			</div>
		)
	}
}

const mapStateToProps = (e) => {
	return {
		auth: e.auth,
	};
};

export default connect(mapStateToProps, {userSignOut})(UserProfile);
