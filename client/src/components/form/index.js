import "src/styles/form/index.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import React, { useState, useRef, useEffect } from "react";
import { cilImage, cilSmile, cilList, cilCalendarCheck } from "@coreui/icons";

import API from "src/api";
import Scheduler from "./scheduler";
import ImgHolder from "./img-holder";
import PollCreator from "./poll-creator";
import * as Constants from "src/constants";
import EmojiContainer from "./emoji-container";
import { openModal } from "src/redux/actions/modal";
import useToaster from "src/custom-hooks/toaster-message";
import { getMonthOptions, getWeekOptions } from "src/helpers";

const Form = ({ editText, editUploadedFiles, editUploadedFileObjects, editPollData, editSchedule }) => {
	const dispatch = useDispatch(), actionContainerRef = useRef(null);
	const fileUploadRef = useRef(null), { showError, showSuccess } = useToaster();
	const monthOptions = getMonthOptions(), weekOptions = getWeekOptions();

	const placeHolderImageSrc = "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png";
	const allowedFileTypes = ["image/png", "image/jpg", "image/jpeg"];

	const [text, setText] = useState('');
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [uploadedFileObjects, setUploadedFileObjects] = useState([]);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [showPollCreator, setShowPollCreator] = useState(false);
	const [showScheduler, setShowScheduler] = useState(false);
	const [pollData, setPollData] = useState(null);
	const [scheduledPollData, setScheduledPollData] = useState(null);
	const [isPostScheduled, setIsPostScheduled] = useState(false);
	const [schedulerData, setSchedulerData] = useState(null);
	const [isFormValid, setIsFormValid] = useState(true);

	useEffect(() => {
		if (editText) setText(editText);

		if (editUploadedFiles?.length) setUploadedFiles([...editUploadedFiles]);

		if (editUploadedFileObjects?.length) setUploadedFileObjects([...editUploadedFiles]);

		if (editPollData) {
			setShowPollCreator(true);
			setScheduledPollData(editPollData);
		}

		if (editSchedule) {
			setIsPostScheduled(true);
			setSchedulerData(editSchedule);
		}
	}, [editText, editUploadedFiles, editUploadedFileObjects, editPollData, editSchedule]);

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
		if (_uploadedFileObjects[index]) _uploadedFileObjects.splice(index, 1);

		setUploadedFiles([..._uploadedFiles]);
		setUploadedFileObjects([..._uploadedFileObjects]);
	}

	const handleEmojiSelect = e => {
		setText(`${text}${e.emoji}`);
	}

	const handlePollData = (choices, durationData) => {
		let _isFormValid = true;

		choices.forEach(choiceInput => {
			if (!choiceInput) _isFormValid = false;
		});

		setPollData({ choices, duration: durationData });
		setIsFormValid(_isFormValid);
	}

	const openPollCreator = () => {
		if (!uploadedFiles.length && !pollData) {
			setShowPollCreator(true);
			setIsFormValid(false);
		}
	}

	const removePoll = () => {
		setPollData(null);
		setIsFormValid(true);
		setShowPollCreator(false);
	}

	const confirmPostSchedule = scheduleData => {
		setShowScheduler(false);
		setIsPostScheduled(true);
		setSchedulerData(scheduleData);
	}

	const clearPostSchedule = () => {
		setShowScheduler(false);
		setIsPostScheduled(false);
		setSchedulerData(null);
	}

	const createPost = async () => {
		if (isFormValid && text) {
			try {
				const data = { text };
				if (showPollCreator && pollData) data["poll"] = { ...pollData };
				if (isPostScheduled && schedulerData) data["schedule"] = { ...schedulerData };

				const formData = new FormData();
				formData.set("data", JSON.stringify(data));

				uploadedFileObjects.forEach(fileObj => {
					formData.append("images[]", fileObj);
				});

				const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
				const response = await API(Constants.POST, Constants.CREATE_POST, formData, headerData);
				const responseData = response.data;

				const alert = responseData?.meta?.status ? showSuccess : showError;
				const message = responseData?.meta?.message ?? '';
				if (message) alert(message);

				clearPost();
			} catch (error) {
				console.log(error);
				showError("Something went wrong!");
				clearPost();
			}
		}
	}

	const clearPost = () => {
		setText('');
		setPollData(null);
		setUploadedFiles([]);
		setSchedulerData(null);
		setShowPollCreator(false);
		setIsPostScheduled(false);
		setUploadedFileObjects([]);
	}

	const scheduleText = () => {
		const { year, month, dayOfMonth, hours, minutes } = schedulerData;
		const date = new Date(year, month, dayOfMonth, hours, minutes, 0, 0);
		const displayedMonth = monthOptions[month].label, displayedDayOfWeek = weekOptions[date.getDay()];

		return (
			<span id="schedule-text">
				{
					`Will send on ${displayedDayOfWeek}, ${displayedMonth} ${dayOfMonth}, ${year} at
					${hours > 9 ? hours : `0${hours}`}:${minutes > 9 ? minutes : `0${minutes}`} hours`
				}
			</span>
		);
	}

	const openScheduledPostList = () => {
		setShowScheduler(false);
		dispatch(openModal("scheduledPosts"));
	}

	return (
		<form noValidate onSubmit={handleSubmit} className="mw-100">
			<img src={placeHolderImageSrc} className="user-image" alt="user" />

			<div className="form-action-container">
				{isPostScheduled && schedulerData && (scheduleText())}
				<textarea
					value={text}
					className="special-input"
					placeholder="What's happening?"
					onChange={e => setText(e.target.value)}
				/>
				{
					showPollCreator && (
						<PollCreator
							closePollCreator={removePoll}
							editPollData={scheduledPollData}
							handleChoiceChange={handlePollData}
						/>
					)
				}
				<hr />

				<ImgHolder removeImage={index => spliceImage(index)} images={uploadedFiles} />

				<div ref={actionContainerRef} className={`${uploadedFiles.length > 0 ? "mt-3" : ''}`}>
					<CIcon
						size="sm"
						title="Image"
						icon={cilImage}
						className="action-icon"
						style={{ opacity: showPollCreator ? "0.4" : '1' }}
						onClick={() => { if (!showPollCreator) fileUploadRef.current.click(); }}
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
								actionContainerRect={actionContainerRef?.current?.getBoundingClientRect() ?? null}
							/>
						)
					}

					<CIcon
						size="sm"
						title="Poll"
						icon={cilList}
						className="action-icon"
						onClick={openPollCreator}
						style={{ opacity: (uploadedFiles.length || pollData) ? "0.4" : '1' }}
					/>

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
								scheduleData={schedulerData}
								isPostScheduled={isPostScheduled}
								clearSchedule={clearPostSchedule}
								confirmSchedule={confirmPostSchedule}
								openScheduledPostList={openScheduledPostList}
								closeScheduler={() => { setShowScheduler(false); }}
								handleClickOutside={() => { setShowScheduler(false); }}
								actionContainerRect={actionContainerRef?.current?.getBoundingClientRect() ?? null}
							/>
						)
					}

					<div id="chirp-button" style={{ opacity: isFormValid && text ? '1' : "0.4" }} onClick={createPost}>
						Post
					</div>
				</div>
			</div>
		</form>
	);
};

export default Form;
