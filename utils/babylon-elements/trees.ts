
declare const BABYLON: any;

export const createTrees = (scene: any, shadowGenerator: any, islandRadius: number, innerExclusionRadius: number) => {
    // Define Tree Material
    const leafMat = new BABYLON.StandardMaterial("leafMat", scene);
    leafMat.diffuseColor = new BABYLON.Color3(0.18, 0.55, 0.25); // Vibrant Green
    leafMat.specularColor = new BABYLON.Color3(0, 0, 0); // Matte
    
    const trunkMat = new BABYLON.StandardMaterial("trunkMat", scene);
    trunkMat.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.2); // Wood
    trunkMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    // Create One Master Tree Mesh
    // Trunk
    const trunk = BABYLON.MeshBuilder.CreateCylinder("trunkMaster", { height: 2, diameter: 0.6 }, scene);
    trunk.material = trunkMat;
    trunk.position.y = 1; 

    // Foliage (2 cones for realistic look)
    const leavesBottom = BABYLON.MeshBuilder.CreateCylinder("leavesBot", { height: 2.5, diameterTop: 1.5, diameterBottom: 3.5 }, scene);
    leavesBottom.material = leafMat;
    leavesBottom.position.y = 2.5;

    const leavesTop = BABYLON.MeshBuilder.CreateCylinder("leavesTop", { height: 2.5, diameterTop: 0, diameterBottom: 2.5 }, scene);
    leavesTop.material = leafMat;
    leavesTop.position.y = 4;

    const treeMaster = BABYLON.Mesh.MergeMeshes([trunk, leavesBottom, leavesTop], true, true, undefined, false, true);
    treeMaster.scaling.setAll(0.8);
    treeMaster.isVisible = false; // Hide master

    // Scatter Trees
    // We place them in the "Suburbs" area: between innerExclusionRadius (downtown) and islandRadius (sea)
    const numTrees = 500;
    const parkInnerRadius = innerExclusionRadius;
    const parkOuterRadius = islandRadius - 2; 

    for (let i = 0; i < numTrees; i++) {
        const r = parkInnerRadius + Math.random() * (parkOuterRadius - parkInnerRadius);
        const theta = Math.random() * 2 * Math.PI;
        
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);

        const instance = treeMaster.createInstance("tree_" + i);
        instance.position.set(x, 0, z);
        
        // Random Scale
        const scale = 0.5 + Math.random() * 0.5;
        instance.scaling.setAll(scale);

        // Random Rotation
        instance.rotation.y = Math.random() * Math.PI * 2;

        shadowGenerator.addShadowCaster(instance);
    }
};

// --- NEW: MASSIVE JUNGLE TREES ---
export const createJungleTrees = (scene: any, shadowGenerator: any) => {
    const barkMat = new BABYLON.StandardMaterial("jungleBark", scene);
    barkMat.diffuseColor = new BABYLON.Color3(0.25, 0.2, 0.15); // Darker bark
    barkMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    const leafMat = new BABYLON.StandardMaterial("jungleLeaf", scene);
    leafMat.diffuseColor = new BABYLON.Color3(0.1, 0.35, 0.12); // Deep lush green
    leafMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const createBigTree = (x: number, z: number) => {
        const root = new BABYLON.TransformNode("bigTree", scene);
        root.position.set(x, 0, z);

        // 1. Massive Trunk
        const height = 18;
        const trunk = BABYLON.MeshBuilder.CreateCylinder("bigTrunk", {
            height: height,
            diameterTop: 3,
            diameterBottom: 5.5,
            tessellation: 16
        }, scene);
        trunk.position.y = height / 2;
        trunk.material = barkMat;
        trunk.parent = root;
        shadowGenerator.addShadowCaster(trunk);

        // 2. Buttress Roots (Angled supports)
        for(let i=0; i<5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const r = BABYLON.MeshBuilder.CreateTube("rootSup", {
                path: [
                    new BABYLON.Vector3(Math.cos(angle)*1.5, height/3, Math.sin(angle)*1.5),
                    new BABYLON.Vector3(Math.cos(angle)*5, -1, Math.sin(angle)*5)
                ],
                radius: 0.8,
                cap: 2
            }, scene);
            r.material = barkMat;
            r.parent = root;
        }

        // 3. Canopy (Cluster of huge spheres)
        const canopyCenterY = height;
        const blobs = [
            { ox: 0, oy: 5, oz: 0, s: 16 },   // Top
            { ox: 5, oy: 0, oz: 0, s: 12 },   // Sides
            { ox: -5, oy: 1, oz: 2, s: 13 },
            { ox: 0, oy: -1, oz: 5, s: 12 },
            { ox: 2, oy: 2, oz: -5, s: 11 },
            { ox: -3, oy: -2, oz: -3, s: 14 },
        ];

        blobs.forEach(b => {
            const leaf = BABYLON.MeshBuilder.CreateSphere("leafBlob", { diameter: b.s, segments: 8 }, scene);
            leaf.position.set(b.ox, canopyCenterY + b.oy, b.oz);
            leaf.material = leafMat;
            leaf.parent = root;
            shadowGenerator.addShadowCaster(leaf);
        });

        return root;
    };

    // Specific Locations (Parks/Corners)
    const locations = [
        { x: 110, z: 110 },
        { x: -120, z: 80 },
        { x: 50, z: -140 },
        { x: -100, z: -100 },
        { x: 150, z: -30 }
    ];

    locations.forEach(loc => createBigTree(loc.x, loc.z));
};
