import React, { useState } from "react";
import CustomModal from "../utilities/custom-modal";

const ScheduledPostList = () => {
    const [showLoader, setShowLoader] = useState(false);
    const [footerText, setFooterText] = useState('');
    const [includeFooter, setIncludeFooter] = useState(false);
    const [displayOverflow, setDisplayOverflow] = useState(false);

    const bodyJSX = (
        <div>Hello World</div>
    );

    return (
        <CustomModal
            bodyJSX={bodyJSX}
            showLoader={showLoader}
            footerText={footerText}
            includeFooter={includeFooter}
            displayOverflow={displayOverflow}
        />
    )
}

export default ScheduledPostList;
