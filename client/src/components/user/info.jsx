import "src/styles/user/info.css";
import "src/styles/signup-steps/create-account.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import React, { useEffect, useRef, useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";
import { cilCalendar, cilBirthdayCake, cilLink, cilLocationPin, cilCamera } from "@coreui/icons";

import CustomModal from "../utilities/custom-modal";
import CustomSelect from "../utilities/custom-select";
import LabelledInput from "../utilities/labelled-input";
import { placeHolderImageSrc } from "src/utilities/constants";
import DateOptionServices from "src/custom-hooks/date-services";
import useImageConverter from "src/custom-hooks/image-converter";
import LabelledInputTextarea from "../utilities/labelled-textarea";
import { getErrorMessage, getUserDetails, isUserLoggedIn, validate } from "src/utilities/helpers";

const UserInfo = ({ details }) => {
    const totalLineLength = 1040;
    let availableCoverage = totalLineLength;
    const { uploadImagesAction } = useImageConverter();
    const sampleUserImg = require("src/assets/sample-user.png");
    const profileImgRef = useRef(null), backImgRef = useRef(null);

    const loggedInUserData = isUserLoggedIn() ? getUserDetails() : null;
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

    const {
        value: location,
        clearSuggestions,
        setValue: setLocation,
        suggestions: { data },
    } = usePlacesAutocomplete({ debounce: 300 });

    const [userData, setUserData] = useState({});
    const [errors, setErrors] = useState({ name: '' });
    const [websiteLink, setWebsiteLink] = useState('#');
    const [isFormValid, setIsFormValid] = useState(true);
    const [statsList, setStatsList] = useState([..._statsList]);
    const [showProfileEditor, setShowProfileEditor] = useState(false);
    const [uploadedBackImgFile, setUploadedBackImgFile] = useState(null);
    const [uploadedProfileImgFile, setUploadedProfileImgFile] = useState(null);
    const [profileDetails, setProfileDetails] = useState({ ..._profileDetails });
    const [uploadedBackImgFileObject, setUploadedBackImgFileObject] = useState(null);
    const [uploadedProfileImgFileObject, setUploadedProfileImgFileObject] = useState(null);
    const [dayOfMonthOptions, setDayOfMonthOptions] = useState([...initialDayOfMonthOptions]);

    useEffect(() => {
        if (details) {
            setUserData({ ...details });
            updateStats();
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

    const openProfileEditor = () => {
        setShowProfileEditor(true);
    }

    const closeProfileEditor = () => {
        setShowProfileEditor(false);
    }

    const handleInputChange = (key, value) => {
        let _isFormValid = isFormValid;
        const _errors = { ...errors };
        if (key === "name" && validate("name", value)) {
            _errors["name"] = getErrorMessage("name");
            _isFormValid = false;
        } else {
            _errors["name"] = '';
            _isFormValid = true;
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

    const editProfileHeaderJSX = (
        <div className="w-100 row">
            <div className="col-sm-1 custom-close-div" onClick={closeProfileEditor}>
                <div className="custom-close-btn-container">
                    <span className="custom-close-btn">&times;</span>
                </div>
            </div>

            <div className="col-sm-11 user-info-profile-header">
                <b className="font-size-25">Edit profile</b>
                {isFormValid && <div id="user-info-profile-save-btn">Save</div>}
            </div>
        </div>
    );

    const handleLocationChange = value => {
        setLocation(value);
    }

    const handleLocationSelect = ({ description }) => () => {
		setLocation(description, false);
		clearSuggestions();
	};

	const renderSuggestions = () => {
		return data.map(suggestion => {
			const {
				place_id,
				structured_formatting: { main_text, secondary_text },
			} = suggestion;

            return {
                id: place_id,
                selectionObj: suggestion,
                text: `${main_text ?? ''}${main_text && secondary_text ? `, ${secondary_text}` : ''}`,
            };
		});
	}

    const handleImageUpload = (e, key) => {
        const isProfileKey = key === "profile";
        const fileStateChangeFn = isProfileKey ? setUploadedProfileImgFile : setUploadedBackImgFile;
        const fileStateObjChangeFn = isProfileKey ? setUploadedProfileImgFileObject : setUploadedBackImgFileObject;

        const readerLoadCallback = (e, fileObj) => {
            fileStateObjChangeFn(fileObj);
            fileStateChangeFn(e.target.result);
        };

        uploadImagesAction(e, readerLoadCallback, [], 1);
    }

    const editProfileBodyJSX = (
        <div className="w-100">
            <div id="user-info-back-img-container">
                <img
                    alt="background"
                    id="user-info-back-img"
                    src={uploadedBackImgFile ?? placeHolderImageSrc}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                />

                <CIcon
                    size="sm"
                    icon={cilCamera}
                    title="Upload background image"
                    id="user-info-user-back-img-uploader"
                    onClick={() => { backImgRef.current.click(); }}
                />

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
                    onError={e => { e.target.src = String(sampleUserImg); }}
                    src={uploadedProfileImgFile ?? userData?.picture ?? String(sampleUserImg)}
                />

                <CIcon
                    size="sm"
                    icon={cilCamera}
                    title="Upload profile image"
                    id="user-info-user-img-uploader"
                    onClick={() => { profileImgRef.current.click(); }}
                />

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
                    value={location}
                    name={"location"}
                    header={"Location"}
                    extraClasses={"mt-3"}
                    autoCompleteMode={true}
                    suggestions={renderSuggestions()}
                    handleChange={handleLocationChange}
                    handleOptionSelect={handleLocationSelect}
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
            <img alt="background" id="user-info-back-img" src={placeHolderImageSrc} />

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
        </div>
    );
};

export default UserInfo;
