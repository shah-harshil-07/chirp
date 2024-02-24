import "src/styles/sidebar/index.css";
import "src/styles/sidebar/right-sidebar.css";

import React, { useRef, useState } from "react";

const SearchUsers = () => {
    const valueRef = useRef(null);

    const [searchValue, setSearchValue] = useState('');
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [controller, setController] = useState(new AbortController());

    const getUsers = async value => {
        setSearchValue(value);
        controller.abort();

        setTimeout(() => {
            const newController = new AbortController(), currentValue = valueRef?.current?.value ?? searchValue;
            const { signal } = newController, data = { searchValue };
            if (currentValue === value) {
                // Call the API here
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
                className="right-sidebar-searchbox special-input"
            />

            <div className="p-dropdown-panel p-component p-connected-overlay-enter-done">
                <div className="p-dropdown-items-wrapper">
                    <ul className="p-dropdown-items" role="listbox">
                        <li className="p-dropdown-item" aria-labelledby="Active" role="option" aria-selected="true">User 1</li>
                        <li className="p-dropdown-item" aria-labelledby="Inactive" role="option" aria-selected="false">User 2</li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default SearchUsers;
