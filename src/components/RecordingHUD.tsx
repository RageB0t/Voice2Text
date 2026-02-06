import React, { useEffect, useState, useRef } from 'react';

interface RecordingHUDProps {
    isRecording: boolean;
    duration: number;
}

export const RecordingHUD: React.FC<RecordingHUDProps> = ({ isRecording }) => {
    const [visible, setVisible] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const rmsRef = useRef<number>(0);
    const targetRmsRef = useRef<number>(0);

    // Smooth fade in/out
    useEffect(() => {
        if (isRecording) {
            setVisible(true);
        } else {
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isRecording]);

    // Waveform animation
    useEffect(() => {
        if (!isRecording || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas resolution
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 160 * dpr;
        canvas.height = 40 * dpr;
        ctx.scale(dpr, dpr);

        let frame = 0;
        const bars = 12; // Number of waveform bars
        const barWidth = 3;
        const barGap = 2;
        const maxHeight = 32;
        const baseHeight = 4;

        const animate = () => {
            frame++;
            
            // Simulate RMS variation (in production, this would come from audio data)
            // Smooth sine wave with some randomness
            const baseRms = (Math.sin(frame * 0.05) + 1) / 2;
            const noise = Math.random() * 0.2;
            targetRmsRef.current = Math.min(1, baseRms + noise);
            
            // Smooth interpolation
            rmsRef.current += (targetRmsRef.current - rmsRef.current) * 0.15;
            
            // Clear canvas
            ctx.clearRect(0, 0, 160, 40);
            
            // Draw waveform bars
            const totalWidth = bars * (barWidth + barGap) - barGap;
            const startX = (160 - totalWidth) / 2;
            
            for (let i = 0; i < bars; i++) {
                const x = startX + i * (barWidth + barGap);
                
                // Create wave pattern - center bars are taller
                const centerDistance = Math.abs(i - bars / 2) / (bars / 2);
                const centerBoost = 1 - centerDistance * 0.5;
                
                // Add phase offset for wave effect
                const phase = (frame * 0.08) + (i * 0.3);
                const waveHeight = (Math.sin(phase) + 1) / 2;
                
                // Combine RMS with wave pattern
                const height = baseHeight + (maxHeight - baseHeight) * rmsRef.current * centerBoost * (0.5 + waveHeight * 0.5);
                
                // Center the bar vertically
                const y = (40 - height) / 2;
                
                // Gradient fill
                const gradient = ctx.createLinearGradient(x, y, x, y + height);
                gradient.addColorStop(0, '#6AE3FF');
                gradient.addColorStop(1, 'rgba(106, 227, 255, 0.4)');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, height);
                
                // Add glow
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(106, 227, 255, 0.5)';
                ctx.fillRect(x, y, barWidth, height);
                ctx.shadowBlur = 0;
            }
            
            animationRef.current = requestAnimationFrame(animate);
        };
        
        animationRef.current = requestAnimationFrame(animate);
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isRecording]);

    if (!visible) return null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            pointerEvents: 'none',
            userSelect: 'none',
        }}>
            {/* Glassy pill container */}
            <div style={{
                padding: '8px 20px',
                background: 'rgba(21, 27, 44, 0.8)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRadius: '28px',
                border: '1px solid rgba(106, 227, 255, 0.2)',
                boxShadow: `
                    0 8px 32px 0 rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(106, 227, 255, 0.1) inset,
                    0 0 40px rgba(106, 227, 255, 0.2)
                `,
                transform: isRecording ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
                opacity: isRecording ? 1 : 0,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
                <canvas 
                    ref={canvasRef}
                    style={{
                        width: '160px',
                        height: '40px',
                        display: 'block',
                    }}
                />
            </div>
        </div>
    );
};
