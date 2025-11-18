
declare const BABYLON: any;
declare const earcut: any;

export const createF35Fighters = (scene: any) => {
    const squadronRoot = new BABYLON.TransformNode("f35Squadron", scene);

    // --- MATERIALS ---
    const matStealth = new BABYLON.PBRMaterial("f35Stealth", scene);
    matStealth.albedoColor = new BABYLON.Color3(0.2, 0.22, 0.25); // Gunship Grey
    matStealth.metallic = 0.3;
    matStealth.roughness = 0.5;
    matStealth.clearCoat.isEnabled = false;

    const matCanopy = new BABYLON.PBRMaterial("f35Canopy", scene);
    matCanopy.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    matCanopy.metallic = 0.9;
    matCanopy.roughness = 0.1;
    matCanopy.emissiveColor = new BABYLON.Color3(0.4, 0.3, 0.0); // Gold tint radar coating

    const matBurner = new BABYLON.StandardMaterial("f35Burner", scene);
    matBurner.emissiveColor = new BABYLON.Color3(1.0, 0.4, 0.1); // Orange Glow
    matBurner.diffuseColor = new BABYLON.Color3(0, 0, 0);

    // --- GEOMETRY BUILDER ---
    const createF35 = (id: number) => {
        const root = new BABYLON.TransformNode("f35_" + id, scene);
        root.parent = squadronRoot;

        // 1. Fuselage & Wings (Main Planform)
        const len = 10;
        const span = 7;
        
        const profile = [
            new BABYLON.Vector3(0, 0, len/2), // Nose
            
            // Left Side
            new BABYLON.Vector3(-span * 0.15, 0, len * 0.3), // Intake start
            new BABYLON.Vector3(-span * 0.5, 0, -len * 0.2), // Wingtip
            new BABYLON.Vector3(-span * 0.3, 0, -len * 0.4), // Trailing edge
            new BABYLON.Vector3(-span * 0.2, 0, -len * 0.5), // Tail connect
            
            // Center Tail
            new BABYLON.Vector3(0, 0, -len * 0.6), // Engine exhaust
            
            // Right Side
            new BABYLON.Vector3(span * 0.2, 0, -len * 0.5),
            new BABYLON.Vector3(span * 0.3, 0, -len * 0.4),
            new BABYLON.Vector3(span * 0.5, 0, -len * 0.2),
            new BABYLON.Vector3(span * 0.15, 0, len * 0.3),
        ];

        const body = BABYLON.MeshBuilder.ExtrudePolygon("f35Body", {
            shape: profile,
            depth: 0.8,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene, earcut);
        body.position.y = 0;
        // Flatten slightly
        body.scaling.y = 0.7;
        body.material = matStealth;
        body.parent = root;

        // 2. Cockpit Bubble
        const cockpit = BABYLON.MeshBuilder.CreateSphere("canopy", { diameterX: 1.2, diameterY: 0.8, diameterZ: 2.5 }, scene);
        cockpit.position.set(0, 0.4, 1.5);
        cockpit.material = matCanopy;
        cockpit.parent = root;

        // 3. V-Tail (Canted Stabilizers)
        const tailGeo = BABYLON.MeshBuilder.ExtrudePolygon("tailV", {
            shape: [
                new BABYLON.Vector3(0, 0, 0),
                new BABYLON.Vector3(0, 1.5, -1),
                new BABYLON.Vector3(0, 1.5, -2),
                new BABYLON.Vector3(0, 0, -2.5)
            ],
            depth: 0.2
        }, scene, earcut);
        tailGeo.material = matStealth;
        tailGeo.isVisible = false; // Master

        const tailL = tailGeo.createInstance("tailL");
        tailL.parent = root;
        tailL.position.set(-0.8, 0.5, -2.5);
        tailL.rotation.z = 0.3; // Cant outwards
        
        const tailR = tailGeo.createInstance("tailR");
        tailR.parent = root;
        tailR.position.set(0.8, 0.5, -2.5);
        tailR.rotation.z = -0.3;

        // 4. Engine Nozzle
        const nozzle = BABYLON.MeshBuilder.CreateCylinder("nozzle", { diameter: 0.8, height: 0.5 }, scene);
        nozzle.rotation.x = Math.PI / 2;
        nozzle.position.set(0, 0.1, -5.0);
        nozzle.material = matStealth;
        nozzle.parent = root;

        const glow = BABYLON.MeshBuilder.CreateDisc("glow", { radius: 0.35 }, scene);
        glow.rotation.x = Math.PI; // Face back
        glow.position.set(0, 0.1, -5.26);
        glow.material = matBurner;
        glow.parent = root;

        return root;
    };

    // --- SPAWN SQUADRON (5 Jets) ---
    const jets: any[] = [];
    // Formation Offsets (V-Shape)
    // Leader (0,0)
    // Wingmen 1 (-1, -1), 2 (1, -1)
    // Wingmen 3 (-2, -2), 4 (2, -2)
    
    const offsets = [
        { x: 0, z: 0 },
        { x: -8, z: -8 },
        { x: 8, z: -8 },
        { x: -16, z: -16 },
        { x: 16, z: -16 }
    ];

    for (let i = 0; i < 5; i++) {
        const jet = createF35(i);
        jet.position.set(offsets[i].x, 0, offsets[i].z);
        jets.push(jet);
    }

    // --- ANIMATION ---
    let angle = 0;
    const speed = 0.008; // Fast
    const radius = 300;
    const baseAlt = 180;

    const update = () => {
        angle += speed;
        
        // Move the Squadron Container
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle * 2) * (radius * 0.5); // Figure 8
        const y = baseAlt + Math.cos(angle * 3) * 20; // Altitude variance

        squadronRoot.position.set(x, y, z);

        // Calculate Heading
        const nextX = Math.cos(angle + 0.05) * radius;
        const nextZ = Math.sin((angle + 0.05) * 2) * (radius * 0.5);
        const nextY = baseAlt + Math.cos((angle + 0.05) * 3) * 20;

        squadronRoot.lookAt(new BABYLON.Vector3(nextX, nextY, nextZ));

        // Bank Logic
        // Figure 8 banking changes direction
        const bankAngle = Math.cos(angle * 2) * 0.5;
        squadronRoot.rotation.z = -bankAngle; 

        // Individual Micro-Movements (Bobbing)
        jets.forEach((jet, i) => {
            jet.position.y = Math.sin(angle * 10 + i) * 0.2;
        });
    };

    return { update };
};
