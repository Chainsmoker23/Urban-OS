
declare const BABYLON: any;
declare const earcut: any;

export const createRealCargoShip = (scene: any) => {
    const root = new BABYLON.TransformNode("cargoShipRoot", scene);

    // --- MATERIALS ---
    const matHullRed = new BABYLON.PBRMaterial("hullRed", scene);
    matHullRed.albedoColor = new BABYLON.Color3(0.3, 0.05, 0.05); // Dark Anti-fouling
    matHullRed.metallic = 0.1;
    matHullRed.roughness = 0.7;

    const matHullBlack = new BABYLON.PBRMaterial("hullBlack", scene);
    matHullBlack.albedoColor = new BABYLON.Color3(0.1, 0.12, 0.15); // Topside
    matHullBlack.metallic = 0.1;
    matHullBlack.roughness = 0.6;

    const matDeck = new BABYLON.StandardMaterial("deckGreen", scene);
    matDeck.diffuseColor = new BABYLON.Color3(0.15, 0.25, 0.2); // Industrial Green

    const matWhite = new BABYLON.PBRMaterial("bridgeWhite", scene);
    matWhite.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.88);
    matWhite.metallic = 0.1;
    matWhite.roughness = 0.3;

    const matGlass = new BABYLON.PBRMaterial("shipGlass", scene);
    matGlass.albedoColor = new BABYLON.Color3(0.02, 0.05, 0.1);
    matGlass.metallic = 0.9;
    matGlass.roughness = 0.05;

    // Container Colors
    const containerColors = [
        new BABYLON.Color3(0.4, 0.1, 0.1), // Rusty Red
        new BABYLON.Color3(0.05, 0.15, 0.35), // Maersk Blue
        new BABYLON.Color3(0.1, 0.3, 0.15), // Evergreen
        new BABYLON.Color3(0.7, 0.35, 0.05), // Hapag Orange
        new BABYLON.Color3(0.5, 0.5, 0.55)  // Grey
    ];
    const containerMats = containerColors.map((c, i) => {
        const m = new BABYLON.StandardMaterial(`contMat_${i}`, scene);
        m.diffuseColor = c;
        m.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        return m;
    });

    // --- 1. HULL GENERATION ---
    const length = 70;
    const width = 12;
    const depth = 6;

    // Profile
    const shape = [];
    // Bow (Long smooth taper)
    for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const x = (length/2) - (t * 14); 
        const z = (width/2) * (1 - Math.pow(t, 2.5)); 
        shape.push(new BABYLON.Vector3(x, 0, z));
    }
    // Midship
    shape.push(new BABYLON.Vector3(-length/2 + 6, 0, width/2));
    
    // Stern (Square with rounded corners)
    shape.push(new BABYLON.Vector3(-length/2, 0, width/2 * 0.9));
    shape.push(new BABYLON.Vector3(-length/2 - 1, 0, width/2 * 0.5)); // Transom
    shape.push(new BABYLON.Vector3(-length/2 - 1, 0, -width/2 * 0.5));
    shape.push(new BABYLON.Vector3(-length/2, 0, -width/2 * 0.9));

    // Midship other side
    shape.push(new BABYLON.Vector3(-length/2 + 6, 0, -width/2));

    // Bow other side
    for (let i = 12; i >= 0; i--) {
        const t = i / 12;
        const x = (length/2) - (t * 14); 
        const z = -(width/2) * (1 - Math.pow(t, 2.5));
        shape.push(new BABYLON.Vector3(x, 0, z));
    }

    // Lower Hull (Red)
    const hullLow = BABYLON.MeshBuilder.ExtrudePolygon("hullLow", {
        shape: shape,
        depth: depth * 0.6,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    hullLow.position.y = 0.5;
    hullLow.material = matHullRed;
    hullLow.parent = root;

    // Upper Hull (Black)
    const hullHigh = BABYLON.MeshBuilder.ExtrudePolygon("hullHigh", {
        shape: shape,
        depth: depth * 0.4,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    hullHigh.position.y = (depth * 0.6) + 0.5;
    hullHigh.material = matHullBlack;
    hullHigh.parent = root;

    // Deck (Lid)
    const deckMesh = BABYLON.MeshBuilder.ExtrudePolygon("deck", {
        shape: shape,
        depth: 0.2,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene, earcut);
    deckMesh.position.y = depth + 0.5;
    deckMesh.material = matDeck;
    deckMesh.parent = root;

    // --- 2. SUPERSTRUCTURE (Rear) ---
    const bridgeGroup = new BABYLON.TransformNode("bridge", scene);
    bridgeGroup.parent = root;
    bridgeGroup.position.set(-length * 0.38, depth + 0.6, 0);

    const towerW = 10;
    const towerL = 7;
    const towerH = 7;

    // Main Block
    const tower = BABYLON.MeshBuilder.CreateBox("tower", { width: towerL, height: towerH, depth: towerW }, scene);
    tower.position.y = towerH / 2;
    tower.material = matWhite;
    tower.parent = bridgeGroup;

    // Wings
    const wings = BABYLON.MeshBuilder.CreateBox("wings", { width: 2.5, height: 1.2, depth: width + 4 }, scene);
    wings.position.y = towerH - 1;
    wings.position.x = 1;
    wings.material = matWhite;
    wings.parent = bridgeGroup;

    // Bridge Windows
    const wind = BABYLON.MeshBuilder.CreateBox("wind", { width: 2.6, height: 0.8, depth: width + 3.8 }, scene);
    wind.position.y = towerH - 1;
    wind.position.x = 1;
    wind.material = matGlass;
    wind.parent = bridgeGroup;

    // Funnel
    const funnel = BABYLON.MeshBuilder.CreateCylinder("funnel", { height: 4, diameter: 2.2, tessellation: 24 }, scene);
    funnel.position.set(-3, towerH + 2, 0);
    funnel.material = matWhite;
    funnel.parent = bridgeGroup;

    // Radar Mast
    const mast = BABYLON.MeshBuilder.CreateCylinder("mast", { height: 6, diameter: 0.3 }, scene);
    mast.position.set(1, towerH + 3, 0);
    mast.material = matHullBlack;
    mast.parent = bridgeGroup;


    // --- 3. CARGO BAYS ---
    // Hatch Covers (Raised platforms to sit containers on)
    const hatchL = 14; // 40ft equiv gap
    const hatchW = 10;
    const startX = -length * 0.15;
    const endX = length * 0.4;

    // Container Dimensions (TEU)
    const cLen = 2.4; 
    const cWid = 1.2;
    const cHgt = 1.2;
    const gap = 0.1;

    for (let x = startX; x < endX; x += cLen + gap) {
        for (let z = -width/2 + 1.5; z < width/2 - 1.5; z += cWid + gap) {
            
            // Random Stack Height
            const stack = Math.floor(Math.random() * 5) + 1; 
            
            for(let h=0; h<stack; h++) {
                const c = BABYLON.MeshBuilder.CreateBox("c", { width: cLen, height: cHgt, depth: cWid }, scene);
                c.position.set(x, depth + 0.6 + (cHgt/2) + (h * cHgt), z);
                c.material = containerMats[Math.floor(Math.random() * containerMats.length)];
                c.parent = root;

                // Detail: Ribs on container
                // Optimization: Only do this for top containers or high LOD? 
                // Keeping it simple for performance, rely on color variety.
            }
        }
    }
    
    // Deck Crane
    const craneBase = BABYLON.MeshBuilder.CreateCylinder("craneBase", { height: 8, diameter: 0.8 }, scene);
    craneBase.position.set(0, depth + 4, 0);
    craneBase.material = matHullRed;
    craneBase.parent = root;
    
    const craneArm = BABYLON.MeshBuilder.CreateBox("craneArm", { width: 12, height: 0.5, depth: 0.5 }, scene);
    craneArm.position.set(0, depth + 7.5, 0);
    craneArm.rotation.y = 0.5;
    craneArm.material = matHullRed;
    craneArm.parent = root;

    return root;
};
