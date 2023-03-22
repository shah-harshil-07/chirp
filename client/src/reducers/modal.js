export default (modal = false, action) => {
    switch (action.type) {
        case "MODAL":
            return action.payload;
        default:
            return modal;
    }
}