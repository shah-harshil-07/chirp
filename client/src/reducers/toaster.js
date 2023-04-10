export default (open = false, action) => {
    switch (action.type) {
        case "TOASTER":
            return action.payload;
        default:
            return open;
    }
}