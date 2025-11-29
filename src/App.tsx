// TODOs
// Line in not centred, is scaling or normalisation off.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { network } from "./components/trainLines";
import { Dot } from "./components/dot";

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rawStations = network.elizabeth.subsections[0].stations;
  const minX = Math.min(...rawStations.map((n) => n.x));
  const maxX = Math.max(...rawStations.map((n) => n.x));
  const minY = Math.min(...rawStations.map((n) => n.y));
  const maxY = Math.max(...rawStations.map((n) => n.y));
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  const maxDeviationX = Math.max(
    ...rawStations.map((n) => Math.abs(n.x - midX))
  );
  const maxDeviationY = Math.max(
    ...rawStations.map((n) => Math.abs(n.y - midY))
  );
  const maxDeviation = Math.max(maxDeviationX, maxDeviationY);

  const labeledPoints = network.elizabeth.subsections[0].stations.map((n) => ({
    label: n.name,
    position: new THREE.Vector3(
      (100 * (n.x - midX)) / maxDeviation,
      (100 * (n.y - midY)) / maxDeviation,
      0
    ),
  }));
  const curve = new THREE.CatmullRomCurve3(
    labeledPoints.map((p) => p.position),
    false,
    "centripetal"
  );
  const stations = rawStations.map((s, i) => ({
    label: s.name,
    u: i / (rawStations.length - 1), // evenly spaced for now
  }));
  const dot = new Dot(curve, stations, 0.001);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        dot.resume();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dot]); // <-- dependency array here

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100000
    );
    camera.position.z = 150;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const curvePoints = curve.getPoints(100); // 100 = number of segments for smoothness
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);
    scene.add(dot.mesh);

    const animate = () => {
      requestAnimationFrame(animate);
      dot.update();
      renderer.render(scene, camera);
    };
    animate();
    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      <div
        className="h-screen w-screen overflow-hidden m-0 p-0"
        ref={mountRef}
      />
    </>
  );
}

export default App;
