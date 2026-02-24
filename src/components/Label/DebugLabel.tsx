import { Html } from "@react-three/drei";
import type { LabelProps } from "./label.types";

interface DebugLabelProps extends Omit<LabelProps, "text"> {
  texts: string[]; // multiple lines
}

export function DebugLabel({
  texts,
  position,
  fontSize = 22,
  fontColour = "white",
  rotate = "diagonal",
}: DebugLabelProps) {
  let offset;
  let rotation;

  offset = [0, -2 * fontSize];
  rotation = `rotate(-45deg)`;

  if (rotate === "horizontal") {
    offset = [fontSize, -fontSize];
    rotation = ``;
  }
  if (rotate === "vertical") {
    offset = [0, -2 * fontSize];
    rotation = `rotate(-90deg)`;
  }

  const [xOffset, yOffset] = offset;

  return (
    <Html position={position} occlude={false} style={{ zIndex: 0 }}>
      <div
        style={{
          fontSize: `${fontSize}px`,
          color: fontColour,
          background: "rgba(0,0,0,0.5)",
          fontFamily: "Arial, sans-serif",
          whiteSpace: "pre", // important to preserve line breaks
          pointerEvents: "none",
          userSelect: "none",
          transform: `translate(${xOffset}px, ${yOffset}px) ${rotation}`,
          textShadow: "0 0 3px rgba(0,0,0,0.8)",
          transformOrigin: "left center",
        }}
      >
        {texts.join("\n")}
      </div>
    </Html>
  );
}
