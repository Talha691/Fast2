import React from "react";
import moment from "moment";
import {storage} from "../firebase/firebase";
import {Spin} from "antd";

class File extends React.Component {
	constructor(props) {
		super(props);
		this.fileInput = React.createRef();
		this.state = {
			uploading: false,
		};
	}

	_uploadPicture = () => {
		this.fileInput.current.click();
	};

	_fileChange = async () => {
		await this.setState({uploading: true});
		const file = this.fileInput.current.files[0];
		const name = file.name;
		const extension = name.substr(name.lastIndexOf(".") + 1, name.length);
		const snapshot = await storage.ref(this.props.location).child(moment().valueOf() + "." + extension).put(file);
		const url = await snapshot.ref.getDownloadURL();
		this.props.onChange(url);
		await this.setState({uploading: false});
	};

	render() {
		return (
			<>
				<div className={"file"} onClick={this._uploadPicture}>
					<Spin style={{position: "absolute", left: "36%", top: "36%"}} spinning={this.state.uploading}/>
					{this.props.url ? <img alt={this.props.title} src={this.props.url}/> : this.props.title}
				</div>
				<input type="file" ref={this.fileInput} onChange={this._fileChange} style={{display: "none"}} accept="image/x-png,image/jpeg"/>
			</>
		);
	}
}

export default File;