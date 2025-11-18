
declare const BABYLON: any;

export const createOcean = (scene: any) => {
    // --- 1. SHADER DEFINITION ---
    BABYLON.Effect.ShadersStore["oceanVertexShader"] = `
        precision highp float;

        // Attributes
        attribute vec3 position;
        attribute vec2 uv;

        // Uniforms
        uniform mat4 worldViewProjection;
        uniform float time;

        // Varying
        varying vec3 vPosition;
        varying vec2 vUV;

        void main() {
            vec3 p = position;
            
            // PERFECT GLASSY WAVES
            // Subtle, multi-layered sine waves for a tropical calm look
            
            // Swell
            float wave1 = sin(p.x * 0.02 + time * 0.3) * cos(p.z * 0.03 + time * 0.2) * 0.2;
            
            // Surface texture/ripple
            float wave2 = sin(p.x * 0.1 + time * 0.8) * 0.05;
            float wave3 = cos(p.z * 0.15 + time * 0.6) * 0.05;
            
            // Micro detail
            float wave4 = sin((p.x + p.z) * 0.4 + time * 1.5) * 0.02;

            // Combine
            p.y = wave1 + wave2 + wave3 + wave4; 

            gl_Position = worldViewProjection * vec4(p, 1.0);
            
            vPosition = p;
            vUV = uv;
        }
    `;

    BABYLON.Effect.ShadersStore["oceanFragmentShader"] = `
        precision highp float;

        varying vec3 vPosition;
        varying vec2 vUV;

        // Colors
        uniform vec3 colorDeep;
        uniform vec3 colorShallow;
        uniform vec3 colorFoam;

        void main() {
            float h = vPosition.y;
            
            // Gradient Mixing based on wave height
            // We stretch the gradient to make it look more translucent
            float gradient = smoothstep(-0.4, 0.4, h);
            
            // Mix Deep and Shallow
            vec3 waterColor = mix(colorDeep, colorShallow, gradient);
            
            // Sparkle/Foam on peaks
            float foamFactor = smoothstep(0.25, 0.35, h);
            vec3 finalColor = mix(waterColor, colorFoam, foamFactor * 0.5); // softer foam

            // High Alpha but slightly transparent for depth feel
            gl_FragColor = vec4(finalColor, 0.92);
        }
    `;

    // --- 2. CREATE MATERIAL ---
    const oceanMat = new BABYLON.ShaderMaterial("oceanMat", scene, {
        vertex: "ocean",
        fragment: "ocean",
    },
    {
        attributes: ["position", "uv"],
        uniforms: ["worldViewProjection", "time", "colorDeep", "colorShallow", "colorFoam"],
        needAlphaBlending: true
    });

    // FULL LIGHT BLUE / CRYSTAL PALETTE (UPDATED)
    // Deep: Very Bright Blue (No dark navy)
    oceanMat.setColor3("colorDeep", new BABYLON.Color3(0.4, 0.8, 1.0));   
    // Shallow: Almost White Cyan
    oceanMat.setColor3("colorShallow", new BABYLON.Color3(0.65, 0.95, 1.0)); 
    // Foam: Pure White
    oceanMat.setColor3("colorFoam", new BABYLON.Color3(1.0, 1.0, 1.0));   

    // --- 3. CREATE MESH ---
    const ocean = BABYLON.MeshBuilder.CreateGround("ocean", { 
        width: 2000, 
        height: 2000, 
        subdivisions: 150 
    }, scene);
    
    ocean.material = oceanMat;
    // Physically lower the mesh so it sits safely below the street/ground level
    ocean.position.y = -1.5; 

    // --- 4. ANIMATION UPDATE ---
    let time = 0;
    
    const updateOcean = () => {
        time += 0.01; // Gentle speed
        oceanMat.setFloat("time", time);
    };

    return updateOcean;
};
