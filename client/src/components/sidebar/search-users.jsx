import "src/styles/sidebar/index.css";
import "src/styles/sidebar/right-sidebar.css";

import API from "src/api";
import React, { useRef, useState } from "react";
import * as Constants from "src/utilities/constants";
import useToaster from "src/custom-hooks/toaster-message";
import usePostServices from "src/custom-hooks/post-services";

const SearchUsers = () => {
    const valueRef = useRef(null);
    const { showError } = useToaster();
    const sampleUserImg = require("src/assets/sample-user.png");
    const { getFinalUserImages, moveToUserPage } = usePostServices();

    const [userImages, setUserImages] = useState({});
    const [searchValue, setSearchValue] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
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
                        const newUserImages = {};

                        const _userSuggestions = response?.data?.map((userObj, userIndex) => {
                            const formattedUserObj = {
                                name: userObj?.name ?? '',
                                id: userObj?._id ?? userIndex,
                                picture: userObj?.picture ?? '',
                                username: userObj?.username ?? '',
                            };

                            const { id, picture } = formattedUserObj;
                            if (!userImages[id]) newUserImages[id] = picture;
                            return formattedUserObj;
                        }) ?? [];

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
                                                            className="sidebar-profile-img"
                                                            style={{ width: "50px", height: "50px" }}
                                                            src={userImages[id] ?? String(sampleUserImg)}
                                                            onError={e => { e.target.src = String(sampleUserImg); }}
                                                        />
                                                    </div>
    
                                                    <div style={{ marginLeft: "5px" }}>
                                                        {name ?? ''}<br />{username ?? ''}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })
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
