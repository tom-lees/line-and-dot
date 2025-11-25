// TODOs
// Some of the line is still off the screen.  This should not happen
// testing phase.
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { network } from "./components/trainLines";

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000000
    );
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Line geometry
    // const labeledPoints2 = [
    //   { label: "STATION 1", position: new THREE.Vector3(-1000005, 0, 0) },
    //   { label: "STATION 2", position: new THREE.Vector3(-2, 1, 7.5) },
    //   { label: "STATION 3", position: new THREE.Vector3(0, 4, 2) },
    //   { label: "STATION 4", position: new THREE.Vector3(1000004, 0, 5) },
    // maxDeviation

    const stations = network.elizabeth.subsections[0].stations;
    const meanX = stations.reduce((acc, n) => acc + n.x, 0) / stations.length;
    const meanY = stations.reduce((acc, n) => acc + n.y, 0) / stations.length;
    const maxDeviationX = Math.max(
      ...stations.map((n) => Math.abs(n.x - meanX))
    );
    const maxDeviationY = Math.max(
      ...stations.map((n) => Math.abs(n.y - meanY))
    );
    const maxDeviation = Math.max(maxDeviationX, maxDeviationY);

    const labeledPoints = network.elizabeth.subsections[0].stations.map(
      (n) => ({
        label: n.name,
        position: new THREE.Vector3(
          (100 * (n.x - meanX)) / maxDeviation,
          (100 * (n.y - meanY)) / maxDeviation,
          0
        ),
      })
    );
    console.log(labeledPoints);

    // Curve
    const curve = new THREE.CatmullRomCurve3(
      labeledPoints.map((p) => p.position),
      false,
      "centripetal"
    );

    const curvePoints = curve.getPoints(100); // 100 = number of segments for smoothness
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    const geometry = new THREE.PlaneGeometry(4, 4); // width, height
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // red
    const square = new THREE.Mesh(geometry, material);
    scene.add(square);

    const animate = () => {
      requestAnimationFrame(animate);
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
