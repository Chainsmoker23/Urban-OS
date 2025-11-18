
import React, { useEffect, useRef } from 'react';
import { createCityScene } from '../utils/babylon-scene';

interface City3DProps {
    tiltX?: number;
    tiltY?: number;
}

export const City3D: React.FC<City3DProps> = ({ tiltX, tiltY }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<any>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const { engine, scene } = createCityScene(canvasRef.current);
            engineRef.current = engine;

            engine.runRenderLoop(() => {
                scene.render();
            });

            const handleResize = () => {
                engine.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                engine.dispose();
            };
        }
    }, []);

    return (
        <div className="w-full h-full overflow-hidden bg-slate-900">
            <canvas ref={canvasRef} id="renderCanvas" className="w-full h-full outline-none" />
            {/* Overlay Gradient for Atmosphere */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/20 to-transparent"></div>
        </div>
    );
};
