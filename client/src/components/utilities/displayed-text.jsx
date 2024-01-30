import "src/styles/utilities/displayed-text.css";

import React, { useEffect, useState } from "react";

import * as Constants from "src/utilities/constants";

const DisplayedText = ({ text: preFormattedText, parentType, readMoreAction }) => {
    const breakChars = [" ", "\n"];
    const webLinkRegex = Constants.WEBLINK_ORIGIN_REGEX;

    const [text, setText] = useState('');

    useEffect(() => {
        formatLinks();
        // eslint-disable-next-line
    }, [preFormattedText]);

    const formatLinks = () => {
        if (typeof preFormattedText === "string") {
            const limitedText = applyTextLimit(preFormattedText);

            let formattedText = '', backlogIndex = 0;
            let startIndex = 0, n = limitedText.length;

            do {
                const preFormattedSubStr = limitedText.substring(backlogIndex, n);
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

                    const slice1 = limitedText.substring(backlogIndex, startIndex + backlogIndex);
                    formattedText += slice1 + anchorStr;
                    backlogIndex += slice1.length + endIndex - startIndex;
                }
            } while (startIndex >= 0 && backlogIndex < n);

            setText(formattedText);
        }
    }

    const applyTextLimit = text => {
        const n = text.length;
        let textLimit = text.length;

        switch (parentType) {
            case "post-detail-repost":
                textLimit = Constants.postDetailRepostTextLimit;
                break;
            case "post-list-repost":
                textLimit = Constants.postListRepostTextLimit;
                break;
            case "post-list-body":
                textLimit = Constants.postListBodyTextLimit;
                break;
            case "repost-editor":
                textLimit = Constants.repostEditorTextLimit;
                break;
            case "comment-editor":
                textLimit = Constants.commentEditorTextLimit;
                break;
            default:
                break;
        }

        const spanElement = document.createElement("span");
        spanElement.innerHTML = "...Read more";
        spanElement.className = "read-more-text";
        spanElement.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            readMoreAction();
        });

        const readMoreStr = spanElement.outerHTML;

        text = text.slice(0, textLimit);
        if (n > textLimit) text += readMoreStr;
        return text;
    }

    return (
        <div className="displayed-text-styles">
            <span dangerouslySetInnerHTML={{ __html: text }} />
        </div>
    );
};

export default DisplayedText;
