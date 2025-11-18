
import { createRealCargoShip } from './cargo-ship';

declare const BABYLON: any;
declare const earcut: any;

/**
 * SHIP MATERIALS & TEXTURES
 */
const createShipMaterials = (scene: any) => {
    // 1. Hull White (Cruise/Yacht)
    const matWhite = new BABYLON.PBRMaterial("hullWhite", scene);
    matWhite.albedoColor = new BABYLON.Color3(0.95, 0.95, 0.95);
    matWhite.metallic = 0.6;
    matWhite.roughness = 0.3;
    matWhite.clearCoat.isEnabled = true;

    // 2. Deck (Teak Wood)
    const matDeck = new BABYLON.StandardMaterial("deckTeak", scene);
    matDeck.diffuseColor = new BABYLON.Color3(0.6, 0.45, 0.3);
    matDeck.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // 3. Glass (Windows)
    const matGlass = new BABYLON.PBRMaterial("shipGlass", scene);
    matGlass.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    matGlass.metallic = 1.0;
    matGlass.roughness = 0.1;
    matGlass.alpha = 0.9;

    // 4. Pool Water
    const matPool = new BABYLON.StandardMaterial("poolWater", scene);
    matPool.emissiveColor = new BABYLON.Color3(0, 1, 1);
    matPool.alpha = 0.8;

    return { matWhite, matDeck, matGlass, matPool };
};

/**
 * HELPERS
 */
const createHullShape = (length: number, width: number, sharpness: number) => {
    // Creates a boat hull profile on XZ plane
    const shape = [];
    const halfW = width / 2;
    const halfL = length / 2;

    // Stern (Back) - Slightly rounded
    shape.push(new BABYLON.Vector3(-halfL, 0, -halfW * 0.8));
    shape.push(new BABYLON.Vector3(-halfL, 0, halfW * 0.8));

    // Midship
    shape.push(new BABYLON.Vector3(-halfL * 0.5, 0, halfW));
    shape.push(new BABYLON.Vector3(0, 0, halfW));
    
    // Bow (Front) - Tapered
    shape.push(new BABYLON.Vector3(halfL * sharpness, 0, halfW * 0.6));
    shape.push(new BABYLON.Vector3(halfL, 0, 0)); // Tip
    shape.push(new BABYLON.Vector3(halfL * sharpness, 0, -halfW * 0.6));

    // Midship other side
    shape.push(new BABYLON.Vector3(0, 0, -halfW));
    shape.push(new BABYLON.Vector3(-halfL * 0.5, 0, -halfW));

    return shape;
};

/**
 * BUILDER: CRUISE SHIP
 */
const createCruiseShip = (scene: any, mats: any) => {
    const root = new BABYLON.TransformNode("cruiseRoot", scene);
    const length = 60;
    const width = 10;
    const hullHeight = 5;

    // 1. Hull
    const hullShape = createHullShape(length, width, 0.7);
    const hull = BABYLON.MeshBuilder.ExtrudePolygon("hull", {
        shape: hullShape,
        depth: hullHeight,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    hull.position.y = 0.5;
    hull.material = mats.matWhite;
    hull.parent = root;

    // 2. Decks (Superstructure)
    const deckCount = 3;
    let currentL = length * 0.8;
    let currentW = width * 0.9;
    let currentY = hullHeight;

    for(let i=0; i<deckCount; i++) {
        const deckH = 1.5;
        const deck = BABYLON.MeshBuilder.CreateBox("deck"+i, { width: currentL, height: deckH, depth: currentW }, scene);
        deck.position.set(-2, currentY + deckH/2, 0); // Shift back slightly
        deck.material = mats.matWhite;
        deck.parent = root;

        // Glass Balcony Strip
        const glass = BABYLON.MeshBuilder.CreateBox("glass"+i, { width: currentL + 0.2, height: deckH * 0.6, depth: currentW + 0.2 }, scene);
        glass.position.set(-2, currentY + deckH/2, 0);
        glass.material = mats.matGlass;
        glass.parent = root;

        currentY += deckH;
        currentL *= 0.9;
        currentW *= 0.9;
    }

    // 3. Top Deck Details
    // Pool
    const pool = BABYLON.MeshBuilder.CreateBox("pool", { width: 6, height: 0.1, depth: 3 }, scene);
    pool.position.set(0, currentY + 0.1, 0);
    pool.material = mats.matPool;
    pool.parent = root;

    // Funnel (Smokestack)
    const funnel = BABYLON.MeshBuilder.CreateCylinder("funnel", { height: 3, diameter: 2, tessellation: 16 }, scene);
    funnel.position.set(-10, currentY + 1.5, 0);
    funnel.rotation.z = -0.2; // Tilt back
    const matRed = new BABYLON.StandardMaterial("funnelRed", scene);
    matRed.diffuseColor = new BABYLON.Color3(0.8, 0, 0);
    funnel.material = matRed;
    funnel.parent = root;

    return root;
};

/**
 * BUILDER: LUXURY YACHT
 */
const createYacht = (scene: any, mats: any) => {
    const root = new BABYLON.TransformNode("yachtRoot", scene);
    const length = 18;
    const width = 4.5;
    
    // Sleek Hull
    const hullShape = createHullShape(length, width, 0.5);
    const hull = BABYLON.MeshBuilder.ExtrudePolygon("hull", {
        shape: hullShape,
        depth: 2.5,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    hull.position.y = 0.2;
    hull.material = mats.matWhite;
    hull.parent = root;

    // Cabin
    const cabin = BABYLON.MeshBuilder.CreateBox("cabin", { width: 8, height: 1.5, depth: 3 }, scene);
    cabin.position.set(-2, 2.5 + 0.75, 0);
    cabin.material = mats.matWhite;
    cabin.parent = root;

    // Windshield (Black glass)
    const wind = BABYLON.MeshBuilder.CreateBox("wind", { width: 2, height: 1.2, depth: 3.1 }, scene);
    wind.position.set(2, 2.5 + 0.8, 0);
    wind.rotation.z = -0.3; // Rake back
    wind.material = mats.matGlass;
    wind.parent = root;

    return root;
};

/**
 * MAIN EXPORT
 */
export const createShips = (scene: any) => {
    const mats = createShipMaterials(scene);
    const ships: any[] = [];

    // 1. Spawn Cargo Ships (Deep Water)
    // Hospital Island is at Radius 250 (spanning 210-290).
    // Cargo ships moved to 360+ to avoid collision.
    for(let i=0; i<3; i++) {
        const ship = createRealCargoShip(scene);
        const angle = (i / 3) * Math.PI * 2;
        ships.push({
            root: ship,
            angle,
            radius: 360 + Math.random() * 40, 
            speed: 0.0005, 
            bobOffset: Math.random() * 10
        });
    }

    // 2. Spawn Cruise Ship (Outside Islands)
    const cruise = createCruiseShip(scene, mats);
    ships.push({
        root: cruise,
        angle: Math.PI,
        radius: 330, // Safe distance outside hospital island
        speed: 0.0008,
        bobOffset: 0
    });

    // 3. Spawn Yachts (Near Coast of Hospital)
    for(let i=0; i<5; i++) {
        const yacht = createYacht(scene, mats);
        const angle = (i / 5) * Math.PI * 2 + Math.random();
        ships.push({
            root: yacht,
            angle,
            radius: 300 + Math.random() * 20, // Just outside the hospital island reef
            speed: 0.0015, 
            bobOffset: Math.random() * 10
        });
    }

    let time = 0;

    return () => {
        time += 0.01;
        ships.forEach(ship => {
            // Orbit
            ship.angle += ship.speed;
            const x = Math.cos(ship.angle) * ship.radius;
            const z = Math.sin(ship.angle) * ship.radius;
            
            ship.root.position.set(x, 0, z);
            
            // Orient tangents
            // Move angle slightly forward to lookAt
            const nextX = Math.cos(ship.angle + 0.01) * ship.radius;
            const nextZ = Math.sin(ship.angle + 0.01) * ship.radius;
            ship.root.lookAt(new BABYLON.Vector3(nextX, 0, nextZ));
            
            // Fix orientation (Models built along X, lookAt expects Z)
            ship.root.rotate(BABYLON.Axis.Y, -Math.PI / 2, BABYLON.Space.LOCAL);

            // Bobbing Physics
            const bob = Math.sin(time + ship.bobOffset) * 0.2;
            const roll = Math.sin(time * 0.5 + ship.bobOffset) * 0.05;
            
            // Match new ocean level (-1.5)
            ship.root.position.y = -1.6 + bob; 
            ship.root.rotation.x = roll; // Gentle roll
        });
    };
};
