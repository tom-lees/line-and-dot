import { useEffect, useRef } from "react";
import * as THREE from "three";

function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
    const points = [
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(-3, 1, 7.5),
      new THREE.Vector3(0, 4, -30),
      new THREE.Vector3(5, 0, 5),
    ];

    // const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    // const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    // const line = new THREE.Line(lineGeometry, lineMaterial);
    // scene.add(line);

    // Curve
    const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
    // curve.curveType = "catmullrom";
    // curve.closed = false;
    const curvePoints = curve.getPoints(100); // 100 = number of segments for smoothness
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    // Dot geometry
    const dotGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
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

  return <div ref={mountRef} />;
}

export default App;
