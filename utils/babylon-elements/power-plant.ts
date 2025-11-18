
import { ROAD_ZONES } from './roads';

declare const BABYLON: any;

export const createPowerPlants = (scene: any, shadowGenerator: any) => {
    const root = new BABYLON.TransformNode("powerPlantRoot", scene);

    // --- MATERIALS ---
    const matConcrete = new BABYLON.StandardMaterial("ppConcrete", scene);
    matConcrete.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.65); // Dirty concrete
    matConcrete.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    const matDark = new BABYLON.StandardMaterial("ppDark", scene);
    matDark.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);

    const matReactor = new BABYLON.StandardMaterial("ppReactor", scene);
    matReactor.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
    matReactor.emissiveColor = new BABYLON.Color3(0.1, 0.2, 0.2); // Faint glow

    const matWarning = new BABYLON.StandardMaterial("ppWarn", scene);
    matWarning.emissiveColor = new BABYLON.Color3(1, 0.5, 0); // Orange light

    // --- 1. COOLING TOWER GENERATOR ---
    const createCoolingTower = (x: number, z: number) => {
        const height = 35;
        const baseR = 10;
        const topR = 7;
        const midR = 6;
        
        // Hyperboloid shape using Tube with radius function
        const path = [
            new BABYLON.Vector3(x, 0, z),
            new BABYLON.Vector3(x, height, z)
        ];

        const radiusFunction = (i: number, distance: number) => {
            const t = distance / height; // 0 to 1
            // Quadratic curve approx: f(t)
            // 0 -> baseR, 0.7 -> midR, 1 -> topR
            if (t < 0.7) {
                // Shrink from base to mid
                const p = t / 0.7; 
                return baseR * (1-p) + midR * p; 
            } else {
                // Flare out
                const p = (t - 0.7) / 0.3;
                return midR * (1-p) + topR * p;
            }
        };

        const tower = BABYLON.MeshBuilder.CreateTube("coolingTower", {
            path: path,
            radiusFunction: radiusFunction,
            tessellation: 32,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            cap: BABYLON.Mesh.NO_CAP
        }, scene);
        
        tower.material = matConcrete;
        tower.parent = root;
        shadowGenerator.addShadowCaster(tower);

        // Add Rim at top
        const rim = BABYLON.MeshBuilder.CreateTorus("rim", { diameter: topR * 2, thickness: 0.5 }, scene);
        rim.position.set(x, height, z);
        rim.material = matDark;
        rim.parent = root;

        // --- STEAM PARTICLES (Realism Upgrade) ---
        const particleSystem = new BABYLON.ParticleSystem("steam", 2000, scene);
        particleSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/cloud.png", scene);
        
        // Emitter at top center
        particleSystem.emitter = new BABYLON.Vector3(x, height - 2, z);
        particleSystem.minEmitBox = new BABYLON.Vector3(-3, 0, -3);
        particleSystem.maxEmitBox = new BABYLON.Vector3(3, 0, 3);

        // Thick White Smoke (Standard Blend, not Additive)
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
        
        particleSystem.color1 = new BABYLON.Color4(0.9, 0.9, 0.9, 0.5); // Start Opaque
        particleSystem.color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 0.3); 
        particleSystem.colorDead = new BABYLON.Color4(0.9, 0.9, 0.9, 0.0); // Fade out

        // Volumetric Size - REDUCED (Very Small as requested)
        particleSystem.minSize = 0.5; 
        particleSystem.maxSize = 2.0;

        // Life
        particleSystem.minLifeTime = 3;
        particleSystem.maxLifeTime = 6;

        // Rate
        particleSystem.emitRate = 150; // Denser stream for smaller particles

        // Physics (Rising with Wind)
        particleSystem.gravity = new BABYLON.Vector3(1.5, 0.2, 0); // Wind pushing X+
        particleSystem.direction1 = new BABYLON.Vector3(-1, 4, -1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 6, 1);
        
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 2;
        particleSystem.updateSpeed = 0.015;
        
        // Rotation
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI / 4;

        // Pre-warm to show smoke immediately
        particleSystem.preWarmCycles = 100;
        particleSystem.preWarmStepOffset = 5;
        
        particleSystem.start();
    };

    // --- 2. REACTOR BUILDING ---
    const createReactorBlock = (x: number, z: number) => {
        const group = new BABYLON.TransformNode("reactorGrp", scene);
        group.position.set(x, 0, z);
        group.parent = root;

        // Main Block
        const hall = BABYLON.MeshBuilder.CreateBox("hall", { width: 25, height: 10, depth: 15 }, scene);
        hall.position.y = 5;
        hall.material = matConcrete;
        hall.parent = group;
        shadowGenerator.addShadowCaster(hall);

        // Containment Dome
        const dome = BABYLON.MeshBuilder.CreateSphere("dome", { diameter: 14, slice: 0.5 }, scene);
        dome.position.y = 10;
        dome.material = matReactor;
        dome.parent = group;

        // Smokestack (Vent)
        const stack = BABYLON.MeshBuilder.CreateCylinder("stack", { height: 40, diameter: 1.5 }, scene);
        stack.position.set(8, 20, 4);
        stack.material = matDark; 
        stack.parent = group;
        
        // Warning Light on stack
        const light = BABYLON.MeshBuilder.CreateSphere("warn", { diameter: 1 }, scene);
        light.position.set(8, 40, 4);
        light.material = matWarning;
        light.parent = group;
        
        // Animate Light Blink
        let alpha = 0;
        scene.registerBeforeRender(() => {
            alpha += 0.1;
            matWarning.emissiveColor.scaleToRef(0.5 + Math.sin(alpha)*0.5, matWarning.emissiveColor);
        });
    };

    // --- PLACEMENT ---
    // Plant 1: Industrial West
    createCoolingTower(-140, 40);
    createCoolingTower(-120, 55);
    createReactorBlock(-130, 25);

    // Plant 2: Industrial North-West
    createCoolingTower(-90, 130);
    createReactorBlock(-70, 130);
};
