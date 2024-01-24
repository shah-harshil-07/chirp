import "src/styles/utilities/lighthouse.css";

import React, { useEffect } from "react";

const LightHouse = ({ images, initialIndex }) => {
    useEffect(() => {
        document.querySelector("body").style.overflow = "hidden";
    }, []);

    return (
        <div className="lighthouse-container" style={{ top: window.scrollY }}>
            <img alt="zoomed canva" src={images[initialIndex]} className="zoomed-image" />
        </div>
    );
}

export default LightHouse;
