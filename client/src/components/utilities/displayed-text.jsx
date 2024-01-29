import "src/styles/utilities/displayed-text.css";

import React, { useEffect } from "react";

import * as Constants from "src/utilities/constants";

const DisplayedText = ({ text }) => {
    const webLinkRegex = Constants.WEBLINK_ORIGIN_REGEX;

    useEffect(() => {
        formatLinks();
        // eslint-disable-next-line
    }, [text]);

    const formatLinks = () => {
        if (typeof text === "string") {
            let startIndex = -1;

            do {
                startIndex = text.search(webLinkRegex);
                console.log(startIndex);

                if (startIndex >= 0) {
                    let endIndex = startIndex;
                    for (let i = startIndex + 1; i < text.length; i++) {
                        if (text[i] === " " || i == text.length - 1) {
                            endIndex = i;
                            break;
                        }
                    }

                    const linkText = text.substring(startIndex, endIndex);
                    const slice1 = text.substring(0, startIndex);
                    const slice2 = text.substring(endIndex, text.length);
                    console.log("linkText => ", linkText);
                    console.log("slice1 => ", slice1);
                    console.log("slice2 => ", slice2);
                    text = slice1 + "Aabraacadabra" + slice2;
                }

                console.log("text later => ", text);
                console.log("--------------------");
            } while (startIndex >= 0);
        }
    }

    return <pre className="displayed-text-styles">{text ?? ''}</pre>;
};

export default DisplayedText;
