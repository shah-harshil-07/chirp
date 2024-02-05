import "src/styles/user/info.css";

import moment from "moment";
import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { cilCalendar, cilBirthdayCake, cilLink, cilLocationPin } from "@coreui/icons";

import API from "src/api";
import Loader from "../utilities/loader";
import * as Constants from "src/utilities/constants";
import { openModalWithProps } from "src/redux/reducers/modal";
import { placeHolderImageSrc } from "src/utilities/constants";
import { openLighthouse } from "src/redux/reducers/lighthouse";
import useImageConverter from "src/custom-hooks/image-converter";
import { closeConfirmation, openConfirmation } from "src/redux/reducers/confirmation";
import { getCommonHeader, getUserDetails, isUserLoggedIn } from "src/utilities/helpers";

const UserInfo = ({ details, getterFn, isLoading, changeTheme, followUnfollowAction, mutuallyConnectedUsers }) => {
    const totalLineLength = 1040;
    const dispatch = useDispatch();
    const commonHeader = getCommonHeader();
    let availableCoverage = totalLineLength;
    const { getFileObjectFromBase64 } = useImageConverter();
    const sampleUserImg = require("src/assets/sample-user.png");

    const loggedInUserData = isUserLoggedIn() ? getUserDetails() : {};
    const { id: loggedUserId } = loggedInUserData;
    const isLoggedInUser = details?._id === loggedUserId;

    const currentDate = new Date();
    const preselectedDay = currentDate.getUTCDate();
    const preselectedMonth = currentDate.getUTCMonth();
    const preselectedYear = currentDate.getFullYear() - 5;
    const _profileDetails = {
        id: '',
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
    const [websiteLink, setWebsiteLink] = useState('#');
    const [isFollowing, setIsFollowing] = useState(false);
    const [statsList, setStatsList] = useState([..._statsList]);
    const [uploadedBackImgFile, setUploadedBackImgFile] = useState(null);
    const [uploadedProfileImgFile, setUploadedProfileImgFile] = useState(null);
    const [profileDetails, setProfileDetails] = useState({ ..._profileDetails });
    const [uploadedBackImgFileObject, setUploadedBackImgFileObject] = useState(null);
    const [mutuallyConnectedUserNameList, setMutuallyConnectedUserNameList] = useState('');
    const [uploadedProfileImgFileObject, setUploadedProfileImgFileObject] = useState(null);

    useEffect(() => {
        if (details) {
            updateStats();
            updateProfileDetails();
            setUserData({ ...details });
            checkUserFollowing(details._id);

            if (details.picture) {
                const { picture } = details;
                setUploadedProfileImgFile(picture);
                if (picture?.startsWith(Constants.base64Prefix)) {
                    const base64ImgData = picture.replaceAll(Constants.base64Prefix, '');
                    setUploadedProfileImgFileObject(getFileObjectFromBase64(base64ImgData));
                }
            }

            if (details.backgroundImage) {
                const { backgroundImage } = details;
                setUploadedBackImgFile(backgroundImage);
                if (backgroundImage?.startsWith(Constants.base64Prefix)) {
                    const base64ImgData = backgroundImage.replaceAll(Constants.base64Prefix, '');
                    setUploadedBackImgFileObject(getFileObjectFromBase64(base64ImgData));
                }
            }
        }

        // eslint-disable-next-line
    }, [details]);

    useEffect(() => {
        const names = mutuallyConnectedUsers?.map(user => user?.name ?? '')?.filter(userName => Boolean(userName)) ?? [];
        const commaSeparatedNames = names.join(', ');
        setMutuallyConnectedUserNameList(commaSeparatedNames);
    }, [mutuallyConnectedUsers]);

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
                        value = value.replaceAll(Constants.WEBLINK_ORIGIN_REGEX, '');
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

    const checkUserFollowing = userId => {
        if (userId && userId !== loggedUserId) {
            const url = `${Constants.CHECK_USER_FOLLOWING}/${userId}`;

            API(Constants.GET, url, null, commonHeader).then(({ data: response }) => {
                let { follows } = response?.data ?? {};
                if (typeof follows !== "boolean") follows = Boolean(follows);
                setIsFollowing(follows);
            });
        }
    }

    const updateProfileDetails = () => {
        const momentDoB = moment(details?.dateOfBirth);
        const day = isNaN(momentDoB.date()) ? preselectedDay : momentDoB.date();
        const year = isNaN(momentDoB.year()) ? preselectedYear : momentDoB.year();
        const month = isNaN(momentDoB.month()) ? preselectedMonth : momentDoB.month();

        setProfileDetails({
            ...profileDetails,
            id: details?._id ?? '',
            bio: details?.bio ?? '',
            name: details?.name ?? '',
            location: details?.location ?? '',
            dateOfBirth: { year, month, day },
            website: details?.website?.replace(/https:\/\//ig, '') ?? '',
        });
    }

    const openProfileEditor = e => {
        e.preventDefault();

        const data = {
            getterFn,
            generalDetails: details,
            userId: details?._id ?? '',
            backImgFile: uploadedBackImgFile,
            profileImgFile: uploadedProfileImgFile,
            backImgFileObj: uploadedBackImgFileObject,
            profileImgFileObj: uploadedProfileImgFileObject,
        };

        dispatch(openModalWithProps({ type: "profileEditor", props: data }));
    }

    const zoomImage = (e, imgSrc) => {
        e.stopPropagation();
        dispatch(openLighthouse({ images: [imgSrc], initialIndex: 0 }));
    }

    const handleUnfollowAction = e => {
        const confirmationProps = {
            headingText: "Unfollow",
            message: "Are you sure you want to unfollow the user?",
            handleConfirmAction: () => {
                setIsFollowing(false);
                followUnfollowAction(e, profileDetails.id, false);
                dispatch(closeConfirmation());
            }
        };

        dispatch(openConfirmation(confirmationProps));
    }

    const handleFollowAction = e => {
        setIsFollowing(true);
        followUnfollowAction(e, profileDetails.id, true);
    }

    return (
        <div>
            {isLoading && <Loader />}
            <img
                alt="background"
                id="user-info-back-img"
                src={userData?.backgroundImage ?? String(placeHolderImageSrc)}
                onError={e => { e.target.src = String(placeHolderImageSrc); }}
                onClick={e => { if (userData?.backgroundImage) zoomImage(e, userData.backgroundImage); }}
            />

            <div
                title={`click to ${isFollowing ? "unfollow" : "follow"}`}
                id={isLoggedInUser || isFollowing ? "user-info-profile-editor-btn" : "user-info-follow-btn"}
                onClick={e => {
                    if (isLoggedInUser) openProfileEditor(e);
                    else isFollowing ? handleUnfollowAction(e) : handleFollowAction(e);
                }}
            >
                <b>{isLoggedInUser ? "Edit profile" : isFollowing ? "Following" : "Follow"}</b>
            </div>

            <div id="user-info-user-img-container">
                <img
                    alt={"user"}
                    id="user-info-user-img"
                    src={userData?.picture ?? String(sampleUserImg)}
                    onError={e => { e.target.src = String(sampleUserImg); }}
                    onClick={e => { if (userData?.picture) zoomImage(e, userData.picture); }}
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
                    <div className="mr-2 user-follower-data" onClick={() => { changeTheme("following"); }}>
                        <b>{userData?.following ?? 0}</b>&nbsp;Following
                    </div>

                    <div className="ml-2 user-follower-data" onClick={() => { changeTheme("followers"); }}>
                        <b>{userData?.followers ?? 0}</b>&nbsp;Followers
                    </div>
                </div>

                {
                    mutuallyConnectedUserNameList && (
                        <div>Followed by <b>{mutuallyConnectedUserNameList}</b></div>
                    )
                }
            </div>
        </div>
    );
};

export default UserInfo;
