import "src/styles/form/index.css";

import CIcon from "@coreui/icons-react";
import React, { useState, useRef } from "react";
import { cilImage, cilSmile, cilList } from "@coreui/icons";

import ImgHolder from "./img-holder";
import useToaster from "src/custom-hooks/toaster-message";

const Form = () => {
	const fileUploadRef = useRef(null);
	const { showError } = useToaster();

	const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
	const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"];

	const [uploadedFiles, setUploadedFiles] = useState([]);

	const handleSubmit = async e => {
		e.preventDefault();
	};

	const resetFileCache = () => {
		fileUploadRef.current.value = '';
	}

	const handleImageUpload = e => {
		const files = e.target.files, _uploadedFiles = uploadedFiles;

		if (files.length + uploadedFiles.length > 4) {
			showError("More than 4 images are not allowed.");
		} else {
			for (let i = 0; i < files.length; i++) {
				const fileObj = files[i];
				if (!allowedFileTypes.includes(fileObj.type) || i > 3) break;

				const reader = new FileReader();
				reader.onload = e => {
					_uploadedFiles.push(e.target.result);
					setUploadedFiles([ ..._uploadedFiles ]);
				}

				reader.readAsDataURL(fileObj);
			}
		}

		resetFileCache();
	}

	const spliceImage = index => {
		let _uploadedFiles = uploadedFiles;
		_uploadedFiles.splice(index, 1);
		setUploadedFiles([ ..._uploadedFiles ]);
	}

	return (
		<form noValidate onSubmit={handleSubmit} className="mw-100">
			<img src={placeHolderImageSrc} className="user-image" alt="user" />

			<div className="input-box">
				<textarea className="special-input" placeholder="What's happening?" />
				<hr />

				<ImgHolder removeImage={index => spliceImage(index)} images={uploadedFiles} />
				<input
					multiple
					type="file"
					accept="image/*"
					className="d-none"
					ref={fileUploadRef}
					onChange={handleImageUpload}
				/>

				<CIcon
					size="sm"
					title="Image"
					icon={cilImage}
					className="action-icon"
					onClick={() => { fileUploadRef.current.click() } }
				/>
				<CIcon className="action-icon" title="Emoji" icon={cilSmile} size="sm" />
				<CIcon className="action-icon" title="Poll" icon={cilList} size="sm" />

				<div id="chirp-button">Chirp</div>
			</div>
		</form>
	);
};

export default Form;
