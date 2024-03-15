import React from "react";
import "./Button.css";

function Button({ color, text, onClick, bg, fontWeight }) {
  const defaultBackground =
    "linear-gradient(to right, rgba(255, 96, 0, 1), rgba(255, 137, 65, 1))";
  const backgroundStyle = bg
    ? { backgroundColor: bg }
    : { backgroundImage: defaultBackground };

  return (
    <div
      onClick={onClick}
      className="button"
      style={{
        ...backgroundStyle,
        color: color || "#fff",
      }}
    >
      <p
        className="btn__text"
        style={{
          fontWeight: fontWeight || 400,
        }}
      >
        {text}
      </p>
    </div>
  );
}

export default Button;
