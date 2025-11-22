// TODOs
// Investigate adding extra content to api call, line, outbound/inbound
// Filter by line and line segment.  i.e. Reading => Stanford, Outbound
// Live updates every 10 seconds
// Display a records update time, maybe leave record up and use a boolean to
// show it is inactive, rather than cleaning it from dataset during this
// testing phase.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import TrainInfoPanel from "./components/TrainInfoPanel";
import SingleTrainPanel from "./components/SingleTrainPanel";

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function createTextLabel(text: string) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      context.font = "24px Arial";
      context.fillStyle = "white";
      context.fillText(text, 0, 24);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(2, 1, 1); // Adjust size as needed
      return sprite;
    }

    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Line geometry
    const labeledPoints = [
      { label: "STATION 1", position: new THREE.Vector3(-5, 0, 0) },
      { label: "STATION 2", position: new THREE.Vector3(-2, 1, 7.5) },
      { label: "STATION 3", position: new THREE.Vector3(0, 4, 2) },
      { label: "STATION 4", position: new THREE.Vector3(5, 0, 5) },
    ];

    // const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    // const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    // const line = new THREE.Line(lineGeometry, lineMaterial);
    // scene.add(line);

    // Curve
    const curve = new THREE.CatmullRomCurve3(
      labeledPoints.map((p) => p.position),
      true,
      "centripetal"
    );

    // curve.curveType = "catmullrom";
    // curve.closed = false;
    const curvePoints = curve.getPoints(100); // 100 = number of segments for smoothness
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    labeledPoints.forEach(({ label, position }) => {
      const labelSprite = createTextLabel(label);
      labelSprite.position.copy(position);
      scene.add(labelSprite);
    });

    // Dot geometry
    const dotGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    // TODO Is the emmission doing anything?
    const dotMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 10,
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    // TODO Is the light doing anything?
    const pointLight = new THREE.PointLight(0xffffff, 10, 100);
    scene.add(pointLight);

    scene.add(dot);

    // Animate the dot along the curve
    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.002;
      if (t > 1) t = 0;

      const position = curve.getPoint(t);
      dot.position.set(position.x, position.y, position.z);

      renderer.render(scene, camera);
    };
    animate();

    camera.position.z = 10;

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <SingleTrainPanel trainId="202511228007700" />
      <div ref={mountRef} />
      <TrainInfoPanel />
    </>
  );
}

export default App;
