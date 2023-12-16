import "src/styles/utilities/user-card.css";

import { useSelector } from "react-redux";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { placeHolderImageSrc } from "src/utilities/constants";
import { checkContainerInViewport } from "src/utilities/helpers";

const UserCard = () => {
    const cardRef = useRef(null);
    const userDetailState = useSelector(state => state.userDetails);
    const userData = userDetailState?.data ?? {};
    var { left, top } = userData?.coordinates ?? {};

    const [cardY, setCardY] = useState(undefined);
    const [cardX, setCardX] = useState(undefined);
    const [reduxTop, setReduxTop] = useState(undefined);
    const [reduxLeft, setReduxLeft] = useState(undefined);
    const [positionUpdated, setPositionUpdated] = useState(false);

    useEffect(() => {
        setReduxTop(top);
        setReduxLeft(left);
        setPositionUpdated(false);
        console.log("left right change called!");
        // eslint-disable-next-line
    }, [left, top]);

    useLayoutEffect(() => {
        if (reduxLeft && reduxTop && !positionUpdated) {
            setCardX(reduxLeft);
            let finalTop = top;
            console.log("reduxTop => ", reduxTop);
            console.log("finalTop before -> ", finalTop);
            const cardRect = cardRef?.current?.getBoundingClientRect() ?? null;
            console.log("rect => ", cardRect);
            if (cardRect) {
                const isInView = checkContainerInViewport(cardRect);
                console.log("is in view => ", isInView);
                if (!isInView) finalTop -= 100;
                top = finalTop;
            }

            console.log("finalTop later -> ", finalTop);
            setCardY(finalTop);
            setPositionUpdated(true);
        }

        // eslint-disable-next-line
    }, [reduxLeft, reduxTop]);

    useEffect(() => {
        console.log("cardX => ", cardX);
        console.log("cardY => ", cardY);
    }, [cardX, cardY]);

    return (reduxLeft && reduxTop) ? (
        <div className="user-card-body" ref={cardRef} style={{ left: cardX ?? reduxLeft, top: cardY ?? reduxTop }}>
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
    ) : (
        <></>
    );
};

export default UserCard;
