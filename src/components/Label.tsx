import { Html } from "@react-three/drei";

type LabelProps = {
  text: string;
  position: [number, number, number];
  offset?: [number, number]; // screen-space offset in pixels
  fontSize?: number;
  fontColour?: string;
};

export function Label({
  text,
  position,
  fontSize = 22,
  fontColour = "white",
}: LabelProps) {
  // TODO Check actual text box with bg
  //      Then adjust offset properly
  const offset = [fontSize / 2, (-3 * fontSize) / 2];
  const [xOffset, yOffset] = offset;

  return (
    <Html position={position} occlude={false}>
      <div
        style={{
          fontSize: `${fontSize}px`,
          color: fontColour,
          background: "rgba(0,0,0,0.8)", // TODO Drop
          fontFamily: "Arial, sans-serif",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          transform: `translate(${xOffset}px, ${yOffset}px) rotate(-45deg)`,
          textShadow: "0 0 3px rgba(0,0,0,0.8)",
          transformOrigin: "left center",
        }}
      >
        {text}
      </div>
    </Html>
  );
}
