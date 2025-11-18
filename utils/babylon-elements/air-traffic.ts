
declare const BABYLON: any;

export const createAirTraffic = (scene: any) => {
    // ====================================================================
    // 1. REALISTIC JET AIRLINER
    // ====================================================================
    
    const createJet = () => {
        const jetRoot = new BABYLON.TransformNode("jetRoot", scene);

        // Materials
        const matBody = new BABYLON.StandardMaterial("jetBody", scene);
        matBody.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White
        matBody.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);

        const matDark = new BABYLON.StandardMaterial("jetDark", scene);
        matDark.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.15); // Cockpit/Tires

        const matMetal = new BABYLON.StandardMaterial("jetMetal", scene);
        matMetal.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.6); // Wings/Engines

        // A. Fuselage (Main Body)
        const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", { 
            height: 12, 
            diameter: 1.3,
            tessellation: 16 
        }, scene);
        fuselage.rotation.z = Math.PI / 2;
        fuselage.material = matBody;
        fuselage.parent = jetRoot;

        // Nose Cone
        const nose = BABYLON.MeshBuilder.CreateSphere("nose", { diameter: 1.3, segments: 16 }, scene);
        nose.position.x = 6;
        nose.scaling.x = 1.5; // Stretch it
        nose.material = matBody;
        nose.parent = jetRoot;

        // Cockpit Window
        const cockpit = BABYLON.MeshBuilder.CreateSphere("cockpit", { diameter: 1.25, segments: 16 }, scene);
        cockpit.position.x = 6.2;
        cockpit.position.y = 0.3;
        cockpit.scaling.x = 1.2;
        cockpit.material = matDark;
        cockpit.parent = jetRoot;

        // Tail Cone
        const tailCone = BABYLON.MeshBuilder.CreateCylinder("tailCone", { height: 3, diameterTop: 0.1, diameterBottom: 1.3 }, scene);
        tailCone.rotation.z = Math.PI / 2;
        tailCone.position.x = -7.5;
        tailCone.material = matBody;
        tailCone.parent = jetRoot;

        // B. Main Wings (Swept Back)
        const wingShape = [
            new BABYLON.Vector3(0, 0, 0),
            new BABYLON.Vector3(3, 0, -8), // Tip back
            new BABYLON.Vector3(-1, 0, -8),
            new BABYLON.Vector3(-3, 0, 0)
        ];
        // Extrude won't work easily for flat wings without custom mesh, using Boxes with rotation
        const wingL = BABYLON.MeshBuilder.CreateBox("wingL", { width: 4, height: 0.2, depth: 9 }, scene);
        wingL.position.z = 4.5;
        wingL.position.x = 1;
        wingL.rotation.y = -0.4; // Sweep
        wingL.material = matMetal;
        wingL.parent = jetRoot;

        const wingR = wingL.clone("wingR");
        wingR.position.z = -4.5;
        wingR.rotation.y = 0.4;
        wingR.parent = jetRoot;

        // C. Tail Stabilizers
        const stabilizerV = BABYLON.MeshBuilder.CreateBox("stabV", { width: 2.5, height: 3, depth: 0.3 }, scene);
        stabilizerV.position.x = -7.5;
        stabilizerV.position.y = 1.5;
        stabilizerV.rotation.z = -0.5; // Sweep back
        stabilizerV.material = matBody;
        stabilizerV.parent = jetRoot;

        const stabilizerH = BABYLON.MeshBuilder.CreateBox("stabH", { width: 2, height: 0.2, depth: 5 }, scene);
        stabilizerH.position.x = -7.5;
        stabilizerH.position.y = 0.5;
        stabilizerH.material = matMetal;
        stabilizerH.parent = jetRoot;

        // D. Engines
        const createEngine = (zPos: number) => {
            const engine = BABYLON.MeshBuilder.CreateCylinder("engine", { height: 2.5, diameter: 0.8 }, scene);
            engine.rotation.z = Math.PI / 2;
            engine.position.x = 0.5;
            engine.position.z = zPos;
            engine.position.y = -0.8;
            engine.material = matMetal;
            
            // Intake (Black circle)
            const intake = BABYLON.MeshBuilder.CreateCylinder("intake", { height: 0.1, diameter: 0.75 }, scene);
            intake.rotation.z = Math.PI / 2;
            intake.position.x = 1.26; // Front of engine
            intake.material = matDark;
            intake.parent = engine;

            return engine;
        };
        
        const engL = createEngine(3);
        engL.parent = jetRoot;
        const engR = createEngine(-3);
        engR.parent = jetRoot;

        // E. Navigation Lights (Blinking)
        const lightRed = BABYLON.MeshBuilder.CreateSphere("navRed", { diameter: 0.3 }, scene);
        lightRed.position.set(0, 0, -9); // Left Wingtip
        lightRed.parent = wingR;
        const matRed = new BABYLON.StandardMaterial("matRed", scene);
        matRed.emissiveColor = new BABYLON.Color3(1, 0, 0);
        lightRed.material = matRed;

        const lightGreen = BABYLON.MeshBuilder.CreateSphere("navGreen", { diameter: 0.3 }, scene);
        lightGreen.position.set(0, 0, 9); // Right Wingtip
        lightGreen.parent = wingL;
        const matGreen = new BABYLON.StandardMaterial("matGreen", scene);
        matGreen.emissiveColor = new BABYLON.Color3(0, 1, 0);
        lightGreen.material = matGreen;

        return jetRoot;
    };

    const jet = createJet();
    jet.position.y = 140;

    // ====================================================================
    // 2. FUTURISTIC QUAD-DRONE (Police/Surveyor)
    // ====================================================================

    const createDrone = () => {
        const droneRoot = new BABYLON.TransformNode("droneRoot", scene);
        
        const matDark = new BABYLON.StandardMaterial("droneDark", scene);
        matDark.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        matDark.emissiveColor = new BABYLON.Color3(0, 0.2, 0.3); // Cyan glow

        // Body
        const body = BABYLON.MeshBuilder.CreateBox("body", { width: 1.5, height: 0.6, depth: 2.5 }, scene);
        body.material = matDark;
        body.parent = droneRoot;

        // Arms
        const arm1 = BABYLON.MeshBuilder.CreateBox("arm1", { width: 4.5, height: 0.2, depth: 0.4 }, scene);
        arm1.rotation.y = Math.PI / 4;
        arm1.parent = droneRoot;
        arm1.material = matDark;
        
        const arm2 = BABYLON.MeshBuilder.CreateBox("arm2", { width: 4.5, height: 0.2, depth: 0.4 }, scene);
        arm2.rotation.y = -Math.PI / 4;
        arm2.parent = droneRoot;
        arm2.material = matDark;

        // Rotors
        const rotors: any[] = [];
        const createRotor = (x: number, z: number) => {
            const r = BABYLON.MeshBuilder.CreateCylinder("rotor", { height: 0.05, diameter: 2.5 }, scene);
            r.position.set(x, 0.3, z);
            r.parent = droneRoot;
            const rMat = new BABYLON.StandardMaterial("rotorMat", scene);
            rMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            rMat.alpha = 0.5; // Motion blur effect
            r.material = rMat;
            rotors.push(r);
        };

        const dist = 1.6;
        createRotor(dist, dist);
        createRotor(-dist, dist);
        createRotor(dist, -dist);
        createRotor(-dist, -dist);

        // Sensor/Camera Pod
        const sensor = BABYLON.MeshBuilder.CreateSphere("sensor", { diameter: 0.8 }, scene);
        sensor.position.y = -0.4;
        sensor.position.z = 0.8;
        sensor.parent = droneRoot;
        const sMat = new BABYLON.StandardMaterial("sMat", scene);
        sMat.emissiveColor = new BABYLON.Color3(1, 0, 0); // Red eye
        sensor.material = sMat;

        return { root: droneRoot, rotors };
    };

    const drone = createDrone();
    
    // ====================================================================
    // 3. ANIMATION LOOP
    // ====================================================================

    let time = 0;

    const updateAirTraffic = () => {
        time += 0.005;

        // --- JET ANIMATION ---
        // Wide Elliptical Path with Banking
        const radiusX = 250;
        const radiusZ = 200;
        
        const jetX = Math.cos(time * 0.8) * radiusX;
        const jetZ = Math.sin(time * 0.8) * radiusZ;
        const jetY = 140 + Math.sin(time) * 10; // Slight altitude variance

        jet.position.x = jetX;
        jet.position.z = jetZ;
        jet.position.y = jetY;

        // Calculate forward direction
        const nextX = Math.cos((time + 0.1) * 0.8) * radiusX;
        const nextZ = Math.sin((time + 0.1) * 0.8) * radiusZ;
        const nextY = 140 + Math.sin(time + 0.1) * 10;

        jet.lookAt(new BABYLON.Vector3(nextX, nextY, nextZ));

        // BANKING LOGIC: Roll into the turn
        // Turning left = Negative Roll
        // The circle is counter-clockwise, so it's always turning Left
        // We add a fixed bank angle plus some dynamic wobble
        jet.rotation.z = Math.PI; // Fix initial orientation issue if any, lookAt handles Y and X mostly
        // Re-apply LookAt's X/Y then manual Z
        // Actually lookAt overwrites everything. We need to use rotate or local axis.
        // Simpler approach: Reset rotation Z after lookAt
        const turnIntensity = 0.5; // 45 degrees max
        jet.rotation.z = -turnIntensity; // Permanent bank for circular path


        // --- DRONE ANIMATION ---
        // Figure-8 Patrol near the city center
        const dTime = time * 2;
        const dX = Math.sin(dTime) * 50;
        const dZ = Math.sin(dTime * 2) * 30;
        
        drone.root.position.x = dX;
        drone.root.position.z = dZ;
        drone.root.position.y = 60 + Math.cos(dTime * 3) * 2; // Hover bob

        // Face movement direction
        const dNextX = Math.sin(dTime + 0.1) * 50;
        const dNextZ = Math.sin((dTime + 0.1) * 2) * 30;
        drone.root.lookAt(new BABYLON.Vector3(dNextX, drone.root.position.y, dNextZ));

        // Tilt forward based on speed (fake physics)
        drone.root.rotation.x = 0.2; 

        // Spin Rotors
        drone.rotors.forEach((r: any) => {
            r.rotation.y += 1.5;
        });
    };

    return updateAirTraffic;
};
