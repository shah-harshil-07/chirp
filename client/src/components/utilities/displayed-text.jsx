import "src/styles/utilities/displayed-text.css";

import React, { useEffect, useState } from "react";

import * as Constants from "src/utilities/constants";

const DisplayedText = ({ text: preFormattedText }) => {
    const breakChars = [" ", "\n"];
    const webLinkRegex = Constants.WEBLINK_ORIGIN_REGEX;

    const [text, setText] = useState('');

    useEffect(() => {
        formatLinks();
        // eslint-disable-next-line
    }, [preFormattedText]);

    const formatLinks = () => {
        if (typeof preFormattedText === "string") {
            let formattedText = '', backlogIndex = 0;
            let startIndex = 0, n = preFormattedText.length;

            do {
                const preFormattedSubStr = preFormattedText.substring(backlogIndex, n);
                startIndex = preFormattedSubStr.search(webLinkRegex);

                if (startIndex < 0) {
                    formattedText += preFormattedSubStr;
                } else {
                    let endIndex = startIndex;
                    for (let i = startIndex + 1; i < n; i++) {
                        const char = preFormattedSubStr[i];
                        if (breakChars.includes(char) || i === n - 1) {
                            endIndex = i === n - 1 ? i + 1 : i;
                            break;
                        }
                    }

                    const linkText = preFormattedSubStr.substring(startIndex, endIndex);
                    let link = linkText.replace(webLinkRegex, '');
                    if (link.length > 30) link = `${link.slice(0, 28)}...`;

                    const anchorElement = document.createElement('a');
                    anchorElement.href = linkText;
                    anchorElement.innerHTML = link;
                    anchorElement.title = linkText;
                    anchorElement.style.color = "var(--chirp-color)";
                    const anchorStr = anchorElement.outerHTML;

                    const slice1 = preFormattedText.substring(backlogIndex, startIndex + backlogIndex);
                    formattedText += slice1 + anchorStr;
                    backlogIndex += slice1.length + endIndex - startIndex;
                }
            } while (startIndex >= 0 && backlogIndex < n);

            setText(formattedText);
        }
    }

    return (
        <div className="displayed-text-styles">
            <span dangerouslySetInnerHTML={{ __html: text }} />
        </div>
    );
};

export default DisplayedText;
