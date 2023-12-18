import "src/styles/utilities/user-card.css";

import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { placeHolderImageSrc } from "src/utilities/constants";
import { checkContainerInViewport } from "src/utilities/helpers";
import { closeDetailsCard } from "src/redux/reducers/user-details";

const UserCard = () => {
    const cardRef = useRef(null);
    const dispatch = useDispatch();
    const userDetailState = useSelector(state => state.userDetails);
    const userData = userDetailState?.data ?? {};
    let { left, top } = userData?.coordinates ?? {};

    const [finalTop, setFinalTop] = useState(top);
    const [finalLeft, setFinalLeft] = useState(left);

    useEffect(() => {
        setFinalTop(top);
        setFinalLeft(left);
        // eslint-disable-next-line
    }, [userDetailState]);

    useLayoutEffect(() => {
        const cardRect = cardRef?.current?.getBoundingClientRect() ?? null;
        if (cardRect && !checkContainerInViewport(cardRect)) {
            const { height } = cardRect;
            setFinalTop(top - height);
            // eslint-disable-next-line
            top -= height;
        }

        // eslint-disable-next-line
    }, []);

    const closeUserCard = () => {
        dispatch(closeDetailsCard());
    }

    return (
        <div id="user-card-body" onMouseLeave={closeUserCard} ref={cardRef} style={{ left: finalLeft, top: finalTop }}>
            <div className="d-flex justify-content-between">
                <img
                    alt="user"
                    className="user-card-header-img"
                    src={userData?.picture ?? placeHolderImageSrc}
                    onError={e => { e.target.src = placeHolderImageSrc }}
                />

                <div className="user-card-header-follow-btn">Follow</div>
            </div>

            {
                (userData?.name || userData?.username) && (
                    <div>
                        {userData?.name && <b>{userData.name}</b>}
                        {userData?.username && <p>@{userData.username}</p>}
                    </div>
                )
            }

            {userData?.bio && <p>{userData.bio}</p>}

            <div className="d-flex justify-content-around">
                <div><b>{userData?.following ?? 0}</b>&nbsp;Following</div>
                <div><b>{userData?.followers ?? 0}</b>&nbsp;Followers</div>
            </div>
        </div>
    );
};

export default UserCard;