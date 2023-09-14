import "src/styles/form/index.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import React, { useState, useRef, useEffect } from "react";
import { cilImage, cilSmile, cilList, cilCalendarCheck } from "@coreui/icons";

import API from "src/api";
import Scheduler from "./scheduler";
import ImgHolder from "./img-holder";
import PollCreator from "./poll-creator";
import EmojiContainer from "./emoji-container";
import { openModal } from "src/redux/actions/modal";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import { placeHolderImageSrc } from "src/utilities/constants";
import useImageConverter from "src/custom-hooks/image-converter";
import { getMonthOptions, getWeekOptions } from "src/utilities/helpers";

const Form = ({
	editText,
	editUploadedFiles,
	editUploadedFileObjects,
	editPollData,
	editSchedule,
	editScheduleMode,
	editScheduledPost
}) => {
	const dispatch = useDispatch(), textboxRef = useRef(null);
	const fileUploadRef = useRef(null), { showError, showSuccess } = useToaster();
	const monthOptions = getMonthOptions(), weekOptions = getWeekOptions();
	const { uploadImagesAction } = useImageConverter();

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

		if (editUploadedFileObjects?.length) setUploadedFileObjects([...editUploadedFileObjects]);

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
		const _uploadedFiles = uploadedFiles, _uploadedFileObjects = uploadedFileObjects;

		const readerLoadCallback = (e, fileObj) => {
			_uploadedFiles.push(e.target.result);
			_uploadedFileObjects.push(fileObj);

			setUploadedFiles([..._uploadedFiles]);
			setUploadedFileObjects([..._uploadedFileObjects]);
		}

		uploadImagesAction(e, readerLoadCallback, _uploadedFiles);

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

				if (editScheduleMode && editScheduledPost) {
					editScheduledPost(formData);
				} else {
					const headerData = { Authorization: `Bearer ${localStorage.getItem("chirp-accessToken")}` };
					const response = await API(Constants.POST, Constants.CREATE_POST, formData, headerData);
					const responseData = response.data;

					const alert = responseData?.meta?.status ? showSuccess : showError;
					const message = responseData?.meta?.message ?? '';
					if (message) alert(message);
				}

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

	const handleTextChange = e => {
		setText(e.target.value);
		textboxRef.current.style.height = `${textboxRef.current.scrollHeight}px`;
	}

	return (
		<form noValidate onSubmit={handleSubmit} className="mw-100">
			<img src={placeHolderImageSrc} className="user-image" alt="user" />

			<div className="form-action-container">
				{isPostScheduled && schedulerData && (scheduleText())}
				<textarea
					value={text}
					ref={textboxRef}
					className="special-input"
					onChange={handleTextChange}
					placeholder="What's happening?"
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

				<ImgHolder removeImage={index => { spliceImage(index); }} images={uploadedFiles} />

				<div className={`${uploadedFiles.length > 0 ? "mt-3" : ''}`}>
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
						onClick={() => { setShowEmojiPicker(!showEmojiPicker); }}
					/>
					{
						showEmojiPicker && (
							<EmojiContainer
								callbackKey={"form-emoji-bar"}
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
						onClick={openPollCreator}
						style={{ opacity: (uploadedFiles.length || pollData) ? "0.4" : '1' }}
					/>

					<CIcon
						size="sm"
						title="Schedule"
						id="scheduler-icon"
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
							/>
						)
					}

					<div
						onClick={createPost}
						className="chirp-button"
						style={{ opacity: isFormValid && text ? '1' : "0.4" }}
					>
						{isPostScheduled ? "Schedule" : "Post"}
					</div>
				</div>
			</div>
		</form>
	);
};

export default Form;
