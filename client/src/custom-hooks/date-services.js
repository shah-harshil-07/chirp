class DateOptionServices {
    #weekOptions = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; #yearOptions = [];
    #hourOptions = []; #minuteOptions = []; #dayOfWeekOptions = []; #baseDayOfMonthOptions = [];
    #monthOptions = [
        { value: 0, label: "January" }, // index: 0, days: 31
        { value: 1, label: "February" }, // index: 1, days: 28 or 29 depending upon the year
        { value: 2, label: "March" }, // index: 2, days: 31
        { value: 3, label: "April" }, // index: 3, days: 30
        { value: 4, label: "May" }, // index: 4, days: 31
        { value: 5, label: "June" }, // index: 5, days: 30
        { value: 6, label: "July" }, // index: 6, days: 31
        { value: 7, label: "August" }, // index: 7, days: 31
        { value: 8, label: "September" }, // index: 8, days: 30
        { value: 9, label: "October" }, // index: 9, days: 31
        { value: 10, label: "November" }, // index: 10, days: 30
        { value: 11, label: "December" }, // index: 11, days: 31
    ];

    constructor() {
        for (let i = 0; i < 60; i++) {
            const option = { value: i, label: i };

            if (i < 8) this.#dayOfWeekOptions.push(option);
            if (i < 24) this.#hourOptions.push(option);
            if (i <= 28 && i > 0) this.#baseDayOfMonthOptions.push(option);
            this.#minuteOptions.push(option);
        }

        const currentYear = +((new Date()).getFullYear());
        for (let i = 1971; i < currentYear; i++) this.#yearOptions.push({ value: i, label: i });
    }

    getDayOfWeekOptions = () => this.#dayOfWeekOptions;

    getHourOptions = () => this.#hourOptions;

    getMinuteOptions = () => this.#minuteOptions;

    getWeekOptions = () => this.#weekOptions;

    getMonthOptions = () => this.#monthOptions;

    getYearOptions = () => this.#yearOptions;

    getDayOfMonthOptions = (monthIndex, year) =>  {
        let upperLimit = 0, dayOfMonthOptions = [...this.#baseDayOfMonthOptions];

        if (monthIndex === 1) {
            upperLimit = year % 4 === 0 ? 29 : 28;
        } else if (monthIndex <= 6) {
            upperLimit = monthIndex % 2 === 0 ? 31 : 30;
        } else {
            upperLimit = monthIndex % 2 !== 0 ? 31 : 30;
        }

        for (let i = 29; i <= upperLimit; i++) dayOfMonthOptions.push({ value: i, label: i });
        return dayOfMonthOptions;
    };
}

export default DateOptionServices;
