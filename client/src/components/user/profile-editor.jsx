import "src/styles/user/info.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import { cilCamera, cilTrash } from "@coreui/icons";
import React, { useEffect, useState, useRef } from "react";

import API from "src/api";
import CustomModal from "../utilities/custom-modal";
import * as Constants from "src/utilities/constants";
import CustomSelect from "../utilities/custom-select";
import { closeModal } from "src/redux/reducers/modal";
import { getCommonHeader } from "src/utilities/helpers";
import LabelledInput from "../utilities/labelled-input";
import useToaster from "src/custom-hooks/toaster-message";
import { placeHolderImageSrc } from "src/utilities/constants";
import DateOptionServices from "src/custom-hooks/date-services";
import useImageConverter from "src/custom-hooks/image-converter";
import { getErrorMessage, validate } from "src/utilities/helpers";
import LabelledInputTextarea from "../utilities/labelled-textarea";
import { closeConfirmation, openConfirmation } from "src/redux/reducers/confirmation";

const ProfileEditor = ({
    userId,
    getterFn,
    backImgFile,
    generalDetails,
    profileImgFile,
    backImgFileObj,
    profileImgFileObj,
}) => {
    const dispatch = useDispatch();
    const commonHeader = getCommonHeader();
    const { showError, showSuccess } = useToaster();
    const { uploadImagesAction } = useImageConverter();
    const sampleUserImg = require("src/assets/sample-user.png");
    const profileImgRef = useRef(null), backImgRef = useRef(null);

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

    const [errors, setErrors] = useState({ name: '' });
    const [isFormValid, setIsFormValid] = useState(true);
    const [isNewBackImg, setIsNewBackImg] = useState(false);
    const [selectedImgKey, setSelectedImgKey] = useState('');
    const [openCustomModal, setOpenCustomModal] = useState(false);
    const [isNewProfileImg, setIsNewProfileImg] = useState(false);
    const [uploadedBackImgFile, setUploadedBackImgFile] = useState(null);
    const [showBackImgUploader, setShowBackImgUploader] = useState(true);
    const [profileDetailsUpdated, setProfileDetailsUpdated] = useState(false);
    const [showProfileImgUploader, setShowProfileImgUploader] = useState(true);
    const [uploadedProfileImgFile, setUploadedProfileImgFile] = useState(null);
    const [profileDetails, setProfileDetails] = useState({ ..._profileDetails });
    const [uploadedBackImgFileObject, setUploadedBackImgFileObject] = useState(null);
    const [uploadedProfileImgFileObject, setUploadedProfileImgFileObject] = useState(null);
    const [dayOfMonthOptions, setDayOfMonthOptions] = useState([...initialDayOfMonthOptions]);

    useEffect(() => {
        updateProfileDetails();
        setUploadedBackImgFile(backImgFile);
        setUploadedProfileImgFile(profileImgFile);
        setUploadedBackImgFileObject(backImgFileObj);
        setUploadedProfileImgFileObject(profileImgFileObj);

        // eslint-disable-next-line
    }, [backImgFile, profileImgFile, backImgFileObj, profileImgFileObj]);

    useEffect(() => {
        if (profileDetailsUpdated && profileDetails) setOpenCustomModal(true);
    }, [profileDetailsUpdated, profileDetails]);

    useEffect(() => {
        if (selectedImgKey) {
            const confirmationProps = {
                headingText: "Delete",
                handleConfirmAction: confirmDeleteImage,
                message: "Are you sure you want to delete the image?",
            };

            dispatch(openConfirmation(confirmationProps));
        }

        // eslint-disable-next-line
    }, [selectedImgKey]);

    const updateProfileDetails = () => {
        const momentDoB = moment(generalDetails?.dateOfBirth);
        const day = isNaN(momentDoB.date()) ? preselectedDay : momentDoB.date();
        const year = isNaN(momentDoB.year()) ? preselectedYear : momentDoB.year();
        const month = isNaN(momentDoB.month()) ? preselectedMonth : momentDoB.month();

        setProfileDetails({
            ...profileDetails,
            bio: generalDetails?.bio ?? '',
            name: generalDetails?.name ?? '',
            dateOfBirth: { year, month, day },
            location: generalDetails?.location ?? '',
            website: generalDetails?.website?.replace(/https:\/\//ig, '') ?? '',
        });

        setProfileDetailsUpdated(true);
    }

    const handleImgAction = key => {
        const isProfileKey = key === "profile";
        const refObj = isProfileKey ? profileImgRef : backImgRef;
        const isNewChange = isProfileKey ? isNewProfileImg : isNewBackImg;
        const file = isProfileKey ? uploadedProfileImgFile : uploadedBackImgFile;
        const fileChangeFn = isProfileKey ? setUploadedProfileImgFile : setUploadedBackImgFile;
        const fileObjChangeFn = isProfileKey ? setUploadedProfileImgFileObject : setUploadedBackImgFileObject;

        if (file && isNewChange) {
            fileChangeFn(null);
            fileObjChangeFn(null);
        } else if (file) {
            setSelectedImgKey(key);
        } else {
            refObj.current.click();
        }
    }

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

    const closeProfileEditor = () => {
        dispatch(closeModal());
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

    const handleDetailsUpdate = e => {
        e.preventDefault();

        if (isFormValid && userId) {
            const formData = new FormData();
            const { httpsOrigin } = Constants;
            const { dateOfBirth, name, bio, website, location } = profileDetails ?? {};
            const { day, month, year } = dateOfBirth ?? {};

            let monthValue = +(month ?? preselectedMonth) + 1;
            monthValue = monthValue < 10 ? `0${monthValue}` : String(monthValue);

            let dayValue = day ?? preselectedDay;
            dayValue = dayValue < 10 ? `0${dayValue}` : String(dayValue);

            const strDateOfBirth = `${year ?? preselectedYear}-${monthValue}-${dayValue}`;
            let websiteLink = website.startsWith(httpsOrigin) ? website : website ? (httpsOrigin + website) : '';

            formData.set("bio", bio ?? '');
            formData.set("name", name ?? '');
            formData.set("location", location ?? '');
            formData.set("website", websiteLink ?? '');
            formData.set("dateOfBirth", strDateOfBirth);

            if (uploadedProfileImgFileObject) formData.set("picture", uploadedProfileImgFileObject);
            if (uploadedBackImgFileObject) formData.set("backgroundImage", uploadedBackImgFileObject);

            submitUserDetails(formData);
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

    const submitUserDetails = async formData => {
        const url = `${Constants.UPDATE_USER_DETAILS}/${userId}`;
        const { data: response } = await API(Constants.POST, url, formData, commonHeader);

        if (response?.meta?.status) {
            const message = response?.meta?.message ?? "Details updated successfully!";
            showSuccess(message);
            closeProfileEditor();
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

    const confirmDeleteImage = async () => {
        if (selectedImgKey) {
            dispatch(closeConfirmation());
            const url = `${Constants.DELETE_USER_IMAGE}/${userId}`;
            const data = {
                fileName: generalDetails[selectedImgKey],
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

    return openCustomModal ? (
        <CustomModal
            includeHeader={true}
            displayOverflow={true}
            bodyJSX={editProfileBodyJSX}
            bodyClasses={"ml-0 mr-0 p-0 mt-4"}
            customHeaderJSX={editProfileHeaderJSX}
        />
    ) : (
        <></>
    );
};

export default ProfileEditor;
