import "src/styles/form/index.css";

import CIcon from "@coreui/icons-react";
import React, { useState, useRef } from "react";
import { cilImage, cilSmile, cilList, cilCalendarCheck } from "@coreui/icons";

import ImgHolder from "./img-holder";
import useToaster from "src/custom-hooks/toaster-message";
import PollCreator from "./poll-creator";
import EmojiContainer from "./emoji-container";
import Scheduler from "./scheduler";

const Form = () => {
	const fileUploadRef = useRef(null), { showError } = useToaster();

	const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
	const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"];

	const [text, setText] = useState('');
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showPollCreator, setShowPollCreator] = useState(false);
	const [showScheduler, setShowScheduler] = useState(false);
	const [choiceErrors, setChoiceErrors] = useState([]);

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
					setUploadedFiles([..._uploadedFiles]);
				}

				reader.readAsDataURL(fileObj);
			}
		}

		resetFileCache();
	}

	const spliceImage = index => {
		let _uploadedFiles = uploadedFiles;
		_uploadedFiles.splice(index, 1);
		setUploadedFiles([..._uploadedFiles]);
	}

	const handleEmojiSelect = e => {
		setText(`${text}${e.emoji}`);
	}

	const createPoll = choices => {
		const _choiceErrors = [];
		let formIsValid = true;

		choices.forEach((choiceInput, choiceIndex) => {
			_choiceErrors[choiceIndex] = choiceInput ? '' : "Please enter your choice.";
			if (!choiceInput) formIsValid = false;
		});

		setChoiceErrors([ ..._choiceErrors ]);
		if (formIsValid) setShowPollCreator(false);
	}

	const removePoll = () => {
		setShowPollCreator(false);
		setChoiceErrors([]);
	}

	return (
		<form noValidate onSubmit={handleSubmit} className="mw-100">
			<img src={placeHolderImageSrc} className="user-image" alt="user" />

			<div className="input-box">
				<textarea
					value={text}
					className="special-input"
					placeholder="What's happening?"
					onChange={e => setText(e.target.value)}
				/>
				<hr />

				<ImgHolder removeImage={index => spliceImage(index)} images={uploadedFiles} />
				<CIcon
					size="sm"
					title="Image"
					icon={cilImage}
					className="action-icon"
					onClick={() => { fileUploadRef.current.click(); }}
				/>
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
					title="Emoji"
					icon={cilSmile}
					className="action-icon"
					onClick={() => setShowEmojiPicker(!showEmojiPicker)}
				/>
				{
					showEmojiPicker && (
						<EmojiContainer
							handleEmojiSelect={handleEmojiSelect}
							handleClickOutside={() => { setShowEmojiPicker(false); }}
						/>
					)
				}

				<CIcon
					size="sm"
					title="Poll"
					icon={cilList}
					className="action-icon"
					onClick={() => setShowPollCreator(!showPollCreator)}
				/>
				{
					showPollCreator && (
						<PollCreator
							closePollCreator={removePoll}
							handleClickOutside={() => { setShowPollCreator(false); }}
							createPoll={choices => { createPoll(choices); }}
							choiceErrors={choiceErrors}
						/>
					)
				}

				<CIcon
					size="sm"
					title="Schedule"
					className="action-icon"
					icon={cilCalendarCheck}
					onClick={() => { setShowScheduler(!showScheduler); }}
				/>
				{
					showScheduler && (
						<Scheduler
							handleClickOutside={() => { setShowScheduler(false); }}
							closeScheduler={() => { setShowScheduler(false); }}
						/>
					)
				}

				<div id="chirp-button">Chirp</div>
			</div>
		</form>
	);
};

export default Form;
