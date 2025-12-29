
import React, { useRef, useEffect } from 'react';
import { useInterviewStore } from '../../store/useInterviewStore';

const AudioVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { volumeLevel, isMicActive, isAudioPlaying } = useInterviewStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let phase = 0;

        const draw = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerY = height / 2;

            ctx.clearRect(0, 0, width, height);

            // Determine amplitude based on who is talking (User or AI)
            // If mic is active, use volumeLevel. If AI is playing, simulate simple wave or use separate state.
            // For now, let's visualize user input volume, or a standby wave if AI is thinking.

            const isActive = isMicActive || isAudioPlaying;
            const baseAmplitude = isActive ? (volumeLevel > 0 ? volumeLevel / 2 : 20) : 5;
            const color = isAudioPlaying ? '#a78bfa' : '#3b82f6'; // Purple for AI, Blue for User

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;

            for (let x = 0; x < width; x++) {
                // Create a sine wave that varies with amplitude and phase
                const y = centerY + Math.sin(x * 0.05 + phase) * baseAmplitude * Math.sin(x * 0.01 + phase * 0.5);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();

            // Mirror effect for symmetry
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = 0.5;
            for (let x = 0; x < width; x++) {
                const y = centerY - Math.sin(x * 0.05 + phase) * baseAmplitude * Math.sin(x * 0.01 + phase * 0.5);
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            phase += 0.15;
            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationId);
    }, [volumeLevel, isMicActive, isAudioPlaying]);

    return (
        <div className="w-full h-24 glass rounded-2xl border-white/5 overflow-hidden relative">
            <div className="absolute top-2 left-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                {isAudioPlaying ? 'AI Speaking' : isMicActive ? 'Listening...' : 'Audio Idle'}
            </div>
            <canvas ref={canvasRef} width={600} height={100} className="w-full h-full" />
        </div>
    );
};

export default AudioVisualizer;
