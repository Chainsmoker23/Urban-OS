
declare const BABYLON: any;

export const createSuspensionBridge = (scene: any, start: any, end: any) => {
    const bridgeRoot = new BABYLON.TransformNode("bridgeRoot", scene);

    // MATERIALS
    const matConcrete = new BABYLON.StandardMaterial("bridgeConc", scene);
    matConcrete.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    
    const matSteel = new BABYLON.PBRMaterial("bridgeSteel", scene);
    matSteel.albedoColor = new BABYLON.Color3(0.7, 0.1, 0.1); // Golden Gate Red
    matSteel.metallic = 0.6;
    matSteel.roughness = 0.4;

    const matAsphalt = new BABYLON.StandardMaterial("bridgeRoad", scene);
    matAsphalt.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.35);
    matAsphalt.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // GEOMETRY CALCS
    const length = BABYLON.Vector3.Distance(start, end);
    const center = BABYLON.Vector3.Center(start, end);
    const dir = end.subtract(start).normalize();
    
    // Rotation to align with bridge direction
    const angle = Math.atan2(dir.z, dir.x);

    // 1. BRIDGE DECK (The Road)
    const deckWidth = 16;
    const deckHeight = 2;
    
    const deck = BABYLON.MeshBuilder.CreateBox("deck", { width: length, height: deckHeight, depth: deckWidth }, scene);
    deck.position = center;
    deck.rotation.y = -angle; // Box is created along X, rotate to match
    deck.material = matAsphalt;
    deck.parent = bridgeRoot;

    // Railings
    const railL = BABYLON.MeshBuilder.CreateBox("railL", { width: length, height: 1.5, depth: 0.5 }, scene);
    railL.position = center.add(new BABYLON.Vector3(0, 1, 0)); // Initial offset relative to world
    // Correct relative position requires parenting logic or manual trig, simpler to parent to deck
    railL.parent = deck;
    railL.position.set(0, 1, deckWidth/2);
    railL.rotation.y = 0; // Local
    railL.material = matSteel;

    const railR = railL.clone("railR");
    railR.parent = deck;
    railR.position.set(0, 1, -deckWidth/2);

    // 2. TOWERS (Pylons)
    const towerH = 45;
    const towerW = 22; // Wider than deck
    
    const createTower = (pos: any) => {
        const tGroup = new BABYLON.TransformNode("tower", scene);
        tGroup.position = pos;
        tGroup.rotation.y = -angle; // Face bridge dir
        tGroup.parent = bridgeRoot;

        // Legs
        const leg1 = BABYLON.MeshBuilder.CreateBox("leg1", { width: 4, height: towerH, depth: 4 }, scene);
        leg1.position.set(0, towerH/2 - 5, deckWidth/2 + 2);
        leg1.material = matSteel;
        leg1.parent = tGroup;

        const leg2 = leg1.clone("leg2");
        leg2.position.set(0, towerH/2 - 5, -deckWidth/2 - 2);
        leg2.parent = tGroup;

        // Cross Braces
        const brace1 = BABYLON.MeshBuilder.CreateBox("brace1", { width: 3, height: 2, depth: deckWidth + 6 }, scene);
        brace1.position.set(0, towerH * 0.8, 0);
        brace1.material = matSteel;
        brace1.parent = tGroup;

        const brace2 = BABYLON.MeshBuilder.CreateBox("brace2", { width: 3, height: 2, depth: deckWidth + 6 }, scene);
        brace2.position.set(0, towerH * 0.5, 0);
        brace2.material = matSteel;
        brace2.parent = tGroup;

        // Base (Concrete Pier)
        const pier = BABYLON.MeshBuilder.CreateBox("pier", { width: 10, height: 15, depth: 30 }, scene);
        pier.position.set(0, -10, 0); // Under water/ground
        pier.material = matConcrete;
        pier.parent = tGroup;

        return { topPos: towerH - 5, group: tGroup }; // Height where cable sits
    };

    const p1Dist = length * 0.25;
    const p2Dist = length * 0.75;
    
    const pos1 = start.add(dir.scale(p1Dist));
    const pos2 = start.add(dir.scale(p2Dist));

    const t1 = createTower(pos1);
    const t2 = createTower(pos2);

    // 3. CABLES (Catenary Curve)
    
    // We need points in local bridge space (Length along X) to draw the curve easily
    // Local Coords: Start = -L/2, End = L/2. Towers at -L/4 and L/4 relative to center.
    // Actually let's just use world path.

    // Helper to draw catenary between two points with sag
    const drawCableSegment = (pA: any, pB: any, sag: number) => {
        const points = [];
        const segs = 20;
        for(let i=0; i<=segs; i++) {
            const t = i/segs;
            // Linear interp
            const p = BABYLON.Vector3.Lerp(pA, pB, t);
            // Add Sag (Parabola): 4 * sag * t * (1-t)
            // If sag is negative, it hangs down.
            p.y += 4 * sag * t * (1-t);
            points.push(p);
        }
        
        const cable = BABYLON.MeshBuilder.CreateTube("mainCable", {
            path: points,
            radius: 0.4,
            cap: 2
        }, scene);
        cable.material = matSteel;
        cable.parent = bridgeRoot;

        // Vertical Suspenders (Ropes)
        if (sag < 0) { // Only for the middle span hanging down
             for(let i=1; i<segs; i+=2) {
                 const pTop = points[i];
                 // Find point on deck below
                 const pBot = new BABYLON.Vector3(pTop.x, start.y + 1, pTop.z);
                 const rope = BABYLON.MeshBuilder.CreateTube("rope", {
                     path: [pTop, pBot],
                     radius: 0.08
                 }, scene);
                 rope.material = matConcrete; // Grey rope
                 rope.parent = bridgeRoot;
             }
        }
    };

    // Tower Tops (World Space)
    const hOffset = new BABYLON.Vector3(0, t1.topPos, 0);
    // Side 1 (Right)
    const wOffsetR = dir.cross(new BABYLON.Vector3(0,1,0)).scale(deckWidth/2 + 2);
    const wOffsetL = dir.cross(new BABYLON.Vector3(0,1,0)).scale(-(deckWidth/2 + 2));

    const t1TopR = pos1.add(hOffset).add(wOffsetR);
    const t2TopR = pos2.add(hOffset).add(wOffsetR);
    const startR = start.add(new BABYLON.Vector3(0, 5, 0)).add(wOffsetR); // Anchors
    const endR = end.add(new BABYLON.Vector3(0, 5, 0)).add(wOffsetR);

    // Draw Right Side Cables
    drawCableSegment(startR, t1TopR, -2); // Anchor up to tower
    drawCableSegment(t1TopR, t2TopR, -15); // Main span (Hanging)
    drawCableSegment(t2TopR, endR, -2);   // Tower down to anchor

    // Draw Left Side Cables
    const t1TopL = pos1.add(hOffset).add(wOffsetL);
    const t2TopL = pos2.add(hOffset).add(wOffsetL);
    const startL = start.add(new BABYLON.Vector3(0, 5, 0)).add(wOffsetL);
    const endL = end.add(new BABYLON.Vector3(0, 5, 0)).add(wOffsetL);

    drawCableSegment(startL, t1TopL, -2);
    drawCableSegment(t1TopL, t2TopL, -15);
    drawCableSegment(t2TopL, endL, -2);

    return bridgeRoot;
};
