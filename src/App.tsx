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
    const points = [new THREE.Vector3(-5, 0, 0), new THREE.Vector3(5, 0, 0)];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Dot geometry
    const dotGeometry = new THREE.SphereGeometry(0.2, 32, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    scene.add(dot);

    camera.position.z = 10;

    // Animation loop
    let t = -5;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.05;
      if (t > 5) t = -5;
      dot.position.x = t;
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

  return <div ref={mountRef} />;
}

export default App;
