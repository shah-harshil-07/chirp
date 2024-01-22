import "src/styles/user/index.css";

import CIcon from "@coreui/icons-react";
import { cilArrowLeft } from "@coreui/icons";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "src/api";
import UserInfo from "./info";
import UserPosts from "./posts";
import * as Constants from "src/utilities/constants";
import { getCommonHeader } from "src/utilities/helpers";
import usePostServices from "src/custom-hooks/post-services";

const UserDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const headerData = getCommonHeader();
    const { getImageFetchingPromise } = usePostServices();

    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        getUserData();
        window.scrollTo(0, 0);
        // eslint-disable-next-line
    }, []);

    const getUserData = async () => {
        const response = await API(Constants.GET, `${Constants.GET_USER_DETAILS}/${userId}`, headerData);
        const responseData = response?.data ?? {};

        if (responseData?.meta?.status && responseData?.data) {
            const userData = responseData.data;
            setUserDetails({ ...userData });

            const pictureSuccessCallback = imageData => {
                userData["profile"] = userData["picture"];
                userData["picture"] = imageData;
                setUserDetails({ ...userData });
            }

            if (userData?.picture && !userData?.picture?.startsWith(Constants.httpsOrigin)) {
                getImageFetchingPromise(userData.picture, pictureSuccessCallback, "user");
            }

            const bgImgSuccessCallback = imageData => {
                userData["back"] = userData["backgroundImage"];
                userData["backgroundImage"] = imageData;
                setUserDetails({ ...userData });
            }

            if (userData?.backgroundImage && !userData?.backgroundImage?.startsWith(Constants.httpsOrigin)) {
                getImageFetchingPromise(userData.backgroundImage, bgImgSuccessCallback, "user");
            }
        }
    }

    const moveToHomePage = () => {
        navigate('/');
    }

    return (
        <div>
            <div className="common-header" id="user-header-box">
                <div className="common-heading-icon" onClick={moveToHomePage}>
                    <CIcon width={20} height={20} size="sm" icon={cilArrowLeft} />
                </div>

                <div className="common-heading-text">
                    {userDetails?.name ?? ''}
                    <div id="user-header-sub-text">
                        {userDetails?.totalPosts ?? 0} post{userDetails?.totalPosts > 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            <UserInfo details={userDetails} getterFn={getUserData} />
            <UserPosts userId={userId} />
        </div>
    );
};

export default UserDetails;
