import React from "react";
import {  ResponsiveContainer, Tooltip, XAxis, LineChart, Line, Legend } from "recharts";
import async from "async";
import moment from "moment";
import { Select } from "antd";

import Widget from "components/Widget/index";

class Chart extends React.Component {
	dailyData = [
		{name: moment().subtract(6, "day").format("dddd"), value: moment().subtract(6, "day").startOf("day"), Money: 0},
		{name: moment().subtract(5, "day").format("dddd"), value: moment().subtract(5, "day").startOf("day"), Money: 0},
		{name: moment().subtract(4, "day").format("dddd"), value: moment().subtract(4, "day").startOf("day"), Money: 0},
		{name: moment().subtract(3, "day").format("dddd"), value: moment().subtract(3, "day").startOf("day"), Money: 0},
		{name: moment().subtract(2, "day").format("dddd"), value: moment().subtract(2, "day").startOf("day"), Money: 0},
		{name: moment().subtract(1, "day").format("dddd"), value: moment().subtract(1, "day").startOf("day"), Money: 0},
		{name: moment().format("dddd"), value: moment().startOf("day"), Money: 0},
	];

	weeklyData = [
		{name: moment().subtract(6, "week").format("w"), value: moment().subtract(6, "week").startOf("week"), Money: 0},
		{name: moment().subtract(5, "week").format("w"), value: moment().subtract(5, "week").startOf("week"), Money: 0},
		{name: moment().subtract(4, "week").format("w"), value: moment().subtract(4, "week").startOf("week"), Money: 0},
		{name: moment().subtract(3, "week").format("w"), value: moment().subtract(3, "week").startOf("week"), Money: 0},
		{name: moment().subtract(2, "week").format("w"), value: moment().subtract(2, "week").startOf("week"), Money: 0},
		{name: moment().subtract(1, "week").format("w"), value: moment().subtract(1, "week").startOf("week"), Money: 0},
		{name: moment().format("w"), value: moment().startOf("week"), Money: 0},
	];

	monthlyData = [
		{name: moment().subtract(6, "month").format("MMM"), value: moment().subtract(6, "month").startOf("month"), Money: 0},
		{name: moment().subtract(5, "month").format("MMM"), value: moment().subtract(5, "month").startOf("month"), Money: 0},
		{name: moment().subtract(4, "month").format("MMM"), value: moment().subtract(4, "month").startOf("month"), Money: 0},
		{name: moment().subtract(3, "month").format("MMM"), value: moment().subtract(3, "month").startOf("month"), Money: 0},
		{name: moment().subtract(2, "month").format("MMM"), value: moment().subtract(2, "month").startOf("month"), Money: 0},
		{name: moment().subtract(1, "month").format("MMM"), value: moment().subtract(1, "month").startOf("month"), Money: 0},
		{name: moment().format("MMM"), value: moment().startOf("month"), Money: 0},
	];

	constructor(props) {
		super(props);
		this.state = {
			data: "daily",
			loading: false,
			daily: this.dailyData,
			weekly: this.weeklyData,
			monthly: this.monthlyData,
		}
	}

	handleChange = (e) => {
		this.setState({
			data: e
		})
	};

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.transformData(nextProps.adminInsurances ?? nextProps.insurances)
	}

	transformData = async (data) => {
		// const data = this.props.carInsurances.concat(this.props.truckInsurances).sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
		if (data.length === 0) return null;
		if (this.state.loading) return null;
		await this.setState({loading: true});
		let daily = [
			{name: moment().subtract(6, "day").format("dddd"), value: moment().subtract(6, "day").startOf("day"), Money: 0},
			{name: moment().subtract(5, "day").format("dddd"), value: moment().subtract(5, "day").startOf("day"), Money: 0},
			{name: moment().subtract(4, "day").format("dddd"), value: moment().subtract(4, "day").startOf("day"), Money: 0},
			{name: moment().subtract(3, "day").format("dddd"), value: moment().subtract(3, "day").startOf("day"), Money: 0},
			{name: moment().subtract(2, "day").format("dddd"), value: moment().subtract(2, "day").startOf("day"), Money: 0},
			{name: moment().subtract(1, "day").format("dddd"), value: moment().subtract(1, "day").startOf("day"), Money: 0},
			{name: moment().format("dddd"), value: moment().startOf("day"), Money: 0},
		];

		let weekly = [
			{name: moment().subtract(6, "week").format("w"), value: moment().subtract(6, "week").startOf("week"), Money: 0},
			{name: moment().subtract(5, "week").format("w"), value: moment().subtract(5, "week").startOf("week"), Money: 0},
			{name: moment().subtract(4, "week").format("w"), value: moment().subtract(4, "week").startOf("week"), Money: 0},
			{name: moment().subtract(3, "week").format("w"), value: moment().subtract(3, "week").startOf("week"), Money: 0},
			{name: moment().subtract(2, "week").format("w"), value: moment().subtract(2, "week").startOf("week"), Money: 0},
			{name: moment().subtract(1, "week").format("w"), value: moment().subtract(1, "week").startOf("week"), Money: 0},
			{name: moment().format("w"), value: moment().startOf("week"), Money: 0},
		];

		let monthly = [
			{name: moment().subtract(6, "month").format("MMM"), value: moment().subtract(6, "month").startOf("month"), Money: 0},
			{name: moment().subtract(5, "month").format("MMM"), value: moment().subtract(5, "month").startOf("month"), Money: 0},
			{name: moment().subtract(4, "month").format("MMM"), value: moment().subtract(4, "month").startOf("month"), Money: 0},
			{name: moment().subtract(3, "month").format("MMM"), value: moment().subtract(3, "month").startOf("month"), Money: 0},
			{name: moment().subtract(2, "month").format("MMM"), value: moment().subtract(2, "month").startOf("month"), Money: 0},
			{name: moment().subtract(1, "month").format("MMM"), value: moment().subtract(1, "month").startOf("month"), Money: 0},
			{name: moment().format("MMM"), value: moment().startOf("month"), Money: 0},
		];

		async.forEach(data, (entry, callback) => {
			const entryDay = moment(entry.timestamp?.toDate?.() ?? entry.timestamp).startOf("day");
			const entryWeek = moment(entry.timestamp?.toDate?.() ?? entry.timestamp).startOf("week");
			const entryMonth = moment(entry.timestamp?.toDate?.() ?? entry.timestamp).startOf("month");

			daily.forEach(day => {
				if (entryDay.isSame(day.value)) {
					let dayFound = daily.find(x => entryDay.isSame(x.value));
					dayFound.Money = dayFound.Money + +entry.total;
				}
			});
			weekly.forEach(week => {
				if (entryWeek.isSame(week.value)) {
					let weekFound = weekly.find(x => entryWeek.isSame(x.value));
					weekFound.Money = weekFound.Money + +entry.total;
				}
			});
			monthly.forEach(month => {
				if (entryMonth.isSame(month.value)) {
					let monthFound = monthly.find(x => entryMonth.isSame(x.value));
					monthFound.Money = monthFound.Money + +entry.total;
				}
			});
			callback();
		}, () => {
			this.setState({
				daily, weekly, monthly, loading: false
			})
		});
	};

	render() {
		return (
			<Widget styleName="gx-card-full gx-grahp-card">
				<div className="ant-row-flex gx-px-4 gx-pt-4">
					<h2 className="h4 gx-mb-3">Sales</h2>
					<div className="gx-ml-auto">
						<Select className="gx-mb-2 gx-select-sm gx-select-class gx-rounded-lg" defaultValue="daily" onChange={this.handleChange} style={{width: 130}}>
							<Select.Option value="daily">Daily</Select.Option>
							<Select.Option value="weekly">Weekly</Select.Option>
							<Select.Option value="monthly">Monthly</Select.Option>
						</Select>
					</div>
				</div>
				<ResponsiveContainer className="gx-graph-chart" width="100%" height={350}>
					<LineChart margin={{top: 0, right: 0, left: 0, bottom: 0}} data={this.state[this.state.data].slice()}>
						<XAxis dataKey="name" formatter={value => "$" + value}/>
						<Tooltip cursor={true}/>
						<Line type="monotone" dataKey="Money" stroke="#8884d8" strokeWidth={2} stackId="2"/>
					</LineChart>
				</ResponsiveContainer>
			</Widget>
		);
	}
}

export default Chart;