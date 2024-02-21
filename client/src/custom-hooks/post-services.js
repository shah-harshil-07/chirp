import moment from "moment";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import API from "src/api";
import useToaster from "./toaster-message";
import * as Constants from "src/utilities/constants";
import { openModalWithProps } from "src/redux/reducers/modal";
import { closeDetailsCard, openDetailsCard } from "src/redux/reducers/user-details";
import { getCommonHeader, isUserLoggedIn } from "src/utilities/helpers";

const usePostServices = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const oneCrore = Math.pow(10, 7);
    const oneLakh = Math.pow(10, 5);
    const oneThousand = Math.pow(10, 3);

    const { showError } = useToaster();
    const headerData = getCommonHeader();
    const availableMutedActions = ["like", "save"];

    const [cardRemovalTimeout, setCardRemovalTimeout] = useState(null);

    const durationData = [
		{ key: "months", symbol: "mo" },
		{ key: "days", symbol: 'd' },
		{ key: "hours", symbol: 'h' },
		{ key: "minutes", symbol: "min" },
		{ key: "seconds", symbol: 's' },
	];

    const getPostTiming = dateObj => {
        if (dateObj) {
            const currentDate = Date.now();
            let diff = moment(currentDate).diff(dateObj, "months");

            for (let i = 0; i < durationData.length; i++) {
                const { key, symbol } = durationData[i];
                const diff = moment(currentDate).diff(dateObj, key);
                if (diff > 0) {
                    return (symbol === "mo" && diff > 11)
                        ? moment(currentDate).format("MMM D YYYY")
                        : (diff + symbol);
                }
            }

            return diff;
        }

        return '';
    }

    const getGradient = (votePercent, isVoted = false) => {
        const bgColor = isVoted ? "#1DA1F2" : "#e9ecef";
        return `linear-gradient(to right, ${bgColor} ${votePercent}%, white ${votePercent}% 100%)`;
    }

    const createPollJSX = (pollData, handleVoteAction) => {
        const { choices, users } = pollData;
        let votedIndex = -1, userIndex = -1;
        const totalVotes = choices.reduce((votesAcc, { votes }) => votesAcc += votes, 0);

        const userDetails = localStorage.getItem("chirp-userDetails");
        const loggedInUserId = userDetails ? JSON.parse(userDetails)?._id ?? '' : '';

        if (loggedInUserId) {
            userIndex = users.findIndex(user => user.userId === loggedInUserId);
            if (userIndex >= 0) votedIndex = users[userIndex]?.choiceIndex ?? -1;
        }

        return (
            <div className="mt-3 mb-3">
                {
                    choices.map((choiceObj, choiceIndex) => {
                        const { label, votes } = choiceObj;
                        const votePercent = Math.ceil(votes / totalVotes * 100);
                        const isVoted = (choiceIndex === votedIndex && users[userIndex].userId === loggedInUserId);

                        return (
                            <div
                                key={choiceIndex}
                                className="post-poll-bar"
                                style={{ background: getGradient(votePercent, isVoted) }}
                                onClick={e => { if (!isVoted) handleVoteAction(e, choiceIndex); }}
                            >
                                {label ?? ''}

                                {
                                    votedIndex >= 0 && (
                                        <div className="post-vote-percent-label">{`${votePercent.toFixed(0)}%`}</div>
                                    )
                                }
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    const handleMutedReaction = (action, postData, updateStateForLikeAction, updateStateForSaveAction) => {
		if (availableMutedActions.includes(action)) {
			if (isUserLoggedIn()) {
                let mode, url;
				const { postId, isLiked, isSaved, postType } = postData;
				const data = { postId, postType: postType ?? "post", reaction: '' };

				switch (action) {
					case "like":
                        data["reaction"] = "liked";
						mode = isLiked ? "remove" : "add";
						url = isLiked ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;

                        updateStateForLikeAction(mode);
						break;
					case "save":
                        data["reaction"] = "saved";
						mode = isSaved ? "remove" : "add";
						url = isSaved ? Constants.REMOVE_SAVES_LIKES : Constants.ADD_SAVES_LIKES;

                        updateStateForSaveAction(mode);
						break;
					default:
						break;
				}

				if (data?.reaction && mode && url) API(Constants.POST, url, data, headerData);
			} else {
				showError(`Please login to ${action}!`);
			}
		}
    }

    const openCommentBox = (e, postDetails) => {
        e.stopPropagation();
        if (isUserLoggedIn()) dispatch(openModalWithProps({ type: "commentEditor", props: postDetails }));
        else showError("Please login to comment!");
    }

    const openRepostBox = (e, postDetails) => {
        e.stopPropagation();
        if (isUserLoggedIn()) dispatch(openModalWithProps({ type: "repostEditor", props: postDetails }));
        else showError("Please login to repost!");
    }

    const getImageFetchingPromise = (imageName, updatingStateCallback, imageKey = "post") => {
        const baseUrl = imageKey === "post" ? Constants.GET_POST_IMAGE : Constants.GET_USER_IMAGE;

        return new Promise((res, rej) => {
            API(Constants.GET, `${baseUrl}/${imageName}`, null, headerData)
                .then(imageResponse => {
                    const base64ImgData = imageResponse.data;
                    const imageData = Constants.base64Prefix + base64ImgData;
                    updatingStateCallback(imageData);
                    res(imageData);
                })
                .catch(err => {
                    console.log(err);
                    rej();
                });
        });
    }

    const getFormattedPostTiming = dateObj => {
        return dateObj ? moment(dateObj).format("hhA MMM. Do, YYYY") : null;
    }

    const getFormattedNumber = number => {
        let formattedNumber = number, flag = '';
        if (!isNaN(number)) {
            if (+(number) > oneCrore) {
                flag = "cr";
                formattedNumber = (number / oneCrore)?.toFixed(2);
            } else if (+(number) > oneLakh) {
                flag = "L";
                formattedNumber = (number / oneLakh)?.toFixed(2);
            } else if (+(number) > oneThousand) {
                flag = "k";
                formattedNumber = (number / oneThousand)?.toFixed(2);
            }
        } else {
            return number;
        }

        let str = String(formattedNumber);
        let sliceIndex = str.length;

        for (let i = str.length - 1; i >= 0; i--) if (str[i] === '0') sliceIndex--; else break;
        str = str.slice(0, sliceIndex);
        if (str[str.length - 1] === '.') str = str.slice(0, str.length - 1);
        return (str + flag).trimEnd();
    }

    const getFinalUserImages = async userImages => {
        for (const userId in userImages) {
            const imageValue = userImages[userId];
            if (imageValue && !imageValue.startsWith(Constants.httpsOrigin)) {
                await getImageFetchingPromise(imageValue, imageData => { userImages[userId] = imageData; }, "user");
            }
        }

        return userImages;
    }

    const openUserCard = (e, userDetails, picture) => {
        e.stopPropagation();
        if (userDetails) {
            const imgRect = e.target.getBoundingClientRect();
            const coordinates = { left: imgRect.left - 130, top: window.scrollY + imgRect.bottom + 10 };
            dispatch(openDetailsCard({ ...userDetails, picture, coordinates }));
        }
    }

    const closeDetailsCardImmediately = () => {
        dispatch(closeDetailsCard());
        document.removeEventListener("mousemove", () => { });

        if (typeof cardRemovalTimeout === "function") {
            clearTimeout(cardRemovalTimeout);
            setCardRemovalTimeout(null);
        }
    }

    const closeUserCard = e => {
        e.stopPropagation();
        let clientX = 0, clientY = 0;
        document.addEventListener("mousemove", e => {
            clientX = e.clientX;
            clientY = e.clientY;
        });

        const _timeout = setTimeout(() => {
            const currentHoveredElement = document.elementFromPoint(clientX, clientY);
            const pointerContainsCard = document.getElementById("user-card-body")?.contains(currentHoveredElement);
            if (!pointerContainsCard && !e.target.contains(currentHoveredElement)) dispatch(closeDetailsCard());
            document.removeEventListener("mousemove", () => { });
        }, 2000);

        setCardRemovalTimeout(_timeout);
    }

    const moveToUserPage = (e, userId, props) => {
        if (e) e.stopPropagation();

        if (userId) {
            const navigationParams = [`/user/${userId}`];
            if (props) navigationParams.push(props);
            navigate(...navigationParams);
        } else {
            showError("User id is unavailable.");
        }
    }

    return {
        openUserCard,
        getPostTiming,
        createPollJSX,
        openRepostBox,
        closeUserCard,
        moveToUserPage,
        openCommentBox,
        getFinalUserImages,
        getFormattedNumber,
        handleMutedReaction,
        getFormattedPostTiming,
        getImageFetchingPromise,
        closeDetailsCardImmediately,
    };
}

export default usePostServices;
