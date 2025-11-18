
declare const BABYLON: any;
declare const earcut: any;

export const createB2Bomber = (scene: any, options: { altitude: number, speed: number, startAngle: number }) => {
    const root = new BABYLON.TransformNode("b2Root", scene);

    // --- MATERIALS ---
    // Real B-2 paint is "Have Glass" - dark gunship grey, actually slightly metallic/sheen
    const matStealth = new BABYLON.PBRMaterial("b2Stealth", scene);
    matStealth.albedoColor = new BABYLON.Color3(0.1, 0.12, 0.14); // Dark Grey (not pitch black) for clarity
    matStealth.metallic = 0.6;
    matStealth.roughness = 0.4; // Smoother for "High Def" reflections
    matStealth.clearCoat.isEnabled = true;
    matStealth.clearCoat.intensity = 0.3;

    const matGlass = new BABYLON.PBRMaterial("b2Glass", scene);
    matGlass.albedoColor = new BABYLON.Color3(0.0, 0.0, 0.0);
    matGlass.metallic = 1.0;
    matGlass.roughness = 0.0;
    matGlass.emissiveColor = new BABYLON.Color3(0.3, 0.2, 0.1); // Gold tint radar reflection

    const matExhaust = new BABYLON.StandardMaterial("b2Exhaust", scene);
    matExhaust.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.05);
    matExhaust.emissiveColor = new BABYLON.Color3(0.6, 0.3, 0.1); // Heat glow

    // --- GEOMETRY ---
    const S = 4.0; // Scale: Massive

    // 1. REFINED WING PLANFORM (High Resolution)
    const span = 20 * S; 
    const chord = 11 * S;
    
    // Coordinates based on the actual "Hawk's Bill" profile
    const profile = [
        new BABYLON.Vector3(0, 0, chord * 0.9), // Nose Tip
        
        // Leading Edge (Smooth Sweep)
        new BABYLON.Vector3(span * 0.55, 0, 0),
        new BABYLON.Vector3(span, 0, -chord * 0.35), // Wingtip
        
        // Trailing Edge (The "Sawtooth" W)
        new BABYLON.Vector3(span * 0.85, 0, -chord * 0.50), // Outer notch
        new BABYLON.Vector3(span * 0.70, 0, -chord * 0.40), // Outer tooth
        new BABYLON.Vector3(span * 0.45, 0, -chord * 0.65), // Mid notch
        new BABYLON.Vector3(span * 0.25, 0, -chord * 0.45), // Mid tooth
        new BABYLON.Vector3(0, 0, -chord * 0.75), // Center Tail
        
        // Mirror Left Side
        new BABYLON.Vector3(-span * 0.25, 0, -chord * 0.45),
        new BABYLON.Vector3(-span * 0.45, 0, -chord * 0.65),
        new BABYLON.Vector3(-span * 0.70, 0, -chord * 0.40),
        new BABYLON.Vector3(-span * 0.85, 0, -chord * 0.50),
        new BABYLON.Vector3(-span, 0, -chord * 0.35),
        new BABYLON.Vector3(-span * 0.55, 0, 0),
    ];

    const wing = BABYLON.MeshBuilder.ExtrudePolygon("b2Wing", {
        shape: profile,
        depth: 1.2 * S, // Thicker body for realism
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    
    // Streamlining: Flatten the wing tips, keep center thick
    // We can't morph vertices easily here, so we scale Y
    wing.scaling.y = 0.3; 
    wing.position.y = 0.4 * S;
    wing.material = matStealth;
    wing.parent = root;

    // 2. COCKPIT HUMP (Aerodynamic Blending)
    // Using a scaled sphere to create the smooth hump
    const cockpit = BABYLON.MeshBuilder.CreateSphere("cockpit", { diameterX: 4.5 * S, diameterY: 2.5 * S, diameterZ: 9 * S }, scene);
    cockpit.position.set(0, 0.6 * S, 2.5 * S);
    cockpit.scaling.y = 0.5; 
    cockpit.material = matStealth;
    cockpit.parent = root;

    // Windows (4 distinct panels)
    const winPositions = [
        { x: 0.6, y: 1.0, z: 4.2, ry: 0.4 },
        { x: 1.8, y: 0.9, z: 3.8, ry: 0.8 },
        { x: -0.6, y: 1.0, z: 4.2, ry: -0.4 },
        { x: -1.8, y: 0.9, z: 3.8, ry: -0.8 },
    ];
    
    winPositions.forEach((p, i) => {
        const w = BABYLON.MeshBuilder.CreatePlane("win"+i, { width: 1.0 * S, height: 0.6 * S }, scene);
        w.position.set(p.x * S, p.y * S, p.z * S);
        w.rotation.x = -Math.PI / 2.5; // Slope back
        w.rotation.y = p.ry;
        w.material = matGlass;
        w.parent = root;
    });


    // 3. ENGINE INTAKES & NACELLES
    // The B-2 has very distinct "humps" for engines with jagged intakes
    const createNacelle = (xDir: number) => {
        const n = BABYLON.MeshBuilder.CreateSphere("nacelle", { diameterX: 3 * S, diameterY: 2 * S, diameterZ: 7 * S }, scene);
        n.position.set(3.5 * S * xDir, 0.65 * S, 1.0 * S);
        n.scaling.y = 0.55;
        n.material = matStealth;
        n.parent = root;
        
        // Intake Cutout (Black box)
        const intake = BABYLON.MeshBuilder.CreateBox("intake", { width: 1.8 * S, height: 0.6 * S, depth: 1 * S }, scene);
        intake.position.set(3.5 * S * xDir, 0.7 * S, 3.8 * S);
        intake.rotation.x = 0.2;
        intake.material = matExhaust; // Dark
        intake.parent = root;

        // Intake Vane (The Zig-Zag Splitter)
        const vane = BABYLON.MeshBuilder.CreateBox("vane", { width: 0.1 * S, height: 0.6 * S, depth: 1.2 * S }, scene);
        vane.position.set(3.5 * S * xDir, 0.7 * S, 3.9 * S);
        vane.rotation.y = 0.1 * xDir;
        vane.material = matStealth; // Body color
        vane.parent = root;

        // Exhaust Ports (Top mounted, flat)
        const exhaust = BABYLON.MeshBuilder.CreatePlane("exhaust", { width: 2.2 * S, height: 0.8 * S }, scene);
        exhaust.position.set(3.5 * S * xDir, 0.6 * S, -2.0 * S);
        exhaust.rotation.x = -Math.PI / 2; // Face up
        exhaust.rotation.z = Math.PI;
        exhaust.material = matExhaust;
        exhaust.parent = root;
    };
    createNacelle(1);
    createNacelle(-1);

    // --- FLIGHT ANIMATION ---
    let angle = options.startAngle;
    const radius = 280; 
    const speed = options.speed; // High Speed
    const altitude = options.altitude;

    const update = () => {
        angle += speed;
        
        // 1. Position on Orbit
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius * 0.9; // Slight oval
        
        // 2. Orientation (Look Ahead)
        const nextX = Math.cos(angle + 0.05) * radius;
        const nextZ = Math.sin(angle + 0.05) * radius * 0.9;
        
        root.position.set(x, altitude, z);
        root.lookAt(new BABYLON.Vector3(nextX, altitude, nextZ));
        
        // 3. Dynamic Banking (Roll into turn)
        // Faster speed = steeper bank
        root.rotation.z = -0.45; 
        
        // 4. "Breathing" Altitude (Slow drift up/down)
        root.position.y = altitude + Math.sin(angle * 2) * 15;
    };

    return { root, update };
};
