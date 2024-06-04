import React from "react";
import {Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import async from "async";
import moment from "moment";
import {Select} from "antd";

import Widget from "components/Widget/index";


class Chart extends React.Component {
	dailyData = [
		{name: moment().subtract(6, "day").format("dddd"), value: moment().subtract(6, "day").startOf("day"), Insurances: 0},
		{name: moment().subtract(5, "day").format("dddd"), value: moment().subtract(5, "day").startOf("day"), Insurances: 0},
		{name: moment().subtract(4, "day").format("dddd"), value: moment().subtract(4, "day").startOf("day"), Insurances: 0},
		{name: moment().subtract(3, "day").format("dddd"), value: moment().subtract(3, "day").startOf("day"), Insurances: 0},
		{name: moment().subtract(2, "day").format("dddd"), value: moment().subtract(2, "day").startOf("day"), Insurances: 0},
		{name: moment().subtract(1, "day").format("dddd"), value: moment().subtract(1, "day").startOf("day"), Insurances: 0},
		{name: moment().format("dddd"), value: moment().startOf("day"), Insurances: 0},
	];

	weeklyData = [
		{name: moment().subtract(6, "week").format("w"), value: moment().subtract(6, "week").startOf("week"), Insurances: 0},
		{name: moment().subtract(5, "week").format("w"), value: moment().subtract(5, "week").startOf("week"), Insurances: 0},
		{name: moment().subtract(4, "week").format("w"), value: moment().subtract(4, "week").startOf("week"), Insurances: 0},
		{name: moment().subtract(3, "week").format("w"), value: moment().subtract(3, "week").startOf("week"), Insurances: 0},
		{name: moment().subtract(2, "week").format("w"), value: moment().subtract(2, "week").startOf("week"), Insurances: 0},
		{name: moment().subtract(1, "week").format("w"), value: moment().subtract(1, "week").startOf("week"), Insurances: 0},
		{name: moment().format("w"), value: moment().startOf("week"), Insurances: 0},
	];

	monthlyData = [
		{name: moment().subtract(6, "month").format("MMM"), value: moment().subtract(6, "month").startOf("month"), Insurances: 0},
		{name: moment().subtract(5, "month").format("MMM"), value: moment().subtract(5, "month").startOf("month"), Insurances: 0},
		{name: moment().subtract(4, "month").format("MMM"), value: moment().subtract(4, "month").startOf("month"), Insurances: 0},
		{name: moment().subtract(3, "month").format("MMM"), value: moment().subtract(3, "month").startOf("month"), Insurances: 0},
		{name: moment().subtract(2, "month").format("MMM"), value: moment().subtract(2, "month").startOf("month"), Insurances: 0},
		{name: moment().subtract(1, "month").format("MMM"), value: moment().subtract(1, "month").startOf("month"), Insurances: 0},
		{name: moment().format("MMM"), value: moment().startOf("month"), Insurances: 0},
	];

	constructor(props) {
		super(props);
		this.state = {
			data: "daily",
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
		this.transformData(nextProps.adminInsurances ?? nextProps.carInsurances)
	}

	transformData = (data) => {
		let daily = [
			{name: moment().subtract(6, "day").format("dddd"), value: moment().subtract(6, "day").startOf("day"), Insurances: 0},
			{name: moment().subtract(5, "day").format("dddd"), value: moment().subtract(5, "day").startOf("day"), Insurances: 0},
			{name: moment().subtract(4, "day").format("dddd"), value: moment().subtract(4, "day").startOf("day"), Insurances: 0},
			{name: moment().subtract(3, "day").format("dddd"), value: moment().subtract(3, "day").startOf("day"), Insurances: 0},
			{name: moment().subtract(2, "day").format("dddd"), value: moment().subtract(2, "day").startOf("day"), Insurances: 0},
			{name: moment().subtract(1, "day").format("dddd"), value: moment().subtract(1, "day").startOf("day"), Insurances: 0},
			{name: moment().format("dddd"), value: moment().startOf("day"), Insurances: 0},
		];

		let weekly = [
			{name: moment().subtract(6, "week").format("w"), value: moment().subtract(6, "week").startOf("week"), Insurances: 0},
			{name: moment().subtract(5, "week").format("w"), value: moment().subtract(5, "week").startOf("week"), Insurances: 0},
			{name: moment().subtract(4, "week").format("w"), value: moment().subtract(4, "week").startOf("week"), Insurances: 0},
			{name: moment().subtract(3, "week").format("w"), value: moment().subtract(3, "week").startOf("week"), Insurances: 0},
			{name: moment().subtract(2, "week").format("w"), value: moment().subtract(2, "week").startOf("week"), Insurances: 0},
			{name: moment().subtract(1, "week").format("w"), value: moment().subtract(1, "week").startOf("week"), Insurances: 0},
			{name: moment().format("w"), value: moment().startOf("week"), Insurances: 0},
		];

		let monthly = [
			{name: moment().subtract(6, "month").format("MMM"), value: moment().subtract(6, "month").startOf("month"), Insurances: 0},
			{name: moment().subtract(5, "month").format("MMM"), value: moment().subtract(5, "month").startOf("month"), Insurances: 0},
			{name: moment().subtract(4, "month").format("MMM"), value: moment().subtract(4, "month").startOf("month"), Insurances: 0},
			{name: moment().subtract(3, "month").format("MMM"), value: moment().subtract(3, "month").startOf("month"), Insurances: 0},
			{name: moment().subtract(2, "month").format("MMM"), value: moment().subtract(2, "month").startOf("month"), Insurances: 0},
			{name: moment().subtract(1, "month").format("MMM"), value: moment().subtract(1, "month").startOf("month"), Insurances: 0},
			{name: moment().format("MMM"), value: moment().startOf("month"), Insurances: 0},
		];

		async.forEach(data, (entry, callback) => {
			const entryDay = moment(entry.timestamp?.toDate?.() ?? entry.timestamp).startOf("day");
			const entryWeek = moment(entry.timestamp?.toDate?.() ?? entry.timestamp).startOf("week");
			const entryMonth = moment(entry.timestamp?.toDate?.() ?? entry.timestamp).startOf("month");

			daily.forEach(day => {
				if (entryDay.isSame(day.value)) {
					let dayFound = daily.find(x => entryDay.isSame(x.value));
					dayFound.Insurances = dayFound.Insurances + 1;
				}
			});
			weekly.forEach(week => {
				if (entryWeek.isSame(week.value)) {
					let weekFound = weekly.find(x => entryWeek.isSame(x.value));
					weekFound.Insurances = weekFound.Insurances + 1;
				}
			});
			monthly.forEach(month => {
				if (entryMonth.isSame(month.value)) {
					let monthFound = monthly.find(x => entryMonth.isSame(x.value));
					monthFound.Insurances = monthFound.Insurances + 1;
				}
			});
			callback();
		}, () => {
			this.setState({
				daily, weekly, monthly,
			})
		});
	};

	render() {
		return (
			<Widget styleName="gx-card-full gx-grahp-card">
				<div className="ant-row-flex gx-px-4 gx-pt-4">
					<h2 className="h4 gx-mb-3">Car Insurances</h2>
					<div className="gx-ml-auto">
						<Select className="gx-mb-2 gx-select-sm" defaultValue="daily" onChange={this.handleChange} style={{width: 130}}>
							<Select.Option value="daily">Daily</Select.Option>
							<Select.Option value="weekly">Weekly</Select.Option>
							<Select.Option value="monthly">Monthly</Select.Option>
						</Select>
					</div>
				</div>
				{/*<ResponsiveContainer width="100%" height={380}>
					<AreaChart isAnimationActive={false} data={this.state[this.state.data].slice()} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
						<Tooltip/>
						<XAxis dataKey="name"/>
						<defs>
							<linearGradient id="color15" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#11489F" stopOpacity={0.8}/>
								<stop offset="95%" stopColor="#F5FCFD" stopOpacity={0.8}/>
							</linearGradient>
						</defs>
						<Area dataKey='Insurances' strokeWidth={2} stackId="2" stroke='#11489F' fill="url(#color15)" fillOpacity={1}/>
					</AreaChart>
				</ResponsiveContainer>*/}
				<ResponsiveContainer className="gx-graph-chart gx-rounded-lg" width="100%" height={380}>
					<BarChart data={this.state[this.state.data].slice()} margin={{top: 25, right: 15, left: 0, bottom: 0}}>
						<XAxis dataKey="name" axisLine={false}/>
      					<YAxis axisLine={false}/>
      					<Tooltip />
						<Bar dataKey="Insurances" stackId="a" fill="#131333" legendType="circle" barSize={15} radius={[0,0,50,50]}/>
      					<Bar dataKey="Insurances" stackId="a" fill="#2E2EF3" legendType="circle" barSize={15} radius={[50,50,0,0]}/>
					</BarChart>
				</ResponsiveContainer>
			</Widget>
		);
	}
}

export default Chart