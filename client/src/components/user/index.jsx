import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import API from "src/api";
import UserInfo from "./info";
import UserPosts from "./posts";
import * as Constants from "src/utilities/constants";
import { getCommonHeader } from "src/utilities/helpers";

const UserDetails = () => {
    const { userId } = useParams();
    const headerData = getCommonHeader();

    const [posts, setPosts] = useState([]);
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        getUserPosts();
        window.scrollTo(0, 0);
    }, []);

    const getUserPosts = async () => {
        const response = await API(Constants.GET, `${Constants.GET_USER_POSTS}/${userId}`, headerData);
        const responseData = response?.data ?? {};

        if (responseData?.meta?.status && responseData?.data) {
            const { posts, userData } = responseData.data;
            setPosts([...posts]);
            setUserDetails({ ...userData });
        }
    }

    return (
        <div>
            <UserInfo details={userDetails} />
            <UserPosts posts={posts} />
        </div>
    );
};

export default UserDetails;
