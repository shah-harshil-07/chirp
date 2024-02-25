import "src/styles/sidebar/index.css";
import "src/styles/sidebar/right-sidebar.css";

import { useNavigate } from "react-router-dom";
import React, { useRef, useState } from "react";

import API from "src/api";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";

const SearchUsers = () => {
    const valueRef = useRef(null);
    const sampleUserImg = require("src/assets/sample-user.png");
    const { showError } = useToaster(), navigate = useNavigate();
    const { getFinalUserImages, moveToUserPage } = usePostServices();

    const [userImages, setUserImages] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [showSeeMoreOption, setShowSeeMoreOption] = useState(false);
    const [controller, setController] = useState(new AbortController());

    const getUsers = async value => {
        setSearchValue(value);
        controller.abort();

        setTimeout(() => {
            const newController = new AbortController(), currentValue = valueRef?.current?.value ?? searchValue;
            const { signal } = newController, data = { searchValue: currentValue };

            if (currentValue === value) {
                API(Constants.POST, Constants.SEARCH_USER, data, null, false, signal)
                    .then(async ({ data: response }) => {
                        const newUserImages = {}, responseData = response?.data ?? [];
                        const responseUsers = responseData.slice(0, 5);
                        setShowSeeMoreOption(responseData.length > 5);

                        const _userSuggestions = responseUsers.map((userObj, userIndex) => {
                            const formattedUserObj = {
                                name: userObj?.name ?? '',
                                id: userObj?._id ?? userIndex,
                                picture: userObj?.picture ?? '',
                                username: userObj?.username ?? '',
                            };

                            const { id, picture } = formattedUserObj;
                            if (!userImages[id]) newUserImages[id] = picture;
                            return formattedUserObj;
                        });

                        const newSettledUserImages = await getFinalUserImages(newUserImages);

                        const _userImages = {};
                        for (const userId in newSettledUserImages) _userImages[userId] = newSettledUserImages[userId];

                        setUserImages({ ...userImages, ..._userImages });
                        setUserSuggestions([..._userSuggestions]);
                    })
                    .catch(err => {
                        console.log(err);
                        setUserSuggestions([]);
                        showError("Something went wrong!");
                    });
            }

            setController(newController);
        }, 100);
    }

    const moveToUserSuggestionPage = () => {
        const currentValue = valueRef?.current?.value ?? searchValue;
        navigate("/searched-users", { state: { query: currentValue } });
    }

    return (
        <>
            <input
                type="text"
                ref={valueRef}
                value={searchValue}
                placeholder="Search Users"
                onChange={e => { getUsers(e.target.value); }}
                className="right-sidebar-searchbox special-input"
            />

            {
                userSuggestions?.length > 0 && (
                    <div className="p-dropdown-panel p-component p-connected-overlay-enter-done">
                        <div className="p-dropdown-items-wrapper">
                            <ul className="p-dropdown-items" role="listbox">
                                {
                                    userSuggestions.map((userObj, userIndex) => {
                                        const { name, username, id } = userObj;
                                        return (
                                            <li
                                                role="option"
                                                aria-selected="true"
                                                key={id ?? userIndex}
                                                className="p-dropdown-item"
                                                onClick={e => { moveToUserPage(e, id); }}
                                            >
                                                <div className="d-flex">
                                                    <div>
                                                        <img
                                                            alt="logo"
                                                            className="searched-user-img"
                                                            src={userImages[id] ?? String(sampleUserImg)}
                                                            onError={e => { e.target.src = String(sampleUserImg); }}
                                                        />
                                                    </div>
    
                                                    <div className="searched-user-name-bar">
                                                        {name ?? ''}<br />{username ?? ''}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
                                }
                                {
                                    showSeeMoreOption && (
                                        <li
                                            role="option"
                                            aria-selected="true"
                                            className="p-dropdown-item"
                                            onClick={moveToUserSuggestionPage}
                                        >
                                            <div className="searched-user-see-more">See more</div>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default SearchUsers;
