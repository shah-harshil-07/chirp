import moment from "moment";

const usePostServices = () => {
    const durationData = [
		{ key: "months", symbol: "mo" },
		{ key: "days", symbol: 'd' },
		{ key: "hours", symbol: 'h' },
		{ key: "minutes", symbol: "min" },
		{ key: "seconds", symbol: 's' },
	];

    const getPostTiming = dateObj => {
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

    return { getPostTiming };
}

export default usePostServices;
