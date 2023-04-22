import "src/styles/form.css";

import CIcon from "@coreui/icons-react";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cilImage, cilSmile, cilList } from "@coreui/icons";

import { createPost, updatePost } from "../actions/posts";

const Form = ({ currentId, setCurrentId }) => {
	const post = useSelector(state => (currentId ? state.posts.find(message => message._id === currentId) : null));
	const dispatch = useDispatch();
	const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
	const fileUploadRef = useRef(null);
	const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"];
	
	const [postData, setPostData] = useState({ creator: '', title: '', message: '', tags: '', selectedFile: '' });
	const [uploadedFiles, setUploadedFiles] = useState([]);

	useEffect(() => {
		if (post) setPostData(post);
	}, [post]);

	const clear = () => {
		setCurrentId(0);
		setPostData({ creator: '', title: '', message: '', tags: '', selectedFile: '' });
	};

	const handleSubmit = async e => {
		e.preventDefault();

		if (currentId === 0) {
			dispatch(createPost(postData));
			clear();
		} else {
			dispatch(updatePost(currentId, postData));
			clear();
		}
	};

	const handleImageUpload = e => {
		const files = e.target.files, _uploadedFiles = uploadedFiles;

		for (let i = 0; i < files.length; i++) {
			const fileObj = files[i];
			if (!allowedFileTypes.includes(fileObj.type)) break;

			const reader = new FileReader();
			reader.onload = e => {
				_uploadedFiles.push(e.target.result);
				setUploadedFiles([ ..._uploadedFiles ]);
			}

			reader.readAsDataURL(fileObj);
		}
	}

	return (
		<form noValidate onSubmit={handleSubmit}>
			<img src={placeHolderImageSrc} className="user-image" alt="user" />

			<div className="input-box">
				<textarea className="special-input" placeholder="What's happening?" />
				<hr />

				{
					uploadedFiles?.[0] && (
						<img src={uploadedFiles[0]} alt="Uploaded" width={40} height={40} />
					)
				}
				<input type="file" accept="image/*" className="d-none" ref={fileUploadRef} onChange={handleImageUpload} />

				<CIcon className="action-icon" title="Image" icon={cilImage} size="sm" onClick={() => { fileUploadRef.current.click()} } />
				<CIcon className="action-icon" title="Emoji" icon={cilSmile} size="sm" />
				<CIcon className="action-icon" title="Poll" icon={cilList} size="sm" />

				<div id="chirp-button">Chirp</div>
			</div>
		</form>
	);
};

export default Form;
