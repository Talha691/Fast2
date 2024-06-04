import React from "react";
import InvoicesTable from "./invoices-table";

class Invoices extends React.Component {
	constructor() {
		super();

		this.state = {}
	}

	render() {
		return (
			<div>
				<InvoicesTable />
			</div>
		)
	}
}

export default Invoices;