import "src/styles/utilities/lighthouse.css";

import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import { cilArrowLeft, cilArrowRight } from "@coreui/icons";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { closeLighthouse } from "src/redux/reducers/lighthouse";

const LightHouse = ({ images, initialIndex }) => {
    const imageRef = useRef(null);
    const dispatch = useDispatch();
    
    const [currentIndex, setCurrentIndex] = useState(-1);
    
    useEffect(() => {
        const body = document.querySelector("body");

        body.style.overflow = "hidden";
        return () => { body.style.overflow = "auto"; };
    }, []);

    useEffect(() => {
        setCurrentIndex(initialIndex ?? 0);
    }, [initialIndex, images]);

    useEffect(() => {
        imageRef.current.style.animation = "lighthouseImageLoadAnimation 0.5s linear";
    }, [currentIndex]);

    useLayoutEffect(() => {
        imageRef.current.style.animation = '';
    }, [currentIndex]);

    const closeZoom = () => {
        dispatch(closeLighthouse());
    }

    return (
        <div className="lighthouse-container" style={{ top: window.scrollY }}>
            <div className="lighthouse-close-btn" onClick={closeZoom}>
                <span className="lighthouse-close-icon">&times;</span>
            </div>

            {
                currentIndex > 0 && (
                    <div
                        id="lighthouse-adjust-left"
                        className="lighthouse-arrow-container"
                        onClick={() => { setCurrentIndex(currentIndex - 1); }}
                    >
                        <CIcon icon={cilArrowLeft} />
                    </div>
                )
            }

            {
                (currentIndex < images.length - 1) && (
                    <div
                        id="lighthouse-adjust-right"
                        className="lighthouse-arrow-container"
                        onClick={() => { setCurrentIndex(currentIndex + 1); }}
                    >
                        <CIcon icon={cilArrowRight} />
                    </div>
                )
            }

            <img alt="zoomed canva" ref={imageRef} src={images[currentIndex]} className="zoomed-image" />
        </div>
    );
}

export default LightHouse;
