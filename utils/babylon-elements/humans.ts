
import { ROAD_ZONES } from './roads';

declare const BABYLON: any;

export const createHumans = (scene: any) => {
    const humans: any[] = [];
    const drivers: any[] = [];

    // --- MATERIALS ---
    const skinMat = new BABYLON.StandardMaterial("skin", scene);
    skinMat.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.5);

    const shirtColors = [
        new BABYLON.Color3(0.9, 0.2, 0.2), // Red
        new BABYLON.Color3(0.2, 0.5, 0.9), // Blue
        new BABYLON.Color3(0.9, 0.9, 0.9), // White
        new BABYLON.Color3(0.2, 0.8, 0.2), // Green
        new BABYLON.Color3(0.1, 0.1, 0.1), // Black
    ];
    
    const pantColors = [
        new BABYLON.Color3(0.1, 0.1, 0.3), // Jeans
        new BABYLON.Color3(0.8, 0.7, 0.5), // Khaki
        new BABYLON.Color3(0.2, 0.2, 0.2), // Black
    ];

    const getRandomMat = (baseName: string, colors: any[]) => {
        const col = colors[Math.floor(Math.random() * colors.length)];
        const mat = new BABYLON.StandardMaterial(baseName + Math.random(), scene);
        mat.diffuseColor = col;
        return mat;
    };

    // Scooter Material
    const scooterMat = new BABYLON.PBRMaterial("scooterMat", scene);
    scooterMat.metallic = 0.8;
    scooterMat.roughness = 0.3;
    scooterMat.albedoColor = new BABYLON.Color3(0.8, 0.8, 0.8); // Chrome/Silver

    // --- BUILDER: HUMAN ---
    // Returns a root node with animated limbs accessible
    const createHumanMesh = (isSitting: boolean = false) => {
        const root = new BABYLON.TransformNode("human", scene);
        const shirtMat = getRandomMat("shirt", shirtColors);
        const pantMat = getRandomMat("pant", pantColors);

        // Dimensions (Unit = Meter approx)
        // Total height ~ 1.8
        
        // 1. Torso
        const torso = BABYLON.MeshBuilder.CreateBox("torso", { width: 0.4, height: 0.6, depth: 0.25 }, scene);
        torso.position.y = 1.1; // Legs are ~0.8
        torso.material = shirtMat;
        torso.parent = root;

        // 2. Head
        const head = BABYLON.MeshBuilder.CreateSphere("head", { diameter: 0.35 }, scene);
        head.position.y = 1.6;
        head.material = skinMat;
        head.parent = root;

        // 3. Limbs (Pivot at top)
        const createLimb = (name: string, w: number, h: number, d: number, mat: any, px: number, py: number) => {
            const pivot = new BABYLON.TransformNode(name + "Piv", scene);
            pivot.parent = root;
            pivot.position.set(px, py, 0);
            
            const mesh = BABYLON.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
            mesh.position.y = -h/2; // Hang down from pivot
            mesh.material = mat;
            mesh.parent = pivot;
            
            return pivot;
        };

        // Arms
        const armL = createLimb("armL", 0.12, 0.7, 0.12, shirtMat, 0.26, 1.35);
        const armR = createLimb("armR", 0.12, 0.7, 0.12, shirtMat, -0.26, 1.35);

        // Legs
        const legL = createLimb("legL", 0.15, 0.85, 0.15, pantMat, 0.1, 0.85);
        const legR = createLimb("legR", 0.15, 0.85, 0.15, pantMat, -0.1, 0.85);

        if (isSitting) {
            // Static sitting pose
            legL.rotation.x = -Math.PI / 2; // Legs forward
            legL.position.y += 0.2; // Lift up
            legL.position.z += 0.2;
            
            legR.rotation.x = -Math.PI / 2;
            legR.position.y += 0.2;
            legR.position.z += 0.2;

            // Arms forward (driving)
            armL.rotation.x = -Math.PI / 3;
            armR.rotation.x = -Math.PI / 3;
        }

        return { root, armL, armR, legL, legR };
    };

    // --- BUILDER: SCOOTER (Driving Group) ---
    const createScooter = () => {
        const root = new BABYLON.TransformNode("scooter", scene);

        // Body
        const body = BABYLON.MeshBuilder.CreateBox("sBody", { width: 0.4, height: 0.3, depth: 1.2 }, scene);
        body.position.y = 0.4;
        body.material = scooterMat;
        body.parent = root;

        // Handlebar stem
        const stem = BABYLON.MeshBuilder.CreateCylinder("stem", { height: 0.8, diameter: 0.05 }, scene);
        stem.position.set(0, 0.8, 0.4);
        stem.rotation.x = -0.2;
        stem.material = scooterMat;
        stem.parent = root;
        
        // Handles
        const bar = BABYLON.MeshBuilder.CreateCylinder("bar", { height: 0.6, diameter: 0.04 }, scene);
        bar.rotation.z = Math.PI/2;
        bar.position.y = 0.4;
        bar.parent = stem;
        bar.material = scooterMat;

        // Wheels (Hover discs)
        const w1 = BABYLON.MeshBuilder.CreateCylinder("w1", { height: 0.1, diameter: 0.4 }, scene);
        w1.rotation.z = Math.PI/2;
        w1.position.set(0, 0.2, 0.4);
        w1.material = scooterMat;
        w1.parent = root;

        const w2 = w1.clone("w2");
        w2.position.z = -0.4;
        w2.parent = root;

        // Add Driver
        const driver = createHumanMesh(true);
        driver.root.parent = root;
        driver.root.position.set(0, 0.2, -0.1); // Sit on seat

        return root;
    };

    // --- SPAWN PEDESTRIANS ---
    const spawnPedestrians = () => {
        const count = 60;
        const centerRadius = 40; // Plaza
        
        for(let i=0; i<count; i++) {
            const h = createHumanMesh(false);
            
            // Random Position in Plaza
            const r = Math.random() * centerRadius;
            const theta = Math.random() * Math.PI * 2;
            
            h.root.position.set(r * Math.cos(theta), 0.1, r * Math.sin(theta));
            h.root.rotation.y = Math.random() * Math.PI * 2;

            humans.push({
                mesh: h,
                speed: 0.02 + Math.random() * 0.02,
                phase: Math.random() * 100,
                turnTimer: Math.random() * 100
            });
        }
    };

    // --- SPAWN DRIVERS (Scooters) ---
    const spawnDrivers = () => {
        const count = 20;
        
        for(let i=0; i<count; i++) {
            const sc = createScooter();
            
            // Pick a road zone
            const zone = ROAD_ZONES[0]; // Inner loop
            const r = zone.radius - 5 + (Math.random() * 10); // Spread in lanes
            
            const angle = Math.random() * Math.PI * 2;
            
            drivers.push({
                root: sc,
                radius: r,
                angle: angle,
                speed: 0.005 + Math.random() * 0.002
            });
        }
    };

    spawnPedestrians();
    spawnDrivers();

    // --- ANIMATION LOOP ---
    let time = 0;
    
    const update = () => {
        time += 0.1;

        // 1. Update Pedestrians
        humans.forEach(h => {
            // Move forward
            h.mesh.root.translate(BABYLON.Axis.Z, h.speed, BABYLON.Space.LOCAL);
            
            // Random Turn
            h.turnTimer--;
            if (h.turnTimer < 0) {
                h.mesh.root.rotation.y += (Math.random() - 0.5) * 2;
                h.turnTimer = 100 + Math.random() * 200;
            }

            // Boundary Check (Keep in plaza radius 45)
            if (h.mesh.root.position.length() > 42) {
                h.mesh.root.lookAt(new BABYLON.Vector3(0,0,0)); // Turn back to center
            }

            // Walk Cycle (Legs/Arms)
            const walk = Math.sin(time * 2 + h.phase) * 0.6;
            h.mesh.legL.rotation.x = walk;
            h.mesh.legR.rotation.x = -walk;
            h.mesh.armL.rotation.x = -walk * 0.5;
            h.mesh.armR.rotation.x = walk * 0.5;
        });

        // 2. Update Drivers
        drivers.forEach(d => {
            d.angle += d.speed;
            
            const x = Math.cos(d.angle) * d.radius;
            const z = Math.sin(d.angle) * d.radius;
            
            d.root.position.set(x, 0.1, z);
            
            // Look forward (Tangent)
            const nextX = Math.cos(d.angle + 0.1) * d.radius;
            const nextZ = Math.sin(d.angle + 0.1) * d.radius;
            d.root.lookAt(new BABYLON.Vector3(nextX, 0.1, nextZ));
            
            // Lean into turn
            d.root.rotation.z = -0.2; // Always turning left in orbit
        });
    };

    return { update };
};
