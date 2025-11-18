
declare const BABYLON: any;

export const createGround = (scene: any, materials: any, islandRadius: number) => {
    
    // --- MATERIALS ---
    
    // 1. Procedural Realistic Grass
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    
    // Generate Dynamic Texture for Grass
    const texSize = 512;
    const grassTex = new BABYLON.DynamicTexture("grassGen", texSize, scene, false);
    const ctx = grassTex.getContext();
    
    // A. Fill Base (Light Green)
    ctx.fillStyle = "#7ec850"; 
    ctx.fillRect(0, 0, texSize, texSize);
    
    // B. Generate Noise & Patches
    const imgData = ctx.getImageData(0, 0, texSize, texSize);
    const data = imgData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const idx = i / 4;
        const x = idx % texSize;
        const y = Math.floor(idx / texSize);
        
        // Simulating low-frequency noise (Patches) using sine interference
        const scale = 0.015;
        const patchNoise = Math.sin(x * scale) + Math.sin(y * scale * 1.2) + Math.sin((x+y) * scale * 0.3);
        
        // High-frequency grain (Grass blades)
        const grain = (Math.random() - 0.5) * 15;
        
        // Base Color (Light Green)
        let r = 126, g = 200, b = 80; 
        
        if (patchNoise > 1.0) {
            // Sunlit / Fresh Grass Patch (Lighter)
            r = 140; g = 210; b = 100; 
        } else if (patchNoise < -1.0) {
            // Dry / Dirt Patch (Slightly darker/yellowish)
            r = 110; g = 180; b = 70; 
        } else if (Math.random() > 0.98) {
            // Occasional Wildflower/Weed speckle
            r = 200; g = 220; b = 150;
        }
        
        // Apply Grain
        data[i] = Math.min(255, Math.max(0, r + grain));
        data[i+1] = Math.min(255, Math.max(0, g + grain));
        data[i+2] = Math.min(255, Math.max(0, b + grain));
        data[i+3] = 255;
    }
    
    ctx.putImageData(imgData, 0, 0);
    grassTex.update();
    
    groundMat.diffuseTexture = grassTex;
    groundMat.diffuseTexture.uScale = 6; // Tile for detail
    groundMat.diffuseTexture.vScale = 6;
    groundMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05); // Low shine for matte grass

    // 2. Realistic Sand
    const sandMat = new BABYLON.StandardMaterial("sandMat", scene);
    sandMat.diffuseColor = new BABYLON.Color3(0.88, 0.82, 0.70); // Natural Beige
    sandMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Low shine

    // 3. Wood (Boardwalk)
    const woodMat = new BABYLON.StandardMaterial("woodMat", scene);
    woodMat.diffuseColor = new BABYLON.Color3(0.55, 0.4, 0.3);
    woodMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    // 4. Helipad Material (Procedural)
    const heliMat = new BABYLON.StandardMaterial("heliMat", scene);
    const heliTex = new BABYLON.DynamicTexture("heliTex", {width: 512, height: 512}, scene, false);
    const ctxH = heliTex.getContext();
    
    // Asphalt base
    ctxH.fillStyle = "#262626";
    ctxH.fillRect(0, 0, 512, 512);
    
    // Concrete Ring
    ctxH.strokeStyle = "#fbbf24"; // Amber
    ctxH.lineWidth = 20;
    ctxH.beginPath();
    ctxH.arc(256, 256, 200, 0, Math.PI * 2);
    ctxH.stroke();
    
    // White 'H'
    ctxH.fillStyle = "#e5e5e5";
    ctxH.font = "bold 250px Arial";
    ctxH.textAlign = "center";
    ctxH.textBaseline = "middle";
    ctxH.fillText("H", 256, 256);
    
    heliTex.update();
    heliMat.diffuseTexture = heliTex;
    heliMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    // --- GEOMETRY ---

    // A. City Base (The Green Land)
    const cityFloor = BABYLON.MeshBuilder.CreateDisc("cityBase", {
        radius: islandRadius,
        tessellation: 128
    }, scene);
    cityFloor.rotation.x = Math.PI / 2;
    cityFloor.position.y = 0;
    cityFloor.material = groundMat;
    cityFloor.receiveShadows = true;

    // B. Beach Ring (Smooth Torus)
    const beachThickness = 35;
    const beach = BABYLON.MeshBuilder.CreateTorus("beach", {
        diameter: (islandRadius * 2) + beachThickness - 8, 
        thickness: beachThickness,
        tessellation: 128
    }, scene);
    
    // Flatten vertically for slope
    beach.scaling.y = 0.12; 
    beach.position.y = -1.2; 
    beach.material = sandMat;
    beach.receiveShadows = true;

    // C. Boardwalk (Separator)
    const boardwalk = BABYLON.MeshBuilder.CreateTorus("boardwalk", {
        diameter: islandRadius * 2,
        thickness: 1.5,
        tessellation: 128
    }, scene);
    boardwalk.scaling.y = 0.5;
    boardwalk.position.y = 0.1; 
    boardwalk.material = woodMat;
    boardwalk.receiveShadows = true;

    // D. Downtown Zone Radius (Logic only)
    const cityFloorRadius = 45; 
    // Note: Actual asphalt mesh removed to prevent Z-fighting with roads.ts Plaza.

    // E. Helipad (Main)
    const heliPos = new BABYLON.Vector3(90, 0.15, 90); 
    const helipad = BABYLON.MeshBuilder.CreateCylinder("helipad", {
        diameter: 18,
        height: 0.2
    }, scene);
    helipad.position = heliPos;
    helipad.material = heliMat;
    helipad.receiveShadows = true;
    
    const heliRim = BABYLON.MeshBuilder.CreateTorus("heliRim", {
        diameter: 18.5,
        thickness: 1,
        tessellation: 32
    }, scene);
    heliRim.scaling.y = 0.2;
    heliRim.position = heliPos;
    heliRim.material = materials.concreteMat;

    // F. SATELLITE ISLAND (For Hospital)
    const satRadius = 40;
    const satPos = new BABYLON.Vector3(250, 0, 0);
    
    const satLand = BABYLON.MeshBuilder.CreateDisc("satLand", { radius: satRadius, tessellation: 64 }, scene);
    satLand.rotation.x = Math.PI/2;
    satLand.position = satPos;
    satLand.material = groundMat;
    satLand.receiveShadows = true;

    const satBeach = BABYLON.MeshBuilder.CreateTorus("satBeach", { diameter: (satRadius * 2) + 20, thickness: 20, tessellation: 64 }, scene);
    satBeach.scaling.y = 0.12;
    satBeach.position = satPos.clone();
    satBeach.position.y = -1.2;
    satBeach.material = sandMat;

    return { cityFloor, cityFloorRadius, hospitalPos: satPos };
};
