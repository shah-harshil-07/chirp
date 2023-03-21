export const openModal = () => async dispatch => {
    dispatch({ type: "MODAL", payload: true });
}