import React, { useEffect } from "react";

import UserInfo from "./info";
import UserPosts from "./posts";

const UserDetails = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div>
            <UserInfo />
            <UserPosts />
        </div>
    );
};

export default UserDetails;
