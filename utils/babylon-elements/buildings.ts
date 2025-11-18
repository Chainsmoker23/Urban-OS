
import { ROAD_ZONES } from './roads';
import { createModernVilla, createClassicHouse, createEstate, createHospital, createHousingMaterials } from './housing';

declare const BABYLON: any;

/**
 * GENERATE HIGH-FIDELITY PROCEDURAL MATERIALS
 */
const createProceduralMaterial = (scene: any, name: string, type: 'glass' | 'concrete' | 'brick' | 'stone' | 'dark_metal' | 'mossy_concrete' | 'stucco' | 'art_deco') => {
    const width = 512;
    const height = 512;
    
    const texDiffuse = new BABYLON.DynamicTexture(name + "_diff", { width, height }, scene, false);
    const ctxD = texDiffuse.getContext();
    
    const texEmissive = new BABYLON.DynamicTexture(name + "_emit", { width, height }, scene, false);
    const ctxE = texEmissive.getContext();

    // --- 1. BASE COLORS (UPDATED: LIGHT GRAY PALETTE) ---
    if (type === 'glass') {
        // MIRRORS: VIBRANT BLUE GRADIENT (For the 3 Blue Buildings)
        const grd = ctxD.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, "#60a5fa"); // Blue 400
        grd.addColorStop(0.5, "#3b82f6"); // Blue 500
        grd.addColorStop(1, "#1e3a8a"); // Blue 900
        ctxD.fillStyle = grd;
        ctxE.fillStyle = "#000000"; 
    } else if (type === 'stone') {
        ctxD.fillStyle = "#e5e7eb"; // Gray 200 (Light Stone)
        ctxE.fillStyle = "#000000";
    } else if (type === 'art_deco') {
        ctxD.fillStyle = "#f3f4f6"; // Gray 100 (White/Gray)
        ctxE.fillStyle = "#000000";
    } else if (type === 'dark_metal') {
        ctxD.fillStyle = "#9ca3af"; // Gray 400 (Medium Gray, was dark)
        ctxE.fillStyle = "#000000";
    } else if (type === 'mossy_concrete') {
        ctxD.fillStyle = "#d1d5db"; // Gray 300 (Light Concrete)
        ctxE.fillStyle = "#000000";
    } else if (type === 'brick') {
         ctxD.fillStyle = "#d4d4d8"; // Gray 300 (Gray Brick)
         ctxE.fillStyle = "#000000";
    } else {
        // Standard Concrete
        ctxD.fillStyle = "#e5e5e5"; // Gray 200
        ctxE.fillStyle = "#000000";
    }
    
    ctxD.fillRect(0, 0, width, height);
    ctxE.fillRect(0, 0, width, height);

    // --- 2. NOISE & TEXTURE GRAIN ---
    if (type !== 'glass') {
        const imgData = ctxD.getImageData(0,0, width, height);
        const data = imgData.data;
        for(let i=0; i<data.length; i+=4) {
            const noise = (Math.random() - 0.5) * 10; // Reduced noise for cleaner look
            data[i] = Math.min(255, Math.max(0, data[i] + noise));
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
        }
        ctxD.putImageData(imgData, 0, 0);

        // WEATHERING (Subtle)
        ctxD.globalCompositeOperation = 'multiply';
        const grad = ctxD.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.8, "#eeeeee");
        grad.addColorStop(1, "#bbbbbb"); 
        ctxD.fillStyle = grad;
        ctxD.fillRect(0,0,width,height);
        
        // Reset
        ctxD.globalCompositeOperation = 'source-over';
    }

    // --- 3. MOSS (Brutalist/Concrete) ---
    if (type === 'mossy_concrete') {
        // Lighter moss for gray aesthetic
        for(let i=0; i<15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = 20 + Math.random() * 60;
            const grad = ctxD.createRadialGradient(x,y,0, x,y,r);
            grad.addColorStop(0, "rgba(150, 160, 150, 0.4)"); // Gray-Green
            grad.addColorStop(1, "rgba(150, 160, 150, 0)");
            ctxD.fillStyle = grad;
            ctxD.beginPath(); ctxD.arc(x,y,r,0,Math.PI*2); ctxD.fill();
        }
    }

    // --- 4. PANELING / BRICK LINES ---
    ctxD.globalAlpha = 0.2; // Fainter lines
    ctxD.strokeStyle = "#555555";
    if (type === 'brick') {
        ctxD.lineWidth = 1;
        const bh = 16, bw = 32;
        for(let y=0; y<height; y+=bh) {
            ctxD.beginPath(); ctxD.moveTo(0,y); ctxD.lineTo(width,y); ctxD.stroke();
            const off = (y/bh)%2===0 ? 0 : bw/2;
            for(let x=off; x<width; x+=bw) {
                ctxD.beginPath(); ctxD.moveTo(x,y); ctxD.lineTo(x,y+bh); ctxD.stroke();
            }
        }
    } else if (type !== 'glass' && type !== 'stucco') {
        ctxD.lineWidth = 2;
        const pSize = 64;
        for(let y=0; y<height; y+=pSize) {
             ctxD.beginPath(); ctxD.moveTo(0,y); ctxD.lineTo(width,y); ctxD.stroke();
        }
        if (type === 'dark_metal' || type === 'concrete') {
             for(let x=0; x<width; x+=pSize) {
                 ctxD.beginPath(); ctxD.moveTo(x,0); ctxD.lineTo(x,height); ctxD.stroke();
             }
        }
    }
    ctxD.globalAlpha = 1.0;

    // --- 5. WINDOWS (BLUE REFLECTION) ---
    let rows = 10, cols = 5, gap = 8;
    if (type === 'art_deco') { rows = 8; cols = 4; gap = 12; } 
    if (type === 'dark_metal') { rows = 15; cols = 6; gap = 5; } 
    
    const w = width / cols;
    const h = height / rows;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (type === 'mossy_concrete' && Math.random() > 0.4) continue; 
            if (type === 'brick' && Math.random() > 0.8) continue;

            let wx = c * w + gap/2;
            let wy = r * h + gap/2;
            let ww = w - gap;
            let wh = h - gap;

            if (type === 'art_deco') {
                 ww = w * 0.4;
                 wx = c * w + (w - ww)/2;
                 wh = h + 2; 
                 wy = r * h - 1;
            }

            // WINDOW COLOR: VIBRANT BLUE
            ctxD.fillStyle = "#1e40af"; // Blue 800
            ctxD.fillRect(wx, wy, ww, wh);

            // Emissive (Lights On)
            const litChance = (type === 'dark_metal') ? 0.2 : 0.4;
            if (Math.random() < litChance) {
                let lightCol = "#fef3c7"; // Warm
                if (type === 'glass') lightCol = "#bae6fd"; // Sky Blue Light
                
                ctxE.fillStyle = lightCol;
                ctxE.fillRect(wx, wy, ww, wh);
            }
        }
    }

    texDiffuse.update();
    texEmissive.update();

    const mat = new BABYLON.StandardMaterial(name + "_mat", scene);
    mat.diffuseTexture = texDiffuse;
    mat.emissiveTexture = texEmissive;
    mat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    
    if (type === 'glass') {
        // FIX: OPAQUE GLASS, BLUE TINT
        mat.alpha = 1.0; 
        mat.diffuseColor = new BABYLON.Color3(0.4, 0.7, 1.0); // Bright Blue
        mat.emissiveColor = new BABYLON.Color3(0.2, 0.4, 0.8); // Glow Blue
    }

    return mat;
};

export const createBuildings = (scene: any, shadowGenerator: any, materials: any, islandRadius: number) => {
    const cityRoot = new BABYLON.TransformNode("cityRoot", scene);

    // --- MATERIALS ---
    const matGlass = createProceduralMaterial(scene, "glass", 'glass');
    const matConcrete = createProceduralMaterial(scene, "conc", 'concrete');
    const matBrutalist = createProceduralMaterial(scene, "brut", 'mossy_concrete');
    const matArtDeco = createProceduralMaterial(scene, "deco", 'art_deco');
    const matGothic = createProceduralMaterial(scene, "gothic", 'dark_metal');
    const matBrick = createProceduralMaterial(scene, "brick", 'brick');
    const matStone = createProceduralMaterial(scene, "stone", 'stone');

    const matGold = new BABYLON.PBRMaterial("gold", scene);
    matGold.albedoColor = new BABYLON.Color3(1.0, 0.8, 0.3);
    matGold.metallic = 1.0;
    matGold.roughness = 0.25;

    const matRoof = new BABYLON.StandardMaterial("roof", scene);
    matRoof.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.55); // Light Gray Roof

    // HOUSING
    const housingMats = createHousingMaterials(scene);

    // --- HELPER: Box Segment ---
    const createSegment = (w: number, h: number, d: number, x: number, y: number, z: number, mat: any, rotY: number = 0) => {
        const box = BABYLON.MeshBuilder.CreateBox("seg", { width: w, height: h, depth: d }, scene);
        box.position.set(x, y + h/2, z);
        box.rotation.y = rotY;
        box.material = mat;
        box.parent = cityRoot;
        shadowGenerator.addShadowCaster(box);

        // Roof
        const roof = BABYLON.MeshBuilder.CreateBox("roof", { width: w-0.2, height: 0.1, depth: d-0.2 }, scene);
        roof.position.set(x, y+h, z);
        roof.rotation.y = rotY;
        roof.material = matRoof;
        roof.parent = cityRoot;

        return box;
    };

    // --- ARCHETYPES ---
    const createBrutalistTower = (x: number, z: number, h: number) => {
        const segH = h / 5;
        let currentY = 0;
        let w = 5;
        createSegment(w, segH, w, x, currentY, z, matBrutalist);
        currentY += segH;
        createSegment(w+2, segH*2, w+2, x, currentY, z, matBrutalist);
        currentY += segH*2;
        createSegment(w+4, segH*1.5, w+4, x, currentY, z, matBrutalist);
        currentY += segH*1.5;
        createSegment(w, segH*0.5, w, x, currentY, z, matConcrete);
    };

    const createArtDecoTower = (x: number, z: number, h: number) => {
        const tiers = 4;
        const tierH = h / tiers;
        let w = 8;
        let currentY = 0;
        for(let i=0; i<tiers; i++) {
            createSegment(w, tierH, w, x, currentY, z, matArtDeco);
            const cw = 0.5;
            const ch = tierH;
            const offset = w/2;
            const corners = [ {ox: offset, oz: offset}, {ox: -offset, oz: offset}, {ox: offset, oz: -offset}, {ox: -offset, oz: -offset} ];
            corners.forEach(c => {
                const gold = BABYLON.MeshBuilder.CreateBox("gold", { width: cw, height: ch, depth: cw }, scene);
                gold.position.set(x + c.ox, currentY + ch/2, z + c.oz);
                gold.material = matGold;
                gold.parent = cityRoot;
            });
            currentY += tierH;
            w *= 0.7;
        }
        const spire = BABYLON.MeshBuilder.CreateCylinder("spire", { height: 8, diameterBottom: 0.5, diameterTop: 0 }, scene);
        spire.position.set(x, currentY + 4, z);
        spire.material = matGold;
        spire.parent = cityRoot;
    };

    const createGothicTower = (x: number, z: number, h: number) => {
        const w = 6;
        createSegment(w, h, w, x, 0, z, matGothic);
        const buttressH = h * 0.4;
        const offset = w/2 + 1.5;
        const supports = [ {ox: offset, oz: 0, rot: 0}, {ox: -offset, oz: 0, rot: 0}, {ox: 0, oz: offset, rot: Math.PI/2}, {ox: 0, oz: -offset, rot: Math.PI/2} ];
        supports.forEach(s => {
            const b = BABYLON.MeshBuilder.CreateBox("buttress", { width: 1, height: buttressH, depth: 3 }, scene);
            b.position.set(x + s.ox, buttressH/2, z + s.oz);
            b.rotation.y = s.rot;
            b.material = matGothic;
            b.parent = cityRoot;
        });
        const roofY = h;
        const cOff = w/2 - 0.5;
        const corners = [ {x:cOff, z:cOff}, {x:-cOff, z:cOff}, {x:cOff, z:-cOff}, {x:-cOff, z:-cOff} ];
        corners.forEach(c => {
            const spike = BABYLON.MeshBuilder.CreateCylinder("spike", { height: 5, diameterBottom: 1, diameterTop: 0 }, scene);
            spike.position.set(x + c.x, roofY + 2.5, z + c.z);
            spike.material = matGothic;
            spike.parent = cityRoot;
        });
    };

    const createHelix = (x: number, z: number, h: number) => {
        const segs = 8;
        const segH = h / segs;
        let w = 6;
        for(let i=0; i<segs; i++) {
            createSegment(w, segH, w, x, i*segH, z, matGlass, i * 0.3);
            w *= 0.9;
        }
    };

    // --- PLACEMENT LOGIC ---
    
    // 1. Landmarks (EXACTLY 3 BLUE BUILDINGS - Helix)
    const LANDMARKS = [
        { x: 0, z: 0, type: 'helix', h: 140 },     // BLUE 1
        { x: 35, z: 35, type: 'helix', h: 110 },   // BLUE 2
        { x: -35, z: 20, type: 'helix', h: 100 },  // BLUE 3
        
        // THE REST ARE GRAY
        { x: 20, z: -35, type: 'brut', h: 90 },
        { x: -25, z: -25, type: 'deco', h: 85 },
        { x: 0, z: 45, type: 'gothic', h: 80 },
        { x: 45, z: 0, type: 'deco', h: 75 },
        { x: -15, z: 50, type: 'brut', h: 70 }
    ];

    LANDMARKS.forEach(l => {
        if (l.type === 'deco') createArtDecoTower(l.x, l.z, l.h);
        if (l.type === 'brut') createBrutalistTower(l.x, l.z, l.h);
        if (l.type === 'gothic') createGothicTower(l.x, l.z, l.h);
        if (l.type === 'helix') createHelix(l.x, l.z, l.h);
    });

    // 2. Procedural Fill (ALL GRAY)
    const step = 14;
    const maxR = islandRadius - 15;

    for(let x = -maxR; x <= maxR; x += step) {
        for(let z = -maxR; z <= maxR; z += step) {
            const jx = x + (Math.random()-0.5)*6;
            const jz = z + (Math.random()-0.5)*6;
            const dist = Math.sqrt(jx*jx + jz*jz);

            if (dist > maxR) continue;
            
            // Avoid Landmarks
            let clash = false;
            for(const l of LANDMARKS) {
                if (Math.sqrt((jx-l.x)**2 + (jz-l.z)**2) < 12) clash = true;
            }
            if (clash) continue;

            // Avoid Roads
            let onRoad = false;
            for(const r of ROAD_ZONES) {
                if (Math.abs(dist - r.radius) < (r.width/2 + 4)) onRoad = true;
            }
            if (onRoad) continue;

            // Zoning
            const density = (1 - dist/maxR) + (Math.sin(jx*0.05)*Math.cos(jz*0.05)*0.3);

            if (density > 0.5 && dist < 60) {
                // INNER CITY (Mid-Rise)
                const h = 20 + Math.random()*20;
                const typeRand = Math.random();
                // ONLY GRAY MATERIALS
                if (typeRand < 0.3) createSegment(6, h, 6, jx, 0, jz, matStone); 
                else if (typeRand < 0.6) createSegment(5, h, 5, jx, 0, jz, matConcrete); 
                else createSegment(5, h, 5, jx, 0, jz, matBrick); 
            } else if (density > 0.25 && dist < 120) {
                // MID TOWN
                const h = 10 + Math.random()*15;
                createSegment(5, h, 5, jx, 0, jz, matConcrete);
            } else {
                // SUBURBS (Houses)
                if (Math.random() > 0.3) {
                    const r = Math.random();
                    if (r < 0.33) createClassicHouse(scene, cityRoot, jx, jz, housingMats);
                    else if (r < 0.66) createModernVilla(scene, cityRoot, jx, jz, housingMats);
                    else createEstate(scene, cityRoot, jx, jz, housingMats);
                }
            }
        }
    }

    // Hospital
    createHospital(scene, cityRoot, 250, 0);
};
