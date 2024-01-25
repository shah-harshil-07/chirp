import "src/styles/utilities/lighthouse.css";

import CIcon from "@coreui/icons-react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { cilArrowLeft, cilArrowRight } from "@coreui/icons";

import { closeLighthouse } from "src/redux/reducers/lighthouse";

const LightHouse = ({ images, initialIndex }) => {
    const dispatch = useDispatch();
    const bodyDiv = document.querySelector("body");

    useEffect(() => {
        bodyDiv.style.overflow = "hidden";
        return () => { bodyDiv.style.overflow = "auto"; };
    }, []);

    const closeZoom = () => {
        dispatch(closeLighthouse());
    }

    return (
        <div className="lighthouse-container" style={{ top: window.scrollY }}>
            <div className="lighthouse-close-btn" onClick={closeZoom}>
                <span className="lighthouse-close-icon">&times;</span>
            </div>

            <div className="lighthouse-arrow-container" id="lighthouse-adjust-left">
                <CIcon icon={cilArrowLeft} />
            </div>

            <div className="lighthouse-arrow-container" id="lighthouse-adjust-right">
                <CIcon icon={cilArrowRight} />
            </div>

            <img alt="zoomed canva" src={images[initialIndex]} className="zoomed-image" />
        </div>
    );
}

export default LightHouse;
