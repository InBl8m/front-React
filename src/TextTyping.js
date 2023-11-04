import React, { useState, useEffect } from "react";

const TypingText = ({ text }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        const typingInterval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText((prevText) => prevText + text[currentIndex]);
                setCurrentIndex(currentIndex + 1);
            } else {
                clearInterval(typingInterval);
                // Hide the cursor after typing is complete
                setCursorVisible(false);
            }
        }, 25); // Decreased the interval for faster typing

        const cursorInterval = setInterval(() => {
            if (currentIndex >= text.length) {
                clearInterval(cursorInterval); // Clear cursor interval when typing is complete
            } else {
                setCursorVisible((prevCursor) => !prevCursor);
            }
        }, 500); // Cursor blinking interval

        return () => {
            clearInterval(typingInterval);
            clearInterval(cursorInterval);
        };
    }, [text, currentIndex]);

    return (
        <div>
            <p>
                {displayedText}
                {cursorVisible && "_"} {/* Display the cursor */}
            </p>
        </div>
    );
};

export default TypingText;
