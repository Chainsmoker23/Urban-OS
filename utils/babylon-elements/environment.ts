
declare const BABYLON: any;

export const setupEnvironment = (scene: any, shadowGenerator: any) => {
    // --- MATERIALS ---
    
    // 1. Concrete (Used by buildings/props)
    const concreteMat = new BABYLON.StandardMaterial("concrete", scene);
    concreteMat.diffuseColor = new BABYLON.Color3(0.8, 0.82, 0.85);
    concreteMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // 2. Glass (Used by buildings)
    const glassMat = new BABYLON.PBRMaterial("glass", scene);
    glassMat.albedoColor = new BABYLON.Color3(0.2, 0.6, 0.9);
    glassMat.alpha = 0.65;
    glassMat.metallic = 1.0;
    glassMat.roughness = 0.05;
    glassMat.environmentIntensity = 1.2;

    // 3. Asphalt (Used by roads/ground)
    const asphaltMat = new BABYLON.StandardMaterial("asphalt", scene);
    asphaltMat.diffuseColor = new BABYLON.Color3(0.15, 0.18, 0.22);
    asphaltMat.specularColor = new BABYLON.Color3(0.05, 0.05, 0.05);

    // NOTE: Ocean logic moved to ocean.ts
    
    return {
        materials: { concreteMat, glassMat, asphaltMat }
    };
};
