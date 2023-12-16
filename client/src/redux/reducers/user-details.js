import { createSlice } from "@reduxjs/toolkit";

import userDetailActions from "src/redux/actions/user-details";

const name = "userDetails";
const reducers = { ...userDetailActions };
export const initialState = {
    open: false,
    data: {
        bio: '',
        name: '',
        image: '',
        picture: '',
        username: '',
        followers: 0,
        following: 0,
        coordinates: { left: 0, top: 0 },
    },
};

const userDetailsSlice = createSlice({ name, initialState, reducers });

const { actions, reducer } = userDetailsSlice;
export const { openDetailsCard, closeDetailsCard } = actions;
export default reducer;