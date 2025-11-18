
import { ROAD_ZONES } from './roads';
import { createTruck } from './truck';

declare const BABYLON: any;
declare const earcut: any;

// --- MATERIALS ---
const createCarMaterials = (scene: any) => {
    const paints = [];
    
    // 1. Rosso Corsa (Red)
    const red = new BABYLON.PBRMaterial("paintRed", scene);
    red.metallic = 0.6;
    red.roughness = 0.25;
    red.albedoColor = new BABYLON.Color3(0.7, 0.02, 0.02);
    red.clearCoat.isEnabled = true;
    red.clearCoat.intensity = 1.0;
    paints.push(red);

    // 2. Sunburst Yellow
    const yellow = new BABYLON.PBRMaterial("paintYellow", scene);
    yellow.metallic = 0.6;
    yellow.roughness = 0.25;
    yellow.albedoColor = new BABYLON.Color3(0.95, 0.7, 0.05);
    yellow.clearCoat.isEnabled = true;
    paints.push(yellow);

    // 3. Deep Blue
    const blue = new BABYLON.PBRMaterial("paintBlue", scene);
    blue.metallic = 0.7;
    blue.roughness = 0.2;
    blue.albedoColor = new BABYLON.Color3(0.02, 0.1, 0.5);
    blue.clearCoat.isEnabled = true;
    paints.push(blue);

    // 4. Hyper Silver
    const silver = new BABYLON.PBRMaterial("paintSilver", scene);
    silver.metallic = 0.9;
    silver.roughness = 0.2;
    silver.albedoColor = new BABYLON.Color3(0.7, 0.75, 0.8);
    silver.clearCoat.isEnabled = true;
    paints.push(silver);

    // Glass (Dark Tint)
    const glass = new BABYLON.PBRMaterial("carGlass", scene);
    glass.albedoColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    glass.metallic = 0.8;
    glass.roughness = 0.0;
    glass.alpha = 0.9; // Almost opaque for privacy

    // Rubber (Tires)
    const rubber = new BABYLON.StandardMaterial("rubber", scene);
    rubber.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    rubber.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    
    // Rims (Chrome)
    const rim = new BABYLON.PBRMaterial("rim", scene);
    rim.metallic = 1.0;
    rim.roughness = 0.1;
    rim.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.9);

    // Plastic/Carbon (Black Trim)
    const trim = new BABYLON.StandardMaterial("trim", scene);
    trim.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    // Lights
    const lightFront = new BABYLON.StandardMaterial("lightFront", scene);
    lightFront.emissiveColor = new BABYLON.Color3(0.9, 0.9, 1.0);
    
    const lightRear = new BABYLON.StandardMaterial("lightRear", scene);
    lightRear.emissiveColor = new BABYLON.Color3(1.0, 0.1, 0.1);

    return { paints, glass, rubber, rim, trim, lightFront, lightRear };
};

// --- HELPERS ---

const addWheels = (scene: any, parent: any, mats: any, xPos: number, zPos: number, radius: number, width: number) => {
    const wheel = BABYLON.MeshBuilder.CreateCylinder("w", { diameter: radius*2, height: width }, scene);
    wheel.rotation.x = Math.PI / 2; // Rolling direction
    wheel.material = mats.rubber;
    
    // Rim
    const rim = BABYLON.MeshBuilder.CreateCylinder("r", { diameter: radius*1.2, height: width + 0.02 }, scene);
    rim.material = mats.rim;
    rim.parent = wheel;
    
    // Spokes (Texture or geo) - Simple Geo
    const spoke = BABYLON.MeshBuilder.CreateBox("s", { width: radius*1.0, height: width+0.04, depth: radius*0.2 }, scene);
    spoke.parent = wheel;
    spoke.material = mats.rim;
    const spoke2 = spoke.clone("s2"); spoke2.rotation.y = Math.PI/2; spoke2.parent = wheel;

    // Instances
    const fl = wheel.clone("fl"); fl.position.set(xPos, radius, -zPos); fl.parent = parent;
    const fr = wheel.clone("fr"); fr.position.set(xPos, radius, zPos); fr.parent = parent;
    const rl = wheel.clone("rl"); rl.position.set(-xPos, radius, -zPos); rl.parent = parent;
    const rr = wheel.clone("rr"); rr.position.set(-xPos, radius, zPos); rr.parent = parent;

    wheel.dispose(); // Master

    return [fl, fr, rl, rr];
};

// --- MODELS ---

/**
 * LAMBORGHINI AVENTADOR STYLE
 * Sharp, angular, wedge shape.
 */
const createLambo = (scene: any, mats: any) => {
    const root = new BABYLON.TransformNode("lamboRoot", scene);
    const paint = mats.paints[1]; // Yellow

    // 1. Lower Chassis (Wide Wedge)
    const chassisProfile = [
        new BABYLON.Vector3(-2.3, 0.3, 0),
        new BABYLON.Vector3(-2.3, 0.9, 0),
        new BABYLON.Vector3(2.4, 0.6, 0), // Nose
        new BABYLON.Vector3(2.2, 0.2, 0)
    ];
    const chassis = BABYLON.MeshBuilder.ExtrudePolygon("chassis", {
        shape: chassisProfile, depth: 2.0, sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    chassis.rotation.x = -Math.PI/2; chassis.rotation.y = -Math.PI/2;
    chassis.position.y = 0.3; chassis.position.x = 1.0; // Centering
    chassis.material = paint;
    chassis.parent = root;

    // 2. Cabin (Narrower, Glass Bubble)
    const cabinProfile = [
        new BABYLON.Vector3(-0.8, 0.9, 0),
        new BABYLON.Vector3(-1.2, 0.9, 0), // Engine deck
        new BABYLON.Vector3(-0.2, 1.5, 0), // Roof back
        new BABYLON.Vector3(0.6, 1.5, 0),  // Roof front
        new BABYLON.Vector3(1.5, 0.7, 0)   // Windshield base
    ];
    const cabin = BABYLON.MeshBuilder.ExtrudePolygon("cabin", {
        shape: cabinProfile, depth: 1.4, sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    cabin.rotation.x = -Math.PI/2; cabin.rotation.y = -Math.PI/2;
    cabin.position.y = 0.3; cabin.position.x = 0.7;
    cabin.material = mats.glass;
    cabin.parent = root;

    // 3. Side Intakes (Black)
    const intake = BABYLON.MeshBuilder.CreateBox("intake", { width: 1.2, height: 0.5, depth: 2.2 }, scene);
    intake.position.set(-0.5, 0.7, 0);
    intake.material = mats.trim;
    intake.parent = root;
    // Scale negative to cut? No, just black block sticking out slightly
    intake.scaling.x = 0.8;

    // 4. Rear Louvers (Engine Cover)
    for(let i=0; i<5; i++) {
        const louver = BABYLON.MeshBuilder.CreateBox("louver", { width: 0.1, height: 0.05, depth: 1.2 }, scene);
        louver.position.set(-1.2 - (i*0.15), 1.0 - (i*0.02), 0);
        louver.rotation.z = 0.2;
        louver.material = mats.trim;
        louver.parent = root;
    }

    // 5. Wheels
    const wheels = addWheels(scene, root, mats, 1.4, 0.9, 0.38, 0.4);

    // Lights
    const headL = BABYLON.MeshBuilder.CreatePlane("hl", { size: 0.3 }, scene);
    headL.rotation.x = Math.PI/2; headL.rotation.y = -0.2;
    headL.position.set(2.2, 0.6, 0.6); headL.material = mats.lightFront; headL.parent = root;
    const headR = headL.clone(); headR.position.z = -0.6; headR.rotation.y = 0.2; headR.parent = root;

    return { root, wheels };
};

/**
 * BUGATTI CHIRON STYLE
 * Curvy, C-shape side, two-tone.
 */
const createBugatti = (scene: any, mats: any) => {
    const root = new BABYLON.TransformNode("bugattiRoot", scene);
    const paintMain = mats.paints[2]; // Blue
    const paintSec = mats.paints[3]; // Silver (or Black)

    // 1. Main Body (Curved)
    const bodyProfile = [];
    for(let i=0; i<=10; i++) {
        const t = i/10;
        const x = -2.0 + (t * 4.2);
        const y = 0.3 + Math.sin(t * Math.PI) * 0.6; // Arch
        bodyProfile.push(new BABYLON.Vector3(x, y, 0));
    }
    bodyProfile.push(new BABYLON.Vector3(2.2, 0.2, 0));
    bodyProfile.push(new BABYLON.Vector3(-2.0, 0.2, 0));

    const body = BABYLON.MeshBuilder.ExtrudePolygon("body", {
        shape: bodyProfile, depth: 1.9, sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    body.rotation.x = -Math.PI/2; body.rotation.y = -Math.PI/2;
    body.position.y = 0.3; body.position.x = 0.95;
    body.material = paintMain;
    body.parent = root;

    // 2. C-Bar (Side Curve Feature)
    // Torus segment on side
    const cCurve = BABYLON.MeshBuilder.CreateTorus("cCurve", { diameter: 1.5, thickness: 0.15, tessellation: 32 }, scene);
    cCurve.rotation.z = Math.PI/2;
    cCurve.scaling.y = 1.5; // Oval
    cCurve.position.set(-0.2, 0.8, 0.95);
    cCurve.material = paintSec;
    cCurve.parent = root;
    
    const cCurve2 = cCurve.clone();
    cCurve2.position.z = -0.95;
    cCurve2.parent = root;

    // 3. Cabin Bubble
    const cabin = BABYLON.MeshBuilder.CreateSphere("cabin", { diameterX: 2.5, diameterY: 1.0, diameterZ: 1.5 }, scene);
    cabin.position.set(0, 0.9, 0);
    cabin.material = mats.glass;
    cabin.parent = root;

    // 4. Horseshoe Grille
    const grille = BABYLON.MeshBuilder.CreateTorus("grille", { diameter: 0.6, thickness: 0.1 }, scene);
    grille.rotation.y = Math.PI/2;
    grille.position.set(2.2, 0.5, 0);
    grille.material = mats.rim;
    grille.parent = root;

    // 5. Wheels
    const wheels = addWheels(scene, root, mats, 1.3, 0.85, 0.4, 0.4);

    return { root, wheels };
};

/**
 * LAND ROVER DEFENDER STYLE
 * Boxy, rugged, external spare, roof rack.
 */
const createDefender = (scene: any, mats: any) => {
    const root = new BABYLON.TransformNode("defenderRoot", scene);
    const paint = mats.paints[3]; // Silver/Green
    const black = mats.trim;

    // 1. Main Box Body
    const body = BABYLON.MeshBuilder.CreateBox("body", { width: 4.2, height: 1.2, depth: 2.0 }, scene);
    body.position.y = 0.9;
    body.material = paint;
    body.parent = root;

    // 2. Upper Cabin (Boxy with slight taper)
    const cabin = BABYLON.MeshBuilder.CreateBox("cabin", { width: 3.0, height: 0.9, depth: 1.9 }, scene);
    cabin.position.set(-0.2, 1.9, 0);
    cabin.material = mats.glass; // Tinted windows all around
    cabin.parent = root;

    // Roof (Solid cap)
    const roof = BABYLON.MeshBuilder.CreateBox("roof", { width: 3.1, height: 0.1, depth: 1.95 }, scene);
    roof.position.set(-0.2, 2.4, 0);
    roof.material = mats.paints[0]; // White roof contrast? Or same. Let's do White.
    roof.parent = root;

    // 3. Wheel Arches (Fender Flares) - Black Plastic
    const archGeo = BABYLON.MeshBuilder.CreateCylinder("arch", { diameter: 1.4, height: 0.2, tessellation: 24 }, scene);
    archGeo.rotation.x = Math.PI/2;
    archGeo.material = black;
    
    const arches = [
        { x: 1.3, z: 1.0 }, { x: 1.3, z: -1.0 },
        { x: -1.3, z: 1.0 }, { x: -1.3, z: -1.0 }
    ];
    arches.forEach(pos => {
        const a = archGeo.clone("a");
        a.position.set(pos.x, 0.6, pos.z);
        a.parent = root;
    });
    archGeo.dispose();

    // 4. Front Bullbar
    const bullbar = BABYLON.MeshBuilder.CreateBox("bullbar", { width: 0.2, height: 0.8, depth: 1.6 }, scene);
    bullbar.position.set(2.2, 0.8, 0);
    bullbar.material = black;
    bullbar.parent = root;

    // 5. Spare Tire (Rear)
    const spare = BABYLON.MeshBuilder.CreateCylinder("spare", { diameter: 0.9, height: 0.3 }, scene);
    spare.rotation.x = Math.PI/2;
    spare.rotation.z = Math.PI/2;
    spare.position.set(-2.2, 1.2, 0);
    spare.material = mats.rubber;
    spare.parent = root;

    // 6. Wheels
    const wheels = addWheels(scene, root, mats, 1.3, 0.9, 0.45, 0.5);

    // 7. Headlights (Round)
    const hl = BABYLON.MeshBuilder.CreateCylinder("hl", { diameter: 0.3, height: 0.1 }, scene);
    hl.rotation.z = Math.PI/2;
    hl.position.set(2.1, 1.1, 0.6);
    hl.material = mats.lightFront;
    hl.parent = root;
    const hr = hl.clone(); hr.position.z = -0.6; hr.parent = root;

    return { root, wheels };
};

// --- TRAFFIC LOGIC ---

export const createCars = (scene: any) => {
    const mats = createCarMaterials(scene);
    const cars: any[] = [];
    const NUM_CARS = 100; 

    for (let i = 0; i < NUM_CARS; i++) {
        const r = Math.random();
        let carObj;
        let isTruck = false;

        if (r < 0.15) {
             carObj = createTruck(scene, mats);
             isTruck = true;
        } else if (r < 0.45) {
             carObj = createLambo(scene, mats);
        } else if (r < 0.7) {
             carObj = createBugatti(scene, mats);
        } else {
             carObj = createDefender(scene, mats);
        }

        const zone = ROAD_ZONES[Math.floor(Math.random() * ROAD_ZONES.length)];
        
        const laneCount = 3;
        const laneIdx = Math.floor(Math.random() * laneCount); 
        const laneWidth = zone.width / laneCount;
        const offset = (laneIdx - 1) * (laneWidth * 0.6); 
        
        const radius = zone.radius + offset;
        const direction = (laneIdx % 2 === 0) ? 1 : -1; 
        
        let speed = (0.2 + Math.random() * 0.1) * direction; 
        if (isTruck) speed *= 0.6;

        cars.push({
            root: carObj.root,
            wheels: carObj.wheels,
            angle: Math.random() * Math.PI * 2,
            radius,
            speed: speed / radius
        });
    }

    const updateCars = () => {
        cars.forEach(car => {
            car.angle += car.speed;
            
            const x = Math.cos(car.angle) * car.radius;
            const z = Math.sin(car.angle) * car.radius;
            car.root.position.set(x, 0, z); 
            
            const lookAngle = car.angle + (car.speed > 0 ? 0.1 : -0.1);
            const lx = Math.cos(lookAngle) * car.radius;
            const lz = Math.sin(lookAngle) * car.radius;
            
            car.root.lookAt(new BABYLON.Vector3(lx, 0, lz));
            
            // Models built along X+
            // lookAt points Z+ to target
            // We need to rotate -90 Y to align X model with Z forward
            car.root.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.LOCAL);

            if (car.wheels) {
                car.wheels.forEach((w: any) => {
                    w.rotation.y += Math.abs(car.speed) * 350; 
                });
            }
        });
    };

    return updateCars;
};
