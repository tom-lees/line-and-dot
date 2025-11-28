import * as THREE from "three";

export class Dot {
  mesh: THREE.Mesh;
  u: number;
  speed: number;
  curve: THREE.CatmullRomCurve3;
  stations: { label: string; u: number }[];

  constructor(
    curve: THREE.CatmullRomCurve3,
    stations: { label: string; u: number }[],
    speed = 0.001
  ) {
    this.curve = curve;
    this.stations = stations;
    this.u = Math.random(); // start randomly along the line
    this.speed = speed;

    const geometry = new THREE.SphereGeometry(0.5, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.curve.getPointAt(this.u));
  }

  update() {
    this.u += this.speed;
    if (
      this.stations.some(
        (s) => Math.round(s.u * 1000) / 1000 == Math.round(this.u * 1000) / 1000
      )
    ) {
      console.log("station");
    }
    if (this.u < 0.5 && this.u > 0.49) {
      this.speed = 0;
    }
    if (this.u > 1) this.u = 0; // loop back to start
    this.mesh.position.copy(this.curve.getPointAt(this.u));
  }
}
