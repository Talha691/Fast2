import React, { PureComponent } from "react";
import { Col, Input, Row, Select } from "antd";
import * as PropTypes from "prop-types";
import axios from "axios";
import File from "./file";

class Vehicle extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			years: [
				2019,
				2018,
				2017,
				2016,
				2015,
				2014,
				2013,
				2012,
				2011,
				2010,
				2009,
				2008,
				2007,
				2006,
				2005,
				2004,
				2003,
				2002,
				2001,
				2000,
				1999,
				1998,
				1997,
				1996,
				1995,
				1994,
				1993,
				1992,
				1991,
				1990,
			],
			makes: [],
			models: [],

			cargo: this.props.cargo,
			year: this.props.year,
			make: this.props.make,
			model: this.props.model,
			plates: this.props.plates,
			vin: this.props.vin,
			image: this.props.image,
		};
	}

	// noinspection JSCheckFunctionSignatures
	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			cargo: nextProps.cargo,
			year: nextProps.year,
			make: nextProps.make,
			model: nextProps.model,
			usage: nextProps.usage,
			state: nextProps.state,
			plates: nextProps.plates,
			vin: nextProps.vin,
			image: nextProps.image,
		});
	}

	_selectedYear = e => {
		this.setState({
			year: e,
			model: null,
			models: [],
			make: null,
		});
		axios.get("https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/" + this.props.type + "?format=json").then(response => {
			let makes = response.data["Results"];
			makes.sort((a, b) => {
				if (a["MakeName"] < b["MakeName"]) {
					return -1;
				}
				if (a["MakeName"] > b["MakeName"]) {
					return 1;
				}
				return 0;
			});
			this.setState({ makes }, () => this._sendCar());
		});
	};

	_selectedMake = e => {
		this.setState({
			make: e,
			model: null,
		});
		axios({
			method: "GET",
			url: `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${e}/modelyear/${this.state.year}/vehicletype/${this.props.type}?format=json`,
			// url: `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${e}/modelyear/${this.state.year}/vehicletype/${this.props.type}?format=json`,
		}).then(response => {
			let models = response.data["Results"];
			models.sort((a, b) => {
				if (a["Model_Name"] < b["Model_Name"]) {
					return -1;
				}
				if (a["Model_Name"] > b["Model_Name"]) {
					return 1;
				}
				return 0;
			});
			this.setState({ models }, () => this._sendCar());
		});
	};

	_selectedModel = e => {
		this.setState(
			{
				model: e,
			},
			() => {
				this._sendCar();
			}
		);
	};

	_sendCar = () => {
		this.props.onChange({
			cargo: this.state.cargo,
			year: this.state.year,
			make: this.state.make,
			model: this.state.model,
			plates: this.state.plates,
			vin: this.state.vin,
			image: this.state.image,
		});
	};

	render() {
		return (
			<Row gutter={10}>
				<Col span={4}>
					<File title={"Title*"} location={"titles"} url={this.state.image} onChange={url => this.setState({ image: url }, this._sendCar)} />
				</Col>
				<Col span={20}>
					<Row gutter={10}>
						{this.props.withCargo ? (
							<Col span={24}>
								<div className="gx-form-group">
									<Select
										placeholder="Type*"
										required={true}
										style={{ width: "100%" }}
										onChange={e => this.setState({ cargo: e }, () => this._sendCar())}
										value={this.state.cargo ? this.state.cargo : undefined}>
										<Select.Option key={"Plataforma"} value={"Plataforma"}>
											Plataforma
										</Select.Option>
										<Select.Option key={"Caja Cerrada"} value={"Caja Cerrada"}>
											Caja Cerrada
										</Select.Option>
										<Select.Option key={"Low Boy"} value={"Low Boy"}>
											Low Boy
										</Select.Option>
										<Select.Option key={"Nodriza"} value={"Nodriza"}>
											Nodriza
										</Select.Option>
									</Select>
								</div>
							</Col>
						) : null}
						<Col span={12}>
							<div className="gx-form-group">
								<Input
									placeholder={"VIN*"}
									required={true}
									onChange={event => {
										const vin = event.target.value;
										this.setState({ vin }, () => this._sendCar());
										if (vin.length === 17) {
											axios({
												method: "GET",
												url: `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json&model`,
											})
												.then(res => {
													const make = res.data["Results"][0]["Make"];
													const model = res.data["Results"][0]["Model"];
													const year = res.data["Results"][0]["ModelYear"];
													this.setState(
														{
															year,
															make,
															model,
														},
														() => this._sendCar()
													);
												})
												.catch(() => {
													// If gov fails, then use premium
													axios({
														method: "GET",
														url: `https://vindecodervehicle.com/api/v1/?id=luisrodriguez&key=c8s10bcj3iz8lnq2x701bc4sijk1&vin=${vin}`,
													}).then(res => {
														const make = res.data["Results"][0]["Make"];
														const model = res.data["Results"][0]["Model"];
														const year = res.data["Results"][0]["ModelYear"];
														this.setState(
															{
																year,
																make,
																model,
															},
															() => this._sendCar()
														);
													});
												});
										}
									}}
									value={this.state.vin}
								/>
							</div>
						</Col>
						<Col span={12}>
							<div className="gx-form-group">
								<Input
									placeholder={"Plates"}
									onChange={e => this.setState({ plates: e.target.value }, () => this._sendCar())}
									value={this.state.plates}
								/>
							</div>
						</Col>
						<Col span={6}>
							<div className="gx-form-group">
								<Input
									placeholder="Year*"
									required={true}
									style={{ width: "100%" }}
									onChange={e => this.setState({ year: e.target.value }, () => this._sendCar())}
									value={this.state.year ? this.state.year : null}
								/>
							</div>
						</Col>
						<Col span={8}>
							<div className="gx-form-group">
								<Input
									placeholder="Make*"
									required={true}
									style={{ width: "100%" }}
									onChange={e => this.setState({ make: e.target.value }, () => this._sendCar())}
									value={this.state.make ? this.state.make : null}
								/>
							</div>
						</Col>
						<Col span={10}>
							<div className="gx-form-group">
								<Input
									placeholder="Model*"
									required={true}
									style={{ width: "100%" }}
									onChange={e => this.setState({ model: e.target.value }, () => this._sendCar())}
									value={this.state.model ? this.state.model : null}
								/>
							</div>
						</Col>
					</Row>
				</Col>
			</Row>
		);
	}
}

Vehicle.propTypes = {
	withCargo: PropTypes.bool,
};

export default Vehicle;
