# 3D Model of the London Underground

An interactive **3D, real-time model of the London Underground** built with **React Three Fiber (React + Three.js)**.  
The project visualises the London Underground rail network in three dimensions and displays **live train positions** using data from the **TfL train arrivals API**.

The goal of the project is to explore how real-time transport data can be visualized in an intuitive and engaging way using modern web technologies.

## View Here

https://www.tube-map.org

## Features

- **Interactive 3D Underground map** rendered with React Three Fiber
- **Real-time train positions** powered by TfL’s train arrivals API
- **Custom state machine logic** to manage train movement and update behavior
- **Component unit tests** written with Vitest to ensure reliability and accurate train updates
- **Custom debugging logic** to degug ~300-500 train positions
- **Modern React architecture** designed for performance and maintainability
- **Environment-based deployment workflow** with separate `dev`, `test`, and `main` environments

## Tech Stack

- React Three Fiber (React + THREE.js)
- TypeScript
- Vitest
- Git
- AWS Amplify (deployment & environment management)
- TfL Unified API (live train data)

## Development Workflow

The project uses a **multi-environment workflow** to safely develop and deploy new features.

- **dev** – active development and experimentation
- **test** – staging environment for validation and QA
- **main** – stable production deployment

AWS Amplify handles builds and deployments for each environment, allowing changes to be tested before reaching production.

## Purpose

This project was created to experiment with:

- Real-time data visualisation
- 3D rendering in the browser
- Transport network modelling
- Scalable frontend architecture

## License

MIT
