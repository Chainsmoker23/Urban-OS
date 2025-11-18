
declare const BABYLON: any;

// --- MATERIALS ---
export const createHousingMaterials = (scene: any) => {
    // 1. Stucco (LIGHT GRAY VARIATIONS)
    const matStuccoWhite = new BABYLON.StandardMaterial("stuccoWhite", scene);
    matStuccoWhite.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
    
    const matStuccoBeige = new BABYLON.StandardMaterial("stuccoGray1", scene);
    matStuccoBeige.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.88); // Light cool gray

    const matStuccoBlue = new BABYLON.StandardMaterial("stuccoGray2", scene);
    matStuccoBlue.diffuseColor = new BABYLON.Color3(0.75, 0.75, 0.8); // Medium cool gray

    // 2. Brick (GRAY BRICK)
    const matBrickRed = new BABYLON.StandardMaterial("brickGray", scene);
    matBrickRed.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.65);
    
    // 3. Wood Siding (Desaturated)
    const matWood = new BABYLON.StandardMaterial("woodSiding", scene);
    matWood.diffuseColor = new BABYLON.Color3(0.5, 0.45, 0.4);

    // 4. Roofs (DARK GRAY / SLATE)
    const matRoofDark = new BABYLON.StandardMaterial("roofDark", scene);
    matRoofDark.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.25);
    
    const matRoofRed = new BABYLON.StandardMaterial("roofGray1", scene);
    matRoofRed.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
    
    const matRoofBlue = new BABYLON.StandardMaterial("roofGray2", scene);
    matRoofBlue.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.45);

    // 5. Glass (BLUE REFLECTION)
    const matGlass = new BABYLON.StandardMaterial("houseGlass", scene);
    matGlass.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.8);
    matGlass.alpha = 1.0; 

    // 6. Hospital Specific
    const matWhiteClean = new BABYLON.StandardMaterial("hospWhite", scene);
    matWhiteClean.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95);
    matWhiteClean.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const matRedSign = new BABYLON.StandardMaterial("hospRed", scene);
    matRedSign.diffuseColor = new BABYLON.Color3(0.9, 0.1, 0.1);
    matRedSign.emissiveColor = new BABYLON.Color3(0.6, 0, 0);

    return { 
        stucco: [matStuccoWhite, matStuccoBeige, matStuccoBlue],
        brick: matBrickRed,
        wood: matWood,
        roofs: [matRoofDark, matRoofRed, matRoofBlue],
        glass: matGlass,
        hospital: { white: matWhiteClean, red: matRedSign }
    };
};

// --- ARCHETYPES ---

// TYPE 1: The Modern Cube (Bauhaus style)
export const createModernVilla = (scene: any, root: any, x: number, z: number, mats: any) => {
    const grp = new BABYLON.TransformNode("modernVilla", scene);
    grp.position.set(x, 0, z);
    grp.parent = root;

    const w = 4 + Math.random();
    const d = 4 + Math.random();
    const h = 3.5;

    // Ground Floor (Wood or Dark)
    const ground = BABYLON.MeshBuilder.CreateBox("g", { width: w * 0.8, height: h*0.5, depth: d * 0.8 }, scene);
    ground.position.y = h * 0.25;
    ground.material = mats.wood;
    ground.parent = grp;

    // Second Floor (Cantilevered White Stucco)
    const top = BABYLON.MeshBuilder.CreateBox("t", { width: w, height: h*0.5, depth: d }, scene);
    top.position.y = h * 0.75;
    top.position.x = 0.5; // Shift
    top.material = mats.stucco[0]; // White
    top.parent = grp;

    // Large Window
    const win = BABYLON.MeshBuilder.CreatePlane("w", { width: w * 0.6, height: h * 0.3 }, scene);
    win.position.set(0.5, h * 0.75, -d/2 - 0.01);
    win.rotation.y = Math.PI;
    win.material = mats.glass;
    win.parent = grp;

    return grp;
};

// TYPE 2: The Suburban Classic (Pitched Roof)
export const createClassicHouse = (scene: any, root: any, x: number, z: number, mats: any) => {
    const grp = new BABYLON.TransformNode("classicHouse", scene);
    grp.position.set(x, 0, z);
    grp.parent = root;

    const w = 3.5;
    const d = 3;
    const h = 2.5;

    // Body (Random Stucco or Brick)
    const isBrick = Math.random() > 0.7;
    const bodyMat = isBrick ? mats.brick : mats.stucco[Math.floor(Math.random()*mats.stucco.length)];

    const body = BABYLON.MeshBuilder.CreateBox("b", { width: w, height: h, depth: d }, scene);
    body.position.y = h/2;
    body.material = bodyMat;
    body.parent = grp;

    // Roof
    const roofH = 1.5;
    const roof = BABYLON.MeshBuilder.CreateCylinder("r", { diameter: 1, height: w + 0.6, tessellation: 3 }, scene);
    roof.scaling.x = roofH;
    roof.scaling.z = d + 0.8;
    roof.rotation.z = Math.PI / 2;
    roof.position.y = h + (roofH/4);
    roof.material = mats.roofs[Math.floor(Math.random()*mats.roofs.length)];
    roof.parent = grp;

    // Chimney
    const chim = BABYLON.MeshBuilder.CreateBox("chim", { width: 0.6, height: 1.5, depth: 0.6 }, scene);
    chim.position.set(w/3, h + 0.5, -d/4);
    chim.material = mats.brick;
    chim.parent = grp;

    return grp;
};

// TYPE 3: The Estate (L-Shape)
export const createEstate = (scene: any, root: any, x: number, z: number, mats: any) => {
    const grp = new BABYLON.TransformNode("estate", scene);
    grp.position.set(x, 0, z);
    grp.parent = root;

    const h = 3;
    
    // Main Wing
    const w1 = 5, d1 = 3;
    const main = BABYLON.MeshBuilder.CreateBox("m", { width: w1, height: h, depth: d1 }, scene);
    main.position.y = h/2;
    main.material = mats.stucco[1]; // Beige
    main.parent = grp;

    // Side Wing
    const w2 = 2.5, d2 = 3;
    const side = BABYLON.MeshBuilder.CreateBox("s", { width: w2, height: h*0.8, depth: d2 }, scene);
    side.position.set(w1/2 + w2/2 - 0.5, h*0.4, d1/2);
    side.material = mats.stucco[1];
    side.parent = grp;

    // Roofs
    // Just simplified flat roofs for modern estate look
    const r1 = BABYLON.MeshBuilder.CreateBox("r1", { width: w1+0.4, height: 0.2, depth: d1+0.4 }, scene);
    r1.position.y = h;
    r1.material = mats.roofs[0];
    r1.parent = grp;

    const r2 = BABYLON.MeshBuilder.CreateBox("r2", { width: w2+0.4, height: 0.2, depth: d2+0.4 }, scene);
    r2.position.set(w1/2 + w2/2 - 0.5, h*0.8, d1/2);
    r2.material = mats.roofs[0];
    r2.parent = grp;

    return grp;
};

// TYPE 4: THE HOSPITAL
export const createHospital = (scene: any, root: any, x: number, z: number) => {
    const mats = createHousingMaterials(scene); // reuse
    const grp = new BABYLON.TransformNode("hospital", scene);
    grp.position.set(x, 0, z);
    grp.parent = root;

    // Base H Shape
    const w = 12;
    const d = 8;
    const h = 15;
    const wingW = 4;

    // Left Wing
    const left = BABYLON.MeshBuilder.CreateBox("left", { width: wingW, height: h, depth: d }, scene);
    left.position.set(-w/3, h/2, 0);
    left.material = mats.hospital.white;
    left.parent = grp;

    // Right Wing
    const right = BABYLON.MeshBuilder.CreateBox("right", { width: wingW, height: h, depth: d }, scene);
    right.position.set(w/3, h/2, 0);
    right.material = mats.hospital.white;
    right.parent = grp;

    // Connector
    const mid = BABYLON.MeshBuilder.CreateBox("mid", { width: w, height: h*0.6, depth: d/2 }, scene);
    mid.position.set(0, h*0.3, 0);
    mid.material = mats.hospital.white;
    mid.parent = grp;

    // Glass Sections
    const glassL = BABYLON.MeshBuilder.CreatePlane("gL", { width: wingW*0.6, height: h*0.8 }, scene);
    glassL.position.set(-w/3, h/2, -d/2 - 0.05);
    glassL.rotation.y = Math.PI;
    glassL.material = mats.glass;
    glassL.parent = grp;

    const glassR = BABYLON.MeshBuilder.CreatePlane("gR", { width: wingW*0.6, height: h*0.8 }, scene);
    glassR.position.set(w/3, h/2, -d/2 - 0.05);
    glassR.rotation.y = Math.PI;
    glassR.material = mats.glass;
    glassR.parent = grp;

    // Red Cross Sign
    const sign = BABYLON.MeshBuilder.CreatePlane("sign", { size: 3 }, scene);
    sign.position.set(0, h*0.7, -d/4 - 0.1);
    sign.rotation.y = Math.PI;
    
    // Texture for cross
    const tex = new BABYLON.DynamicTexture("cross", 128, scene, false);
    const ctx = tex.getContext();
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,128,128);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(44, 10, 40, 108); // V
    ctx.fillRect(10, 44, 108, 40); // H
    tex.update();
    
    const signMat = new BABYLON.StandardMaterial("signMat", scene);
    signMat.diffuseTexture = tex;
    signMat.emissiveColor = new BABYLON.Color3(1,1,1);
    sign.material = signMat;
    sign.parent = grp;

    // Helipad on Left Wing Roof
    const pad = BABYLON.MeshBuilder.CreateCylinder("pad", { diameter: 6, height: 0.2 }, scene);
    pad.position.set(-w/3, h + 0.1, 0);
    pad.material = mats.hospital.white; // or darker asphalt
    pad.parent = grp;
    
    const hMark = BABYLON.MeshBuilder.CreatePlane("hMark", { size: 3 }, scene);
    hMark.rotation.x = Math.PI/2;
    hMark.position.set(-w/3, h + 0.21, 0);
    
    const texH = new BABYLON.DynamicTexture("hTex", 128, scene, false);
    const ctxH = texH.getContext();
    ctxH.fillStyle = "red";
    ctxH.fillRect(0,0,128,128);
    ctxH.fillStyle = "white";
    ctxH.font = "bold 80px Arial";
    ctxH.textAlign = "center";
    ctxH.textBaseline = "middle";
    ctxH.fillText("H", 64, 64);
    texH.update();

    const hMat = new BABYLON.StandardMaterial("hMat", scene);
    hMat.diffuseTexture = texH;
    hMark.material = hMat;
    hMark.parent = grp;

    return grp;
};
