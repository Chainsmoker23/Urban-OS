
import { setupEnvironment } from './babylon-elements/environment';
import { createGround } from './babylon-elements/ground';
import { createRoads } from './babylon-elements/roads';
import { createTrees, createJungleTrees } from './babylon-elements/trees';
import { createBuildings } from './babylon-elements/buildings';
import { createCars } from './babylon-elements/cars';
import { createAirTraffic } from './babylon-elements/air-traffic';
import { createShips } from './babylon-elements/ships';
import { createOcean } from './babylon-elements/ocean';
import { createSuspensionBridge } from './babylon-elements/infrastructure';
import { createB2Bomber } from './babylon-elements/b2-bomber';
import { createF35Fighters } from './babylon-elements/f35-fighter';
import { createSubmarines } from './babylon-elements/submarine';
import { createHumans } from './babylon-elements/humans';
import { createPowerPlants } from './babylon-elements/power-plant';
import { createBuddhaStatue } from './babylon-elements/statue';

declare const BABYLON: any;

export const createCityScene = (canvas: HTMLCanvasElement) => {
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  
  const scene = new BABYLON.Scene(engine);
  // "Full White and Blue Sky" - Vibrant Daylight
  scene.clearColor = new BABYLON.Color4(0.6, 0.85, 1.0, 1); 
  
  // DISABLE FOG for crystal clear view from distance
  scene.fogEnabled = false;

  // --- CAMERA ---
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 3, Math.PI / 3, 220, new BABYLON.Vector3(0, 0, 0), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 50;
  camera.upperRadiusLimit = 500;
  camera.upperBetaLimit = Math.PI / 2.05; 
  
  camera.useAutoRotationBehavior = true;
  camera.autoRotationBehavior.idleRotationSpeed = 0.05;

  // --- LIGHTING ---
  // Hemisphere (Ambient Sky Light)
  const hemiLight = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.8;
  hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);
  hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);

  // Directional (Sun) - Static bright position
  const dirLight = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.5, -0.8, -0.5), scene);
  dirLight.position = new BABYLON.Vector3(100, 200, 100);
  dirLight.intensity = 1.8;
  
  // Shadows
  const shadowGenerator = new BABYLON.ShadowGenerator(4096, dirLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 16; 
  shadowGenerator.transparencyShadow = true;

  // --- CITY GENERATION ---
  
  const ISLAND_RADIUS = 200; 

  // 1. Environment & Materials
  const { materials } = setupEnvironment(scene, shadowGenerator);
  
  // 2. Sky - Removed dynamic system, using static clearColor above.
  
  // 3. Realistic Ocean
  const updateOcean = createOcean(scene);

  // 4. Realistic Ground
  const { cityFloorRadius, hospitalPos } = createGround(scene, materials, ISLAND_RADIUS);
  
  // 5. Roads 
  createRoads(scene);

  // 6. Trees (Normal + Jungle)
  createTrees(scene, shadowGenerator, ISLAND_RADIUS, cityFloorRadius);
  createJungleTrees(scene, shadowGenerator);
  
  // 7. Buildings
  createBuildings(scene, shadowGenerator, materials, ISLAND_RADIUS);

  // 8. Industrial / Power Plants
  createPowerPlants(scene, shadowGenerator);
  
  // 9. Bridge
  createSuspensionBridge(scene, new BABYLON.Vector3(ISLAND_RADIUS - 10, 0, 0), new BABYLON.Vector3(250 - 20, 0, 0));

  // 10. Landmarks
  createBuddhaStatue(scene, shadowGenerator);

  // 11. Dynamic Traffic
  const updateCars = createCars(scene);
  const updateAir = createAirTraffic(scene);
  const updateShips = createShips(scene);

  // 12. Special Units (B2 BOMBERS - Dual Flight)
  // INCREASED SPEED to 0.02 for visible fast movement
  const b2_1 = createB2Bomber(scene, { altitude: 280, speed: 0.02, startAngle: 0 });
  const b2_2 = createB2Bomber(scene, { altitude: 360, speed: 0.02, startAngle: Math.PI });

  const { update: updateF35 } = createF35Fighters(scene);
  const { update: updateSubs } = createSubmarines(scene);
  
  // 13. Humans (Pedestrians & Drivers)
  const { update: updateHumans } = createHumans(scene);

  // --- RENDER LOOP ---
  scene.registerBeforeRender(() => {
      updateOcean(); // Waves
      updateCars();
      updateAir();
      updateShips();
      
      b2_1.update();
      b2_2.update();

      updateF35();
      updateSubs();
      updateHumans();
  });

  return { engine, scene };
};
