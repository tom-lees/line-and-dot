import * as THREE from "three";

export class Dot {
  // TODO Dot class may need to change.
  // Dot has a current position.
  // A next destination.
  // A next destination time.
  // When the current position is updated and droped from the API, this is when the
  // dot needs to start moving to the next destinations, reaching this destination
  // at the estimated time.
  id: string;
  mesh: THREE.Mesh;
  u: number;
  destinationU?: number;
  speed: number;
  curve: THREE.CatmullRomCurve3;
  stations: { label: string; u: number }[];
  stopped: boolean;

  constructor(
    id: string,
    curve: THREE.CatmullRomCurve3,
    stations: { label: string; u: number }[],
    speed = 0.001
  ) {
    this.id = id;
    this.curve = curve;
    this.stations = stations;
    this.u = Math.random(); // start randomly along the line
    this.speed = speed;
    this.stopped = false;

    const geometry = new THREE.SphereGeometry(0.5, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.curve.getPointAt(this.u));
  }

  resume() {
    this.stopped = false;
  }

  update() {
    // if (this.)
    //   if (this.stopped) return;
    //   this.u += this.speed;
    //   if (
    //     this.stations.some(
    //       (s) => Math.round(s.u * 1000) / 1000 == Math.round(this.u * 1000) / 1000
    //     )
    //   ) {
    //     this.stopped = true;
    //     console.log("station");
    //   }
    //   if (this.u > 1) this.u = 0; // loop back to start
    //   this.mesh.position.copy(this.curve.getPointAt(this.u));
  }
}
