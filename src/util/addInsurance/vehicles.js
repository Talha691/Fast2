import React from "react";
import {Input, Typography} from "antd";
import Vehicle from "../vehicle";

function Vehicles(props) {
	return (
		<>
			<Typography.Title level={4}>
				Vehicle Information
			</Typography.Title>
			<Vehicle type={props.type}
			         year={props.state.year}
			         make={props.state.make}
			         model={props.state.model}
			         plates={props.state.plates}
			         vin={props.state.vin}
			         image={props.state.image}
			         onChange={car => {
				         props.onChange({
					         year: car.year,
					         make: car.make,
					         model: car.model,
					         plates: car.plates,
					         vin: car.vin,
					         image: car.image,
				         });
			         }}
			/>
			{
				props.state.extra ?
					<div>
						<hr/>
						<Vehicle
							type={props.type}
							withCargo={props.type === "truck"}
							cargo={props.state.cargoExtra}
							year={props.state.yearExtra}
							make={props.state.makeExtra}
							model={props.state.modelExtra}
							plates={props.state.platesExtra}
							vin={props.state.vinExtra}
							image={props.state.imageExtra}
							onChange={car => {
								props.onChange({
									cargoExtra: car.cargo,
									yearExtra: car.year,
									makeExtra: car.make,
									modelExtra: car.model,
									platesExtra: car.plates,
									vinExtra: car.vin,
									imageExtra: car.image,
								});
							}}
						/>
					</div>
					: null
			}
			{
				props.type === "truck" ?
					<div>
						<hr/>
						<Typography.Title level={4}>Driver (Optional)</Typography.Title>
						<Input
							placeholder={"Driver"}
							onChange={(e) => props.onChange({driver: e.target.value})}
							value={props.state.driver}/>
						<br/>
						<br/>
					</div> : null
			}
		</>
	);
}

export default Vehicles;