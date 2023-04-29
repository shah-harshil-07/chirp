import { useDispatch } from "react-redux";

import { openToaster } from "src/redux/actions/toaster";

const useToaster = () => {
    const dispatch = useDispatch();

    const showSuccess = message => {
        dispatch(openToaster("Success", message));
    }

    const showError = message => {
        dispatch(openToaster("Error", message));
    }

    return { showSuccess, showError };
}

export default useToaster;
