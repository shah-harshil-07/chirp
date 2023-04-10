export const openToaster = (type, message) => async dispatch => {
    dispatch({ type: "TOASTER", payload: { open: true, messageObj: { type, message } } });
}

export const closeToaster = () => async dispatch => {
    dispatch({ type: "TOASTER", payload: { open: false, messageObj: {} } });
}
