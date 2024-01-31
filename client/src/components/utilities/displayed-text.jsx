import "src/styles/utilities/displayed-text.css";

import React, { useEffect, useLayoutEffect, useState } from "react";

import * as Constants from "src/utilities/constants";

const DisplayedText = ({ text: preFormattedText, parentType, readMoreAction, uniqueId, customStyles }) => {
    const breakChars = [" ", "\n", "<"];
    const webLinkRegex = Constants.WEBLINK_ORIGIN_REGEX;

    const [text, setText] = useState('');

    useEffect(() => {
        formatLinks();
        // eslint-disable-next-line
    }, [preFormattedText]);

    useLayoutEffect(() => {
        const readMoreElement = document.querySelector(`#read-more-${uniqueId}`);
        if (readMoreElement) {
            readMoreElement.addEventListener("click", e => {
                e.stopPropagation();
                e.preventDefault();
                readMoreAction(e);
            });
        }

        // eslint-disable-next-line
    }, [text]);

    const formatLinks = () => {
        if (typeof preFormattedText === "string") {
            const trimmedText = JSON.stringify(preFormattedText)
                .replaceAll(Constants.TRIMMER_REGEX, "\n")
                .replaceAll(/"/gm, '')
                .replaceAll(/\\n/gm, "<br />");

            const limitedText = applyTextLimit(trimmedText);

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
            case "user-comment":
                textLimit = Constants.userCommentTextLimit;
                break;
            case "repost-editor":
                textLimit = Constants.repostEditorTextLimit;
                break;
            case "comment-editor":
                textLimit = Constants.commentEditorTextLimit;
                break;
            case "user-card":
                textLimit = Constants.userCardTextLimit;
                break;
            default:
                break;
        }

        const spanElement = document.createElement("span");
        spanElement.innerHTML = "...Read more";
        spanElement.className = "read-more-text";
        spanElement.id = `read-more-${uniqueId}`;

        const readMoreStr = spanElement.outerHTML;

        text = text.slice(0, textLimit);
        if (n > textLimit) text += readMoreStr;
        return text;
    }

    return (
        <div className="displayed-text-styles" style={{ ...customStyles ?? {} }}>
            <span dangerouslySetInnerHTML={{ __html: text }} />
        </div>
    );
};

export default DisplayedText;
