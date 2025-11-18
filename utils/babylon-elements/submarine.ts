
declare const BABYLON: any;

export const createSubmarines = (scene: any) => {
    const root = new BABYLON.TransformNode("subSquadron", scene);

    // --- MATERIALS ---
    const matHull = new BABYLON.PBRMaterial("subHull", scene);
    matHull.albedoColor = new BABYLON.Color3(0.1, 0.12, 0.15); // Dark Slate / Black
    matHull.metallic = 0.8;
    matHull.roughness = 0.4;
    matHull.clearCoat.isEnabled = true;
    matHull.clearCoat.intensity = 0.5; // Wet look

    const matNuclear = new BABYLON.StandardMaterial("subNuke", scene);
    matNuclear.emissiveColor = new BABYLON.Color3(0.0, 0.8, 1.0); // Cherenkov Blue Glow
    matNuclear.diffuseColor = new BABYLON.Color3(0, 0, 0);
    
    const matProp = new BABYLON.PBRMaterial("subProp", scene);
    matProp.albedoColor = new BABYLON.Color3(0.6, 0.5, 0.2); // Bronze
    matProp.metallic = 1.0;
    matProp.roughness = 0.3;

    // --- SINGLE SUB BUILDER ---
    const createSub = (id: number) => {
        const subRoot = new BABYLON.TransformNode("sub_" + id, scene);
        subRoot.parent = root;

        // 1. Main Hull (Cigar shape)
        const hullLength = 18;
        const hullDiam = 2.2;
        
        // Main Cylinder (Horizontal via rotation)
        const hull = BABYLON.MeshBuilder.CreateCylinder("hull", {
            height: hullLength,
            diameter: hullDiam,
            tessellation: 24
        }, scene);
        hull.rotation.z = Math.PI / 2; 
        hull.material = matHull;
        hull.parent = subRoot;

        // Nose (Hemisphere-ish)
        const nose = BABYLON.MeshBuilder.CreateSphere("nose", { diameter: hullDiam }, scene);
        nose.position.x = hullLength / 2;
        nose.scaling.x = 1.5; // Elongate
        nose.material = matHull;
        nose.parent = subRoot;

        // Tail (Tapered)
        const tail = BABYLON.MeshBuilder.CreateCylinder("tail", {
            height: 6,
            diameterTop: hullDiam,
            diameterBottom: 0.2
        }, scene);
        tail.rotation.z = Math.PI / 2;
        tail.position.x = -hullLength / 2 - 3;
        tail.material = matHull;
        tail.parent = subRoot;

        // 2. Conning Tower (Sail)
        const sailL = 3.5;
        const sailH = 2.2;
        const sailW = 1.2;
        
        // Streamlined Sail
        const sail = BABYLON.MeshBuilder.CreateBox("sail", { width: sailL, height: sailH, depth: sailW }, scene);
        sail.position.set(3, hullDiam/2 + sailH/2 - 0.3, 0);
        sail.material = matHull;
        sail.parent = subRoot;
        
        // Fillet/Curve the sail front? (Simple box is okay for distance)

        // Diving Planes (on Sail)
        const planes = BABYLON.MeshBuilder.CreateBox("planes", { width: 1.2, height: 0.15, depth: 4.5 }, scene);
        planes.position.y = 0.5;
        planes.parent = sail;
        planes.material = matHull;

        // Periscopes
        const mast = BABYLON.MeshBuilder.CreateCylinder("mast", { height: 1.5, diameter: 0.15 }, scene);
        mast.position.set(0.5, sailH/2 + 0.75, 0);
        mast.material = matHull;
        mast.parent = sail;

        // 3. Missile Hatches (VLS)
        for(let m=0; m<8; m++) {
            const hatch = BABYLON.MeshBuilder.CreateCylinder("hatch", { height: 0.1, diameter: 0.7 }, scene);
            // Place behind sail
            hatch.position.set(-1 - (m*1.2), hullDiam/2, 0); 
            hatch.material = matHull; // Or slightly different color
            hatch.parent = subRoot;
        }

        // 4. Tail Fins (Cruciform)
        const finV = BABYLON.MeshBuilder.CreateBox("finV", { width: 2.5, height: 5.5, depth: 0.25 }, scene);
        finV.position.x = -hullLength/2 - 3.5;
        finV.material = matHull;
        finV.parent = subRoot;

        const finH = BABYLON.MeshBuilder.CreateBox("finH", { width: 2.5, height: 0.25, depth: 5.5 }, scene);
        finH.position.x = -hullLength/2 - 3.5;
        finH.material = matHull;
        finH.parent = subRoot;

        // 5. Propeller
        const prop = BABYLON.MeshBuilder.CreateCylinder("prop", { diameter: 2.8, height: 0.2 }, scene);
        prop.rotation.z = Math.PI / 2;
        prop.position.x = -hullLength/2 - 6.1;
        prop.material = matProp;
        
        // Blades
        const b1 = BABYLON.MeshBuilder.CreateBox("b1", { width: 0.1, height: 3, depth: 0.4 }, scene);
        b1.parent = prop;
        const b2 = b1.clone("b2");
        b2.rotation.x = Math.PI/2;
        b2.parent = prop;
        
        prop.parent = subRoot;

        // 6. Reactor Glow Ring
        const glow = BABYLON.MeshBuilder.CreateCylinder("glow", { height: 0.6, diameter: hullDiam + 0.02 }, scene);
        glow.rotation.z = Math.PI / 2;
        glow.position.x = -4.5;
        glow.material = matNuclear;
        glow.parent = subRoot;

        return { root: subRoot, prop };
    };

    // --- SPAWN SQUADRON ---
    const subs: any[] = [];
    const count = 7; // "7 squad submarines"
    
    for(let i=0; i<count; i++) {
        const sub = createSub(i);
        
        // Wolfpack Formation
        // Leader at 0,0
        // Others staggered back and sideways
        const row = Math.floor((i+1)/2);
        const side = (i % 2 === 0) ? 1 : -1;
        
        // Leader (i=0) -> row=0, side? logic fix:
        // 0 -> 0,0
        // 1,2 -> Row 1
        // 3,4 -> Row 2
        // 5,6 -> Row 3
        
        let xOff = 0, zOff = 0;
        if (i > 0) {
            xOff = -row * 15; // 15 units back per row
            zOff = side * row * 10; // 10 units side per row
        }
        
        sub.root.position.set(xOff, 0, zOff);
        subs.push(sub);
    }

    // --- ANIMATION ---
    let angle = 0;
    const radius = 420; // Far out, deep water
    const speed = 0.001; // Slow cruise

    const update = () => {
        angle += speed;

        // Move Formation Center
        const cx = Math.cos(angle) * radius;
        const cz = Math.sin(angle) * radius;
        const depth = -2.8; // Submerged but visible through water

        root.position.set(cx, depth, cz);

        // Face Direction
        const nextX = Math.cos(angle + 0.01) * radius;
        const nextZ = Math.sin(angle + 0.01) * radius;
        root.lookAt(new BABYLON.Vector3(nextX, depth, nextZ));
        
        // Fix Orientation (Model is X+, LookAt uses Z+)
        // We need to rotate -90 deg (PI/2) on Y axis to align X-front to Z-target
        root.rotation.y -= Math.PI / 2;

        // Spin Props
        subs.forEach(s => {
            s.prop.rotation.x += 0.3; // Prop is rotated Z, so local spin is Y? 
            // Cylinder height is Y axis. We rotated Z 90. So new axis is X (World).
            // Actually simpler: rotate on local axis. 
            s.prop.addRotation(0, 0.3, 0); 
        });
    };

    return { update };
};
