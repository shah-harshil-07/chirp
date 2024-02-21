import "src/styles/user/info.css";

import React, { useEffect, useState } from "react";

import * as Constants from "src/utilities/constants";
import usePostServices from "src/custom-hooks/post-services";

const MutualConnections = ({ users, handleMutualConnDisplay }) => {
    const { moveToUserPage } = usePostServices();

    const [totalUsers, setTotalUsers] = useState(0);
    const [displayedUsers, setDisplayedUsers] = useState([]);

    useEffect(() => {
        const limit = Constants.mutualConnectionFrontLimit;
        setTotalUsers(users?.length ?? 0);
        setDisplayedUsers([...users?.slice(0, limit)]);
    }, [users]);

    const printNameSeparator = userIndex => {
        const n = users.length;
        if (userIndex > 0) return userIndex === n - 1 ? <> and </> : <>, </>;
        return <></>;
    }

    return displayedUsers?.length > 0 ? (
        <div>
            Followed by&nbsp;
            {
                displayedUsers?.map((userObj, userIndex) => {
                    const { name, _id: userId } = userObj ?? {};

                    return name ? (
                        <React.Fragment key={userId}>
                            {printNameSeparator(userIndex)}
                            <span
                                title="Go to details"
                                className="user-info-mutual-connector"
                                onClick={e => { moveToUserPage(e, userId); }}
                            >
                                {name}
                            </span>
                        </React.Fragment>
                    ) : (
                        <></>
                    );
                })
            }
            &nbsp;

            {
                totalUsers > users.length && (
                    <span className="user-info-mutual-connector" onClick={handleMutualConnDisplay}>
                        +{totalUsers - displayedUsers.length} more
                    </span>
                )
            }
        </div>
    ) : (
        <></>
    );
};

export default MutualConnections;
