import * as THREE from "three";

// Create the dot
// Locate dots current location
// Apply dots current speed and next destination
// Destroy dot command
// Dot stats, number of dots, are vehicleIDs all unique
export class Dot {
  public mesh: THREE.Mesh;
  public u: number;
  private currentStationIndex = 0;
  private stopped = true;

  constructor(
    public readonly vehcileId: string, // TODO How quickly does a vehicle change lines
    public curve: THREE.CatmullRomCurve3,
    public stations: { label: string; u: number }[],
    public speed = 0.001
  ) {
    // Start at first station
    this.u = stations[0].u;

    // this.u = Math.random(); // start randomly along the line
    // this.speed = speed;
    // this.stopped = false;
    const geometry = new THREE.SphereGeometry(0.5, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.curve.getPointAt(this.u));
  }

  resume() {
    if (this.currentStationIndex < this.stations.length - 1) {
      this.stopped = false;
    }
  }

  update() {
    if (this.stopped) return;

    const nextStation = this.stations[this.currentStationIndex + 1];
    if (!nextStation) return;

    this.u += this.speed;

    if (this.u >= nextStation.u) {
      this.u = nextStation.u;
      this.currentStationIndex++;
      this.stopped = true;

      console.log("Arrived at station:", nextStation.label);
    }

    this.mesh.position.copy(this.curve.getPointAt(this.u));
  }
}
