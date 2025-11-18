
declare const BABYLON: any;

export const createBuddhaStatue = (scene: any, shadowGenerator: any) => {
    const root = new BABYLON.TransformNode("buddhaRoot", scene);
    
    // Position: Peace Park location
    root.position.set(60, 0, -60);
    root.rotation.y = -Math.PI / 4; // Face towards city center

    // --- MATERIALS ---
    const matGold = new BABYLON.PBRMaterial("buddhaGold", scene);
    matGold.albedoColor = new BABYLON.Color3(1.0, 0.8, 0.1); // Deep Gold
    matGold.metallic = 1.0;
    matGold.roughness = 0.25;
    matGold.clearCoat.isEnabled = true;

    const matStone = new BABYLON.StandardMaterial("baseStone", scene);
    matStone.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);

    const matGlow = new BABYLON.StandardMaterial("auraGlow", scene);
    matGlow.emissiveColor = new BABYLON.Color3(1.0, 0.9, 0.5); // Golden Light
    matGlow.alpha = 0.6;

    // --- 1. BASE (Lotus Pedestal) ---
    const baseHeight = 4;
    const baseR = 12;

    // Stone Plinth
    const plinth = BABYLON.MeshBuilder.CreateCylinder("plinth", {
        height: baseHeight,
        diameter: baseR * 2,
        tessellation: 8 // Octagonal
    }, scene);
    plinth.position.y = baseHeight / 2;
    plinth.material = matStone;
    plinth.parent = root;
    plinth.receiveShadows = true;

    // Lotus Petals (Simplified as a Torus Knot or tapered cylinder ring)
    const lotus = BABYLON.MeshBuilder.CreateCylinder("lotus", {
        height: 2,
        diameterTop: baseR * 1.8,
        diameterBottom: baseR * 1.2,
        tessellation: 16
    }, scene);
    lotus.position.y = baseHeight + 1;
    lotus.material = matGold;
    lotus.parent = root;

    // --- 2. BODY (Seated Position) ---
    const bodyY = baseHeight + 2;
    
    // Legs (Crossed) - Represented by a wide, flattened spheroid
    const legs = BABYLON.MeshBuilder.CreateSphere("legs", {
        diameterX: 16,
        diameterZ: 12,
        diameterY: 6
    }, scene);
    legs.position.y = bodyY + 2;
    legs.material = matGold;
    legs.parent = root;
    shadowGenerator.addShadowCaster(legs);

    // Torso (Tapered up)
    const torso = BABYLON.MeshBuilder.CreateCylinder("torso", {
        height: 9,
        diameterBottom: 8,
        diameterTop: 6,
        tessellation: 16
    }, scene);
    torso.position.y = bodyY + 6;
    torso.material = matGold;
    torso.parent = root;
    shadowGenerator.addShadowCaster(torso);

    // Robe Drape (Diagonal sash)
    const sash = BABYLON.MeshBuilder.CreateTorus("sash", {
        diameter: 7.5,
        thickness: 0.5,
        tessellation: 32
    }, scene);
    sash.position.y = bodyY + 6;
    sash.rotation.x = Math.PI / 2; // Lay flat...
    sash.rotation.y = -Math.PI / 4; // Angle it
    sash.rotation.x = 1.0; // Tilt against body
    sash.scaling.y = 0.3; // Flatten against chest
    sash.material = matGold;
    sash.parent = root;

    // Arms / Hands (Resting in lap - Dhyana Mudra)
    const hands = BABYLON.MeshBuilder.CreateSphere("hands", {
        diameterX: 4, diameterY: 2, diameterZ: 3
    }, scene);
    hands.position.set(0, bodyY + 3, 4); // Front of belly
    hands.material = matGold;
    hands.parent = root;

    // --- 3. HEAD ---
    const headY = bodyY + 10.5; // Top of torso (6+4.5)

    // Neck
    const neck = BABYLON.MeshBuilder.CreateCylinder("neck", { height: 1.5, diameter: 3 }, scene);
    neck.position.y = headY;
    neck.material = matGold;
    neck.parent = root;

    // Face
    const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: 5, segments: 16 }, scene);
    head.position.y = headY + 2.5;
    head.material = matGold;
    head.parent = root;
    shadowGenerator.addShadowCaster(head);

    // Ushnisha (Bun)
    const bun = BABYLON.MeshBuilder.CreateSphere("bun", { diameter: 2.5 }, scene);
    bun.position.y = headY + 4.8;
    bun.material = matGold;
    bun.parent = root;

    // Point (Flame/Jewel)
    const point = BABYLON.MeshBuilder.CreateCylinder("point", {
        height: 1.5, diameterBottom: 0.8, diameterTop: 0
    }, scene);
    point.position.y = headY + 6;
    point.material = matGold;
    point.parent = root;

    // Ears (Elongated capsules)
    const earL = BABYLON.MeshBuilder.CreateCapsule("earL", { height: 2.5, radius: 0.4 }, scene);
    earL.position.set(2.3, headY + 2.5, 0);
    earL.material = matGold;
    earL.parent = root;
    
    const earR = earL.clone("earR");
    earR.position.set(-2.3, headY + 2.5, 0);
    earR.parent = root;

    // --- 4. AURA (Halo) ---
    const halo = BABYLON.MeshBuilder.CreateDisc("halo", { radius: 8, tessellation: 32 }, scene);
    halo.position.set(0, headY + 3, -2); // Behind head
    halo.material = matGlow;
    halo.parent = root;
    
    // Animation: Halo Pulse
    let alpha = 0;
    scene.registerBeforeRender(() => {
        alpha += 0.02;
        matGlow.alpha = 0.5 + Math.sin(alpha) * 0.2;
        halo.rotation.z -= 0.005;
    });

    return root;
};
