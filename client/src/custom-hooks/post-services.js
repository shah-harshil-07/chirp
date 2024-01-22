import React from "react";
import moment from "moment";
import { useDispatch } from "react-redux";

import API from "src/api";
import useToaster from "./toaster-message";
import * as Constants from "src/utilities/constants";
import { openModalWithProps } from "src/redux/reducers/modal";
import { getCommonHeader, isUserLoggedIn } from "src/utilities/helpers";

const usePostServices = () => {
    const dispatch = useDispatch();
    const { showError } = useToaster();
    const headerData = getCommonHeader();
    const availableMutedActions = ["like", "save"];

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

    return {
        getPostTiming,
        createPollJSX,
        openRepostBox,
        openCommentBox,
        handleMutedReaction,
        getFormattedPostTiming,
        getImageFetchingPromise,
    };
}

export default usePostServices;
