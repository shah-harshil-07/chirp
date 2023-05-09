import "src/styles/form/index.css";

import CIcon from "@coreui/icons-react";
import React, { useState, useRef } from "react";
import { cilImage, cilSmile, cilList, cilCalendarCheck } from "@coreui/icons";

import ImgHolder from "./img-holder";
import useToaster from "src/custom-hooks/toaster-message";
import PollCreator from "./poll-creator";
import EmojiContainer from "./emoji-container";
import Scheduler from "./scheduler";
import API from "src/api";
import * as Constants from "src/constants";
import { getMonthOptions, getWeekOptions } from "src/helpers";

const Form = () => {
	const fileUploadRef = useRef(null), { showError } = useToaster();
	const monthOptions = getMonthOptions(), weekOptions = getWeekOptions();

	const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
	const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"];

	const [text, setText] = useState('');
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [uploadedFileObjects, setUploadedFileObjects] = useState([]);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showPollCreator, setShowPollCreator] = useState(false);
	const [showScheduler, setShowScheduler] = useState(false);
	const [choiceErrors, setChoiceErrors] = useState([]);
	const [pollData, setPollData] = useState(null);
	const [isPostScheduled, setIsPostScheduled] = useState(false);
	const [schedulerData, setSchedulerData] = useState(null);

	const handleSubmit = async e => {
		e.preventDefault();
	};

	const resetFileCache = () => {
		fileUploadRef.current.value = '';
	}

	const handleImageUpload = e => {
		const files = e.target.files, _uploadedFiles = uploadedFiles, _uploadedFileObjects = uploadedFileObjects;

		if (files.length + uploadedFiles.length > 4) {
			showError("More than 4 images are not allowed.");
		} else {
			for (let i = 0; i < files.length; i++) {
				const fileObj = files[i];
				if (!allowedFileTypes.includes(fileObj.type) || i > 3) break;

				const reader = new FileReader();
				reader.onload = e => {
					_uploadedFiles.push(e.target.result);
					_uploadedFileObjects.push(fileObj);

					setUploadedFiles([..._uploadedFiles]);
					setUploadedFileObjects([..._uploadedFileObjects]);
				}

				reader.readAsDataURL(fileObj);
			}
		}

		resetFileCache();
	}

	const spliceImage = index => {
		let _uploadedFiles = uploadedFiles, _uploadedFileObjects = uploadedFileObjects;

		_uploadedFiles.splice(index, 1);
		_uploadedFileObjects.splice(index, 1);

		setUploadedFiles([..._uploadedFiles]);
		setUploadedFileObjects([..._uploadedFileObjects]);
	}

	const handleEmojiSelect = e => {
		setText(`${text}${e.emoji}`);
	}

	const createPoll = (choices, durationData) => {
		const _choiceErrors = [];
		let formIsValid = true;

		choices.slice(0, 2).forEach((choiceInput, choiceIndex) => {
			_choiceErrors[choiceIndex] = choiceInput ? '' : "Please enter your choice.";
			if (!choiceInput) formIsValid = false;
		});

		setChoiceErrors([..._choiceErrors]);

		if (formIsValid) {
			setPollData({ choices, duration: durationData });
			setShowPollCreator(false);
		} else {
			setPollData(null);
		}
	}

	const removePoll = () => {
		setShowPollCreator(false);
		setChoiceErrors([]);
	}

	const confirmPostSchedule = scheduleData => {
		setShowScheduler(false);
		setIsPostScheduled(true);
		setSchedulerData(scheduleData);
	}

	const createPost = async () => {
		try {
			console.log(pollData);
			// const data = { text };
			// const formData = new FormData();
			// formData.set("data", JSON.stringify(data));

			// uploadedFileObjects.forEach(fileObj => {
			// 	formData.append("images[]", fileObj);
			// });

			// const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
			// const response = await API(Constants.POST, Constants.CREATE_POST, formData, headerData);
			// console.log(response.data);
		} catch (error) {
			console.log(error);
		}
	}

	const scheduleText = () => {
		const { year, month, dayOfMonth, hours, minutes } = schedulerData;
		const date = new Date(year, month, dayOfMonth, hours, minutes);
		const displayedMonth = monthOptions[month].label, displayedDayOfWeek = weekOptions[date.getDay()];

		return (
			<span>
				{
					`Will send on ${displayedDayOfWeek} ${displayedMonth} ${dayOfMonth}, ${year} at
					${hours > 9 ? hours : `0${hours}`}:${minutes > 9 ? minutes : `0${minutes}`} hours`
				}
			</span>
		);
	}

	return (
		<form noValidate onSubmit={handleSubmit} className="mw-100">
			<img src={placeHolderImageSrc} className="user-image" alt="user" />

			<div className="input-box">
				{isPostScheduled && schedulerData && (scheduleText())}
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
							createPoll={createPoll}
							choiceErrors={choiceErrors}
							closePollCreator={removePoll}
							handleClickOutside={() => { setShowPollCreator(false); }}
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
							isPostScheduled={isPostScheduled}
							confirmSchedule={confirmPostSchedule}
							closeScheduler={() => { setShowScheduler(false); }}
							handleClickOutside={() => { setShowScheduler(false); }}
						/>
					)
				}

				<div id="chirp-button" onClick={createPost}>Post</div>
			</div>
		</form>
	);
};

export default Form;
