import "src/styles/user/index.css";

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import API from "src/api";
import UserInfo from "./info";
import UserPosts from "./posts";
import * as Constants from "src/utilities/constants";
import { getCommonHeader } from "src/utilities/helpers";
import CIcon from "@coreui/icons-react";
import { cilArrowLeft } from "@coreui/icons";

const UserDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const headerData = getCommonHeader();

    const [posts, setPosts] = useState([]);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        getUserPosts();
        window.scrollTo(0, 0);
        // eslint-disable-next-line
    }, []);

    const getUserPosts = async () => {
        const response = await API(Constants.GET, `${Constants.GET_USER_POSTS}/${userId}`, headerData);
        const responseData = response?.data ?? {};

        if (responseData?.meta?.status && responseData?.data) {
            const { posts, userData } = responseData.data;
            const totalPosts = posts.length;
            setPosts([...posts]);
            setUserDetails({ ...userData, totalPosts });
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

            <UserInfo details={userDetails} />
            <UserPosts posts={posts} />
        </div>
    );
};

export default UserDetails;
