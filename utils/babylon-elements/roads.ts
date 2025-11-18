
declare const BABYLON: any;

export const ROAD_ZONES = [
    { radius: 70, width: 22 },  // Inner City Loop
    { radius: 130, width: 22 }, // Mid-Town Ring
    { radius: 175, width: 18 }  // Coastal Highway
];

export const createRoads = (scene: any) => {
    // 1. Material: StandardMaterial
    const asphaltMat = new BABYLON.StandardMaterial("asphaltMat", scene);
    asphaltMat.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0); // Pure white so texture color controls appearance
    asphaltMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Low shine
    asphaltMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Prevent black shadows

    // 2. Lane Markings Texture (Procedural)
    const textureSize = 1024;
    const roadTex = new BABYLON.DynamicTexture("roadTex", {width: textureSize, height: textureSize}, scene, false);
    const ctx = roadTex.getContext();
    
    // Base Asphalt - LIGHT GRAY
    ctx.fillStyle = "#888888"; 
    ctx.fillRect(0, 0, textureSize, textureSize);
    
    // Noise / Gravel Texture
    for(let i=0; i<20000; i++) {
        const x = Math.random() * textureSize;
        const y = Math.random() * textureSize;
        // Subtle variation
        ctx.fillStyle = Math.random() > 0.5 ? "#777777" : "#999999";
        ctx.fillRect(x, y, 2, 2);
    }

    // Markings
    ctx.lineWidth = 18; // Slightly thicker for visibility
    
    // Dashed White Center Lines
    ctx.strokeStyle = "#ffffff";
    ctx.setLineDash([60, 60]); 
    
    // Lane Dividers (3 Lanes)
    const lane1 = textureSize * 0.33;
    const lane2 = textureSize * 0.66;
    
    ctx.beginPath(); ctx.moveTo(lane1, 0); ctx.lineTo(lane1, textureSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lane2, 0); ctx.lineTo(lane2, textureSize); ctx.stroke();

    // Solid Edge Lines (White or slightly off-white)
    ctx.strokeStyle = "#eeeeee"; 
    ctx.setLineDash([]); 
    ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(15, textureSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(textureSize-15, 0); ctx.lineTo(textureSize-15, textureSize); ctx.stroke();

    roadTex.update();
    
    asphaltMat.diffuseTexture = roadTex;
    asphaltMat.diffuseTexture.uScale = 1;
    asphaltMat.diffuseTexture.vScale = 20;

    // 3. RING ROADS
    ROAD_ZONES.forEach((zone, i) => {
        const rMin = zone.radius - (zone.width/2);
        const rMax = zone.radius + (zone.width/2);
        
        const pathArray = [];
        const pathArray2 = [];
        const segs = 128;
        
        for(let s=0; s<=segs; s++) {
            const theta = (s/segs) * Math.PI * 2;
            const x1 = Math.cos(theta) * rMin;
            const z1 = Math.sin(theta) * rMin;
            const x2 = Math.cos(theta) * rMax;
            const z2 = Math.sin(theta) * rMax;
            
            pathArray.push(new BABYLON.Vector3(x1, 0.06, z1)); 
            pathArray2.push(new BABYLON.Vector3(x2, 0.06, z2));
        }

        const road = BABYLON.MeshBuilder.CreateRibbon("roadRing_" + i, {
            pathArray: [pathArray, pathArray2],
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        road.material = asphaltMat;
        road.receiveShadows = true;
    });

    // 4. RADIAL AVENUES (North, South, East, West)
    const createRadial = (angle: number) => {
        const width = 20;
        const startR = 20; // Center plaza
        const endR = 190; // Edge of island

        // Calculate corners
        const dx = Math.cos(angle);
        const dz = Math.sin(angle);
        const px = -dz; // Perpendicular vector
        const pz = dx;

        const p1 = new BABYLON.Vector3(
            (startR * dx) + (px * width/2), 0.07, (startR * dz) + (pz * width/2)
        );
        const p2 = new BABYLON.Vector3(
            (endR * dx) + (px * width/2), 0.07, (endR * dz) + (pz * width/2)
        );
        const p3 = new BABYLON.Vector3(
            (startR * dx) - (px * width/2), 0.07, (startR * dz) - (pz * width/2)
        );
        const p4 = new BABYLON.Vector3(
            (endR * dx) - (px * width/2), 0.07, (endR * dz) - (pz * width/2)
        );

        const road = BABYLON.MeshBuilder.CreateRibbon("roadRadial", {
            pathArray: [[p1, p2], [p3, p4]],
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        road.material = asphaltMat;
        road.receiveShadows = true;
    };

    createRadial(0);          // East
    createRadial(Math.PI/2);  // North
    createRadial(Math.PI);    // West
    createRadial(Math.PI*1.5);// South

    // Center Plaza (Downtown Base)
    const plaza = BABYLON.MeshBuilder.CreateDisc("plaza", { radius: 45, tessellation: 64 }, scene);
    plaza.rotation.x = Math.PI/2;
    // Position at 0.05 to sit UNDER the roads (at 0.06/0.07) to prevent Z-Fighting
    plaza.position.y = 0.05; 
    plaza.material = asphaltMat;
    plaza.receiveShadows = true;

    return { asphaltMat };
};
