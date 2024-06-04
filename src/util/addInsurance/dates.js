import React from "react";
import {DatePicker, Modal, Switch, Typography} from "antd";
import moment from "moment";

class Dates extends React.Component {

	updateTotal = (partial_payment_sw) => {
        const { from, coverageDays, coveragePrice, coverageProfit, dateRange } = this.props.state;
        let total = 0;
        if (coverageDays > 0) {
            total = partial_payment_sw  ? coverageProfit : coveragePrice;
        } else if (dateRange) {
            const diff = dateRange[1].diff(dateRange[0], "days", true);
            total = partial_payment_sw  ? Math.ceil(diff) * coverageProfit : Math.ceil(diff) * coveragePrice;
        }

        this.props.onChange({ total });
    }

	dateChanged = (e) => {
		if (this.props.state.coverageDays > 0) {
			this.props.onChange({
				from: e,
				to: moment(e).add(this.props.state.coverageDays, "days"),
				days: this.props.state.coverageDays,
				//total: this.props.state.partial_payment_sw? this.props.state.coverageProfit: this.props.state.coveragePrice,
			});
		} else {
			const diff = e[1]["diff"](e[0], "days", true);
			this.props.onChange({
				dateRange: e,
				from: e[0],
				to: e[1],
				days: Math.ceil(diff),
				//total: this.props.state.partial_payment_sw? Math.ceil(diff) * this.props.state.coverageProfit: Math.ceil(diff) * this.props.state.coveragePrice,
			}, () => {
				const insuranceStart = moment(this.props.state.from["toDate"]());
				if (!insuranceStart.isAfter()) {
					Modal.error({
						title: "Date Range Error",
						content: "This date is in the past. Please double check the time.",
					});
				}
			});
		}
		this.updateTotal();

		
	};

	handleSwitchChange = (e) => {
		const newPartialPaymentSw = e;
        this.props.onChange({ partial_payment_sw: e });
        this.updateTotal(newPartialPaymentSw);
    }
	render() {
		return (
			<>
				<Typography.Title level={4}>Dates Covered*</Typography.Title>
				<div className={"gx-form-group"}>
					{
						this.props.state.coverageDays > 0 ?
							<DatePicker
								showTime={{
									hideDisabledOptions: true,
									//defaultValue: moment().add(2, "hour"),
								}}
								format={"lll"}
								style={{width: "100%"}}
								placeholder="Start date"
								onChange={this.dateChanged}
								disabledDate={current => current < moment().subtract(1, "day").endOf("day")}
								disabledTime={current => {
									var hours = [];
									for(var i =0; i < moment().add(1, "h").hour(); i++){
										hours.push(i);
									}
									return {
										disabledHours: () => current.isSame(moment(),"d") ? hours : []
									}
								}}
								value={this.props.state.from}
							/>
							:
							<DatePicker.RangePicker
								style={{width: "100%"}}
								showTime={{
									hideDisabledOptions: true,
									//defaultValue: [moment().add(2, "hour"), moment().add(2, "hour")],
								}}
								format={"lll"}
								disabledDate={current => current < moment().subtract(1, "day").endOf("day")}
								disabledTime={(current, type) => {
									if (type === "end" || !current || !current.length) return {};

									var hours = [];
									for(var i =0; i < moment().add(1, "h").hour(); i++){
										hours.push(i);
									}

									return {
										disabledHours: () => current[0].isSame(moment(),"d") ? hours : []
									}
								}}
								ranges={{
									"24 Hours": [moment().add(2, "hour"), moment().add(25, "hours")],
									"48 Hours": [moment().add(2, "hour"), moment().add(49, "hours")],
									"72 Hours": [moment().add(2, "hour"), moment().add(73, "hours")],
								}}
								onChange={this.dateChanged}
								value={this.props.state.dateRange}
							/>
					}
				</div>
				{
					this.props.state.partial_payment && (
					<>
						<Typography.Title level={4}>Partial Payment</Typography.Title>
						<Switch checked={this.props.state.partial_payment_sw} onChange={e => this.handleSwitchChange(e) } />
					</>
					)
				}
			</>
		);
	}
}

export default Dates;