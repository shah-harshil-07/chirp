import "src/styles/user/info.css";
import "src/styles/signup-steps/create-account.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import React, { useEffect, useRef, useState } from "react";
import { cilCalendar, cilBirthdayCake, cilLink, cilLocationPin, cilCamera, cilTrash } from "@coreui/icons";

import API from "src/api";
import Loader from "../utilities/loader";
import CustomModal from "../utilities/custom-modal";
import Confirmation from "../utilities/confirmation";
import * as Constants from "src/utilities/constants";
import CustomSelect from "../utilities/custom-select";
import LabelledInput from "../utilities/labelled-input";
import useToaster from "src/custom-hooks/toaster-message";
import { placeHolderImageSrc } from "src/utilities/constants";
import DateOptionServices from "src/custom-hooks/date-services";
import useImageConverter from "src/custom-hooks/image-converter";
import LabelledInputTextarea from "../utilities/labelled-textarea";
import { getCommonHeader, getErrorMessage, getUserDetails, isUserLoggedIn, validate } from "src/utilities/helpers";

const UserInfo = ({ details, getterFn, isLoading }) => {
    const totalLineLength = 1040;
    const commonHeader = getCommonHeader();
    let availableCoverage = totalLineLength;
    const { showSuccess, showError } = useToaster();
    const sampleUserImg = require("src/assets/sample-user.png");
    const profileImgRef = useRef(null), backImgRef = useRef(null);
    const { uploadImagesAction, getFileObjectFromBase64 } = useImageConverter();

    const loggedInUserData = isUserLoggedIn() ? getUserDetails() : {};
    const { id: loggedUserId } = loggedInUserData;
    const isLoggedInUser = details?._id === loggedUserId;

    const dateService = new DateOptionServices();
    const yearOptions = dateService.getYearOptions();
    const monthOptions = dateService.getMonthOptions();

    const currentDate = new Date();
    const preselectedDay = currentDate.getUTCDate();
    const preselectedMonth = currentDate.getUTCMonth();
    const preselectedYear = currentDate.getFullYear() - 5;
    const initialDayOfMonthOptions = dateService.getDayOfMonthOptions(preselectedMonth, preselectedYear);
    const _profileDetails = {
        bio: '',
        name: '',
        website: '',
        location: '',
        dateOfBirth: {
            day: preselectedDay,
            year: preselectedYear,
            month: preselectedMonth,
        },
    };

    const _statsList = [
        { icon: cilLink, serverKey: "website", text: '' },
        { icon: cilCalendar, serverKey: "createdAt", text: '' },
        { icon: cilLocationPin, serverKey: "location", text: '' },
        { icon: cilBirthdayCake, serverKey: "dateOfBirth", text: '' },
    ];

    const [userData, setUserData] = useState({});
    const [errors, setErrors] = useState({ name: '' });
    const [websiteLink, setWebsiteLink] = useState('#');
    const [isFormValid, setIsFormValid] = useState(true);
    const [isNewBackImg, setIsNewBackImg] = useState(false);
    const [selectedImgKey, setSelectedImgKey] = useState('');
    const [statsList, setStatsList] = useState([..._statsList]);
    const [isNewProfileImg, setIsNewProfileImg] = useState(false);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [uploadedBackImgFile, setUploadedBackImgFile] = useState(null);
    const [showBackImgUploader, setShowBackImgUploader] = useState(true);
    const [uploadedProfileImgFile, setUploadedProfileImgFile] = useState(null);
    const [showProfileImgUploader, setShowProfileImgUploader] = useState(true);
    const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState(false);
    const [profileDetails, setProfileDetails] = useState({ ..._profileDetails });
    const [uploadedBackImgFileObject, setUploadedBackImgFileObject] = useState(null);
    const [uploadedProfileImgFileObject, setUploadedProfileImgFileObject] = useState(null);
    const [dayOfMonthOptions, setDayOfMonthOptions] = useState([...initialDayOfMonthOptions]);

    useEffect(() => {
        if (details) {
            setUserData({ ...details });
            updateStats();
            updateProfileDetails();

            if (details.picture) {
                const { picture } = details;
                setShowProfileImgUploader(true);
                setUploadedProfileImgFile(picture);
                if (picture?.startsWith(Constants.base64Prefix)) {
                    const base64ImgData = picture.replaceAll(Constants.base64Prefix, '');
                    setUploadedProfileImgFileObject(getFileObjectFromBase64(base64ImgData));
                }
            }

            if (details.backgroundImage) {
                const { backgroundImage } = details;
                setUploadedBackImgFile(backgroundImage);
                setShowBackImgUploader(true);
                if (backgroundImage?.startsWith(Constants.base64Prefix)) {
                    const base64ImgData = backgroundImage.replaceAll(Constants.base64Prefix, '');
                    setUploadedBackImgFileObject(getFileObjectFromBase64(base64ImgData));
                }
            }
        }

        // eslint-disable-next-line
    }, [details]);

    const formatDisplayedDate = date => {
        return moment(date).format("MMM Do, YYYY");
    }

    const updateStats = () => {
        const updatedStatsList = [];

        _statsList.forEach(statsObj => {
            const { icon, serverKey } = statsObj;
            let value = details[serverKey];

            if (value) {
                switch (serverKey) {
                    case "dateOfBirth":
                        value = `Born ${formatDisplayedDate(value)}`;
                        break;
                    case "createdAt":
                        value = `Joined on ${formatDisplayedDate(value)}`;
                        break;
                    case "website":
                        setWebsiteLink(value);
                        value = value.replaceAll(/https:\/\/|www./g, '');
                        if (value.length > 30) value = `${value.slice(0, 28)}...`;
                        break;
                    default:
                        break;
                }

                updatedStatsList.push({ icon, serverKey, text: value });
            }
        });

        setStatsList([...updatedStatsList]);
    }

    const updateProfileDetails = () => {
        const momentDoB = moment(details?.dateOfBirth);
        const day = isNaN(momentDoB.date()) ? preselectedDay : momentDoB.date();
        const year = isNaN(momentDoB.year()) ? preselectedYear : momentDoB.year();
        const month = isNaN(momentDoB.month()) ? preselectedMonth : momentDoB.month();

        setProfileDetails({
            ...profileDetails,
            bio: details?.bio ?? '',
            name: details?.name ?? '',
            website: details?.website ?? '',
            location: details?.location ?? '',
            dateOfBirth: { year, month, day },
        });
    }

    const openProfileEditor = () => {
        setShowProfileEditor(true);
    }

    const closeProfileEditor = () => {
        setShowProfileEditor(false);
    }

    const handleInputChange = (key, value) => {
        let _isFormValid = isFormValid;
        const _errors = { ...errors };
        if (key === "name") {
            if (!value) {
                _isFormValid = false;
                _errors["name"] = "name is required";
            } else if (validate("name", value)) {
                _isFormValid = false;
                _errors["name"] = getErrorMessage("name");
            } else {
                _errors["name"] = '';
                _isFormValid = true;
            }
        }

        setErrors({ ..._errors });
        setIsFormValid(_isFormValid);
        setProfileDetails({ ...profileDetails, [key]: value });
    }

    const handleDobChange = (key, value) => {
        const { dateOfBirth } = profileDetails;
        dateOfBirth[key] = value;

        if (key === "month" || key === "year") {
            const { month, year } = dateOfBirth;
            const _dayOfMonthOptions = dateService.getDayOfMonthOptions(+month, +year);
            dateOfBirth["day"] = 1;
            setDayOfMonthOptions([..._dayOfMonthOptions]);
        }

        setProfileDetails({ ...profileDetails, dateOfBirth });
    }

    const handleDetailsUpdate = e => {
        e.preventDefault();

        if (isFormValid && details?._id) {
            const formData = new FormData();
            const { dateOfBirth } = profileDetails ?? {};
            const { day, month, year } = dateOfBirth ?? {};

            let monthValue = +(month ?? preselectedMonth) + 1;
            monthValue = monthValue < 10 ? `0${monthValue}` : String(monthValue);

            let dayValue = day ?? preselectedDay;
            dayValue = dayValue < 10 ? `0${dayValue}` : String(dayValue);

            const strDateOfBirth = `${year ?? preselectedYear}-${monthValue}-${dayValue}`;

            formData.set("name", profileDetails?.name ?? '');
            formData.set("bio", profileDetails?.bio ?? '');
            formData.set("website", profileDetails?.website ?? '');
            formData.set("location", profileDetails?.location ?? '');
            formData.set("dateOfBirth", strDateOfBirth);

            if (uploadedProfileImgFileObject) {
                formData.set("picture", uploadedProfileImgFileObject);
            }

            if (uploadedBackImgFileObject) {
                formData.set("backgroundImage", uploadedBackImgFileObject);
            }

            submitUserDetails(formData);
        }
    }

    const submitUserDetails = async formData => {
        const url = `${Constants.UPDATE_USER_DETAILS}/${details._id}`;
        const { data: response } = await API(Constants.POST, url, formData, commonHeader);

        if (response?.meta?.status) {
            const message = response?.meta?.message ?? "Details updated successfully!";
            showSuccess(message);
            setShowProfileEditor(false);
            getterFn();
        } else {
            const message = response?.errors?.message ?? response?.meta?.message ?? "Something went wrong!";
            if (Array.isArray(message)) {
                let finalMessage = '';
                message.forEach(msgStr => finalMessage += msgStr);
                showError(finalMessage);
            } else {
                showError(message);
            }
        }
    }

    const editProfileHeaderJSX = (
        <div className="w-100 row">
            <div className="col-sm-1 custom-close-div" onClick={closeProfileEditor}>
                <div className="custom-close-btn-container">
                    <span className="custom-close-btn">&times;</span>
                </div>
            </div>

            <div className="col-sm-11 user-info-profile-header">
                <b className="font-size-25">Edit profile</b>
                {isFormValid && <div onClick={handleDetailsUpdate} id="user-info-profile-save-btn">Save</div>}
            </div>
        </div>
    );

    const handleImageUpload = (e, key) => {
        const isProfileKey = key === "profile";
        const isNewChangeFn = isProfileKey ? setIsNewProfileImg : setIsNewBackImg;
        const fileStateChangeFn = isProfileKey ? setUploadedProfileImgFile : setUploadedBackImgFile;
        const fileStateObjChangeFn = isProfileKey ? setUploadedProfileImgFileObject : setUploadedBackImgFileObject;

        const readerLoadCallback = (e, fileObj) => {
            isNewChangeFn(true);
            fileStateObjChangeFn(fileObj);
            fileStateChangeFn(e.target.result);
        };

        uploadImagesAction(e, readerLoadCallback, [], 1);
    }

    const handleImgAction = key => {
        const isProfileKey = key === "profile";
        const refObj = isProfileKey ? profileImgRef : backImgRef;
        const isNewChange = isProfileKey ? isNewProfileImg : isNewBackImg;
        const file = isProfileKey ? uploadedProfileImgFile : uploadedBackImgFile;
        const fileChangeFn = isProfileKey ? setUploadedProfileImgFile : setUploadedBackImgFile;
        const fileObjChangeFn = isProfileKey ? setUploadedProfileImgFileObject : setUploadedBackImgFileObject;

        if (file) {
            if (isNewChange) {
                fileChangeFn(null);
                fileObjChangeFn(null);
            } else {
                setSelectedImgKey(key);
                setOpenDeleteConfirmation(true);
            }
        } else {
            refObj.current.click();
        }
    }

    const confirmDeleteImage = async () => {
        if (selectedImgKey) {
            setOpenDeleteConfirmation(false);
            const url = `${Constants.DELETE_USER_IMAGE}/${details._id}`;
            const data = {
                fileName: details[selectedImgKey],
                imageType: selectedImgKey === "profile" ? "picture" : "backgroundImage",
            };

            const { data: response } = await API(Constants.DELETE, url, data, commonHeader);

            let message = '', alertFn = showError;
            if (response?.meta?.status) {
                alertFn = showSuccess;
                message = response?.meta?.message ?? "Image deleted successfully.";

                const isProfileKey = selectedImgKey === "profile";
                const fileChangeFn = isProfileKey ? setUploadedProfileImgFile : setUploadedBackImgFile;
                const fileObjChangeFn = isProfileKey ? setUploadedProfileImgFileObject : setUploadedBackImgFileObject;
                fileChangeFn(null); fileObjChangeFn(null);
            } else if (Array.isArray(response?.errors?.message)) {
                message = response?.errors?.message?.join(', ');
                if (!message) message = "Something went wrong!";
            } else {
                message = response?.meta?.message ?? "Something went wrong!";
            }

            alertFn(message);
        }
    }

    const editProfileBodyJSX = (
        <div className="w-100">
            <div id="user-info-back-img-container">
                <img
                    alt="background"
                    id="user-info-back-img"
                    src={uploadedBackImgFile ?? placeHolderImageSrc}
                    onError={e => {
                        e.target.src = placeHolderImageSrc;
                        if (uploadedBackImgFile) setShowBackImgUploader(false);
                    }}
                />

                {
                    showBackImgUploader && (
                        <CIcon
                            size="sm"
                            id="user-info-user-back-img-uploader"
                            onClick={() => { handleImgAction("back"); }}
                            icon={uploadedBackImgFile ? cilTrash : cilCamera}
                            style={{ color: uploadedBackImgFile ? "red" : '' }}
                            title={`${uploadedBackImgFile ? "Delete" : "Upload"} background image`}
                        />
                    )
                }

                <input
                    type="file"
                    accept="image/*"
                    ref={backImgRef}
                    className="d-none"
                    onChange={e => { handleImageUpload(e, "back"); }}
                />
            </div>

            <div id="user-info-user-img-container">
                <img
                    alt={"user"}
                    id="user-info-user-img"
                    src={uploadedProfileImgFile ?? String(sampleUserImg)}
                    onError={e => {
                        e.target.src = String(sampleUserImg);
                        if (uploadedProfileImgFile) setShowProfileImgUploader(false);
                    }}
                />

                {
                    showProfileImgUploader && (
                        <CIcon
                            size="sm"
                            id="user-info-user-img-uploader"
                            onClick={() => { handleImgAction("profile"); }}
                            icon={uploadedProfileImgFile ? cilTrash : cilCamera}
                            style={{ color: uploadedProfileImgFile ? "red" : '' }}
                            title={`${uploadedProfileImgFile ? "Delete" : "Upload"} profile image`}
                        />
                    )
                }

                <input
                    type="file"
                    accept="image/*"
                    className="d-none"
                    ref={profileImgRef}
                    onChange={e => { handleImageUpload(e, "profile"); }}
                />
            </div>

            <div id="user-info-profile-editor-body">
                <LabelledInput
                    name={"name"}
                    header={"Name"}
                    value={profileDetails["name"]}
                    handleChange={value => { handleInputChange("name", value); }}
                />
                <p className="text-danger create-account-text">{errors["name"]}</p>

                <LabelledInputTextarea
                    name={"bio"}
                    header={"Bio"}
                    bodyClasses={"mt-3"}
                    value={profileDetails["bio"]}
                    handleChange={value => { handleInputChange("bio", value); }}
                />

                <LabelledInput
                    name={"location"}
                    header={"Location"}
                    extraClasses={"mt-3"}
                    value={profileDetails["location"]}
                    handleChange={value => { handleInputChange("location", value); }}
                />

                <LabelledInput
                    name={"website"}
                    header={"Website"}
                    extraClasses={"mt-3"}
                    value={profileDetails["website"]}
                    handleChange={value => { handleInputChange("website", value); }}
                />

                <div className="mt-3" id="user-info-profile-dob-box">
                    <div id="user-info-profile-dob-text">Date of Birth</div>

                    <CustomSelect
                        label={"Day"}
                        options={dayOfMonthOptions}
                        divClass={"user-info-day-select"}
                        selectedValue={profileDetails.dateOfBirth.day}
                        handleValueChange={value => { handleDobChange("day", value); }}
                    />

                    <CustomSelect
                        label={"Month"}
                        options={monthOptions}
                        divClass={"user-info-month-select"}
                        selectedValue={profileDetails.dateOfBirth.month}
                        handleValueChange={value => { handleDobChange("month", value); }}
                    />

                    <CustomSelect
                        label={"Year"}
                        options={yearOptions}
                        divClass={"user-info-year-select"}
                        selectedValue={profileDetails.dateOfBirth.year}
                        handleValueChange={value => { handleDobChange("year", value); }}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div>
            {isLoading && <Loader />}
            <img
                alt="background"
                id="user-info-back-img"
                src={userData?.backgroundImage ?? String(placeHolderImageSrc)}
                onError={e => { e.target.src = String(placeHolderImageSrc); }}
            />

            <div
                onClick={e => { if (isLoggedInUser) openProfileEditor(e); }}
                id={isLoggedInUser ? "user-info-profile-editor-btn" : "user-info-follow-btn"}
            >
                <b>{isLoggedInUser ? "Edit profile" : "Follow"}</b>
            </div>

            <div id="user-info-user-img-container">
                <img
                    alt={"user"}
                    id="user-info-user-img"
                    src={userData?.picture ?? String(sampleUserImg)}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                />
            </div>

            <div id="user-info-body">
                <p id="user-info-username-text">{userData?.name ?? ''}</p>
                {userData?.username ? `@${userData.username}` : ''}

                {userData?.bio && <p id="user-info-bio-text">{userData.bio}</p>}

                <p className="font-size-16 mt-3">
                    {
                        statsList.map((statsObj, statsIndex) => {
                            let { icon, text, serverKey } = statsObj;

                            if ((text.length * 16) > totalLineLength) {
                                text = text.slice(0, 66) + "...";
                            }

                            const n = text.length;
                            let currentCoverage = (n + 1) * 16, addBreak = false;
                            currentCoverage += (statsIndex < _statsList.length - 1) ? 32 : 0;

                            if (currentCoverage > availableCoverage) {
                                addBreak = true;
                                availableCoverage = totalLineLength - currentCoverage;
                            } else {
                                availableCoverage -= currentCoverage;
                            }

                            return (
                                <React.Fragment key={statsIndex}>
                                    {addBreak && statsIndex > 0 && <br />}
                                    <CIcon size="sm" icon={icon} className="user-info-stat-icon" />
                                    <span title={serverKey === "website" && details?.website ? details.website : ''}>
                                        &nbsp;
                                        {
                                            serverKey === "website" && websiteLink ? (
                                                <a className="span-link" href={websiteLink}>{text ?? ''}</a>
                                            ) : (
                                                <>{text ?? ''}</>
                                            )
                                        }
                                        &nbsp;&nbsp;
                                    </span>
                                </React.Fragment>
                            );
                        })
                    }
                </p>

                <div className="d-flex justify-content-start">
                    <div className="mr-2"><b>{userData?.following ?? 0}</b>&nbsp;Following</div>
                    <div className="ml-2"><b>{userData?.followers ?? 0}</b>&nbsp;Followers</div>
                </div>
            </div>

            {
                showProfileEditor && (
                    <CustomModal
                        includeHeader={true}
                        displayOverflow={true}
                        bodyJSX={editProfileBodyJSX}
                        bodyClasses={"ml-0 mr-0 p-0 mt-4"}
                        customHeaderJSX={editProfileHeaderJSX}
                    />
                )
            }

            {
                openDeleteConfirmation && (
                    <Confirmation
                        headingText={"Delete"}
                        handleConfirmAction={confirmDeleteImage}
                        message={`Are you sure you want to delete the image?`}
                        handleCloseAction={() => { setOpenDeleteConfirmation(false); }}
                    />
                )
            }
        </div>
    );
};

export default UserInfo;
