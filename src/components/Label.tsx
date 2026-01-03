import { useMemo } from "react";
import * as THREE from "three";
// TODO add building a led xmas desktop tree to list

type LabelProps = {
  text: string;
  position: [number, number, number];
  colour?: string;
};

// TODO Labels need to be smarter:
// - Smart positioning to avoid overlapping
// - Perhaps something perpedicular to curve
// - Labels need to disapear when zoomed out
//   (however this may be controlled in parent)
export const Label: React.FC<LabelProps> = ({
  // TODO Add something for the components key.  Line+station? some unique id?
  text,
  position,
  colour = "white",
}) => {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    const height = 256;
    const width = 512;
    canvas.width = width;
    canvas.height = height;

    context.clearRect(0, 0, width, height);
    // TODO Shape of box needs udjusting, test with below
    // context.fillStyle = "red";
    // context.fillRect(0, 0, height, width);
    context.font = "32px Arial";
    context.fillStyle = colour;
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText(text, 10, height / 2);

    return new THREE.CanvasTexture(canvas);
  }, [text, colour]);

  return (
    <sprite
      position={[position[0] + 90, position[1] - 60, position[2]]}
      scale={[200, 100, 1]}
    >
      <spriteMaterial
        rotation={-Math.PI / 6}
        attach="material"
        map={texture}
        transparent
      />
    </sprite>
  );
};

// TODO Investigate when we upgrade this section
// function createLabelTexture(
//   text: string,
//   opts = { fontSize: 32, padding: 10, color: "white" }
// ) {
//   const { fontSize, padding, color } = opts;
//   const canvas = document.createElement("canvas");
//   const ctx = canvas.getContext("2d")!;

//   ctx.font = `${fontSize}px sans-serif`;
//   const metrics = ctx.measureText(text);
//   const width = Math.ceil(metrics.width) + padding * 2;
//   const height = fontSize + padding * 2;
//   canvas.width = width;
//   canvas.height = height;
//   ctx.font = `${fontSize}px sans-serif`;
//   ctx.textBaseline = "middle";
//   ctx.fillStyle = color;
//   ctx.clearRect(0, 0, width, height);
//   ctx.fillText(text, padding, height / 2);
//   const tex = new THREE.CanvasTexture(canvas);
//   tex.needsUpdate = true;
//   return tex;
// }
