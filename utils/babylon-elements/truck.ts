
import { ROAD_ZONES } from './roads';

declare const BABYLON: any;
declare const earcut: any;

export const createTruck = (scene: any, mats: any) => {
    const root = new BABYLON.TransformNode("truckRoot", scene);

    // --- MATERIALS ---
    const matCab = new BABYLON.PBRMaterial("truckCab", scene);
    matCab.albedoColor = new BABYLON.Color3(0.05, 0.2, 0.5); // Metallic Blue
    matCab.metallic = 0.7;
    matCab.roughness = 0.2;
    matCab.clearCoat.isEnabled = true;

    const matTrailer = new BABYLON.StandardMaterial("truckTrailer", scene);
    matTrailer.diffuseColor = new BABYLON.Color3(0.92, 0.92, 0.92); 
    matTrailer.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    
    // Chrome
    const matChrome = new BABYLON.PBRMaterial("chrome", scene);
    matChrome.metallic = 1.0;
    matChrome.roughness = 0.1;
    matChrome.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.9);

    const matDark = new BABYLON.StandardMaterial("truckDark", scene);
    matDark.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // --- 1. CAB (Detailed) ---
    const cabWidth = 2.4;
    
    // Profile
    const profile = [
        new BABYLON.Vector3(-1.2, 0.6, 0),  
        new BABYLON.Vector3(-1.2, 3.1, 0),  
        new BABYLON.Vector3(0.4, 3.1, 0),   
        new BABYLON.Vector3(1.1, 2.2, 0),   // Windshield slope
        new BABYLON.Vector3(1.7, 1.4, 0),   // Nose
        new BABYLON.Vector3(1.7, 0.6, 0),   
        new BABYLON.Vector3(-1.2, 0.6, 0)   
    ];

    const cab = BABYLON.MeshBuilder.ExtrudePolygon("cab", {
        shape: profile,
        depth: cabWidth,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);

    cab.rotation.x = -Math.PI / 2;
    cab.rotation.y = -Math.PI / 2;
    cab.position.x = cabWidth / 2; 
    cab.position.y = 0.5; 
    cab.material = matCab;
    cab.parent = root;

    // Windshield
    const wind = BABYLON.MeshBuilder.CreateBox("wind", { width: 0.1, height: 0.9, depth: 2.2 }, scene);
    wind.rotation.z = 0.9; 
    wind.position.set(1.25, 2.5, 0);
    wind.material = mats.glass; 
    wind.parent = root;

    // Grille & Bumper
    const grille = BABYLON.MeshBuilder.CreateBox("grille", { width: 0.1, height: 0.8, depth: 1.8 }, scene);
    grille.position.set(1.75, 1.0, 0);
    grille.material = matChrome;
    grille.parent = root;
    
    const bumper = BABYLON.MeshBuilder.CreateBox("bumper", { width: 0.5, height: 0.4, depth: 2.5 }, scene);
    bumper.position.set(1.8, 0.6, 0);
    bumper.material = matDark;
    bumper.parent = root;

    // Mirrors
    const mirrorL = BABYLON.MeshBuilder.CreateBox("mirrorL", { width: 0.1, height: 0.5, depth: 0.3 }, scene);
    mirrorL.position.set(1.0, 2.4, 1.4);
    mirrorL.rotation.y = -0.2;
    mirrorL.material = matChrome;
    mirrorL.parent = root;
    
    const mirrorR = mirrorL.clone("mirrorR");
    mirrorR.position.z = -1.4;
    mirrorR.rotation.y = 0.2;
    mirrorR.parent = root;

    // Exhaust Stacks
    const stackL = BABYLON.MeshBuilder.CreateCylinder("stackL", { height: 3.5, diameter: 0.2 }, scene);
    stackL.position.set(-1.0, 2.0, 0.8);
    stackL.material = matChrome;
    stackL.parent = root;
    
    const stackR = stackL.clone("stackR");
    stackR.position.z = -0.8;
    stackR.parent = root;


    // --- 2. CHASSIS DETAILS ---
    // Fuel Tank
    const tank = BABYLON.MeshBuilder.CreateCylinder("tank", { height: 1.5, diameter: 0.7 }, scene);
    tank.rotation.z = Math.PI / 2;
    tank.position.set(-0.5, 0.8, 1.0); // Side
    tank.material = matChrome;
    tank.parent = root;
    
    const tank2 = tank.clone("tank2");
    tank2.position.z = -1.0;
    tank2.parent = root;


    // --- 3. TRAILER (Corrugated) ---
    const tLen = 9;
    const tWidth = 2.6;
    const tHeight = 3.2;
    
    const trailer = BABYLON.MeshBuilder.CreateBox("trailer", { width: tLen, height: tHeight, depth: tWidth }, scene);
    trailer.position.set(-5.0, 2.3, 0);
    trailer.material = matTrailer;
    trailer.parent = root;

    // Side Guards
    const guard = BABYLON.MeshBuilder.CreateBox("guard", { width: 3, height: 0.1, depth: 0.1 }, scene);
    guard.position.set(-4.5, 0.6, 1.2);
    guard.material = matDark;
    guard.parent = root;
    
    const guard2 = guard.clone("guard2");
    guard2.position.z = -1.2;
    guard2.parent = root;


    // --- 4. WHEELS (10-Wheeler) ---
    const wheelGeo = BABYLON.MeshBuilder.CreateCylinder("truckWheel", { diameter: 1.05, height: 0.45 }, scene);
    wheelGeo.rotation.z = Math.PI / 2;
    wheelGeo.material = mats.rubber;
    
    // Rim
    const rimGeo = BABYLON.MeshBuilder.CreateCylinder("truckRim", { diameter: 0.6, height: 0.46 }, scene);
    rimGeo.rotation.z = Math.PI / 2;
    rimGeo.material = matChrome;
    rimGeo.parent = wheelGeo;

    const wheels: any[] = [];

    const addAxle = (xPos: number) => {
        const wL = wheelGeo.clone("wL");
        wL.position.set(xPos, 0.55, 1.1);
        wL.parent = root;
        wheels.push(wL);

        const wR = wheelGeo.clone("wR");
        wR.position.set(xPos, 0.55, -1.1);
        wR.parent = root;
        wheels.push(wR);
    };

    addAxle(1.0);    // Front Cab
    addAxle(-1.8);   // Rear Cab 1
    addAxle(-3.0);   // Rear Cab 2
    addAxle(-7.5);   // Rear Trailer 1
    addAxle(-8.8);   // Rear Trailer 2

    wheelGeo.dispose();

    return { root, wheels };
};
