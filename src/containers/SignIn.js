import React from "react";
import { Button, Form, Input, message } from "antd";
// import { Icon } from 'antd-icons';
import { connect } from "react-redux";
// import {Link} from "react-router-dom";

import { hideMessage, showAuthLoader, userFacebookSignIn, userGithubSignIn, userGoogleSignIn, userSignIn, userTwitterSignIn } from "appRedux/actions/Auth";
import IntlMessages from "util/IntlMessages";
import CircularProgress from "components/CircularProgress/index";

const FormItem = Form.Item;

class SignIn extends React.Component {
	handleSubmit = e => {
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				this.props.showAuthLoader();
				this.props.userSignIn(values);
			}
		});
	};

	componentDidUpdate() {
		if (this.props.showMessage) {
			setTimeout(() => {
				this.props.hideMessage();
			}, 100);
		}
		if (this.props.authUser !== null) {
			this.props.history.push("/");
		}
	}

	render() {
		const { getFieldDecorator } = this.props.form;
		const { showMessage, loader, alertMessage } = this.props;

		return (
			<div className="gx-app-login-main-container">
				<div className="gx-app-login-main-img">
					<img src={require("./../assets/images/bg-login.png")} alt="Aguila" />
				</div>
				<div className="gx-app-login-main-form">
					
					<div className="gx-app-login-main-form-data">
						<div className="gx-app-login-main-form-data-heading">
							<h1>Welcome Back!</h1>
							<p>Sign in into your account below.</p>
						</div>
						<Form onSubmit={this.handleSubmit}>
							<div className="gx-app-login-main-form-data-input">
								<label>Email address</label>
								<FormItem className="gx-FormItem-None">
									{getFieldDecorator("email", {
										initialValue: "",
										rules: [
											{
												required: true,
												type: "email",
												message: "The input is not valid E-mail!",
											},
										],
									})(<Input placeholder="Email" />)}
								</FormItem>
							</div>
							<div className="gx-app-login-main-form-data-input">
								<label>Password</label>
								<FormItem className="gx-FormItem-None">
									{getFieldDecorator("password", {
										initialValue: "",
										rules: [{ required: true, message: "Please input your Password!" }],
									})(<Input type="password" placeholder="Password" />)}
								</FormItem>
							</div>
							<div className="gx-app-login-main-form-data-btn">
								<FormItem className="gx-FormItem-None">
									<Button
										className="gx-mb-0"
										htmlType="submit"
										style={{
											width: "100%",
											borderRadius: 0,
											backgroundColor: "#000",
											borderColor: "#000",
											color: "#fff",
											height: 50,
										}}>
										Log In
									</Button>
								</FormItem>
							</div>
							
						</Form>
						{showMessage ? message.error(alertMessage.toString()) : null}
					</div>
					<div className="gx-app-login-main-footer">
						<p>
							By signing up, you agree to our company's <span>Terms and Conditions</span> and <br /> <span>Privacy Policy</span>
						</p>
					</div>
				</div>
			</div>
		);
	}
}

const WrappedNormalLoginForm = Form.create()(SignIn);

const mapStateToProps = ({ auth }) => {
	const { loader, alertMessage, showMessage, authUser } = auth;
	return { loader, alertMessage, showMessage, authUser };
};

export default connect(mapStateToProps, {
	userSignIn,
	hideMessage,
	showAuthLoader,
	userFacebookSignIn,
	userGoogleSignIn,
	userGithubSignIn,
	userTwitterSignIn,
})(WrappedNormalLoginForm);
