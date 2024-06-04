import React from "react";
import { Scrollbars } from "react-custom-scrollbars";

const CustomScrollbars = props => {
	return (
		<Scrollbars
			{...props}
			autoHide
			autoHeight
			autoHeightMin={"100%"}
			autoHeightMax={"100%"}
			renderTrackHorizontal={() => <div style={{ display: "none" }} className="track-horizontal" />}
			renderView={props => <div {...props} style={{ ...props.style, overflowX: "hidden" }} />}
		/>
	);
};

export default CustomScrollbars;
