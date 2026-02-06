"use client";

import React, { useEffect, useRef, useState } from "react";

type FlowGradientCursorProps = {
  children: React.ReactNode;
  className?: string;
  hideNativeCursor?: boolean;
};

export function FlowGradientCursor({
  children,
  className,
  hideNativeCursor = false,
}: FlowGradientCursorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let ringX = 0,
      ringY = 0,
      dotX = 0,
      dotY = 0;
    let raf = 0;

    const animate = () => {
      ringX += (mouse.current.x - ringX) * 0.12;
      ringY += (mouse.current.y - ringY) * 0.12;
      dotX += (mouse.current.x - dotX) * 0.3;
      dotY += (mouse.current.y - dotY) * 0.3;

      ring.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
      dot.style.transform = `translate3d(${dotX - 4}px, ${dotY - 4}px, 0)`;

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    cursor: hideNativeCursor ? 'none' : 'default',
    height: '100%',
    width: '100%',
  };

  const ringStyle: React.CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 50,
    height: '40px',
    width: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 30px rgba(106, 227, 255, 0.12)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 150ms',
  };

  const ringInnerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    boxShadow: 'inset 0 0 0 1px rgba(106, 227, 255, 0.2)',
  };

  const dotStyle: React.CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 50,
    height: '8px',
    width: '8px',
    borderRadius: '50%',
    background: 'rgba(106, 227, 255, 0.8)',
    boxShadow: '0 0 18px rgba(106, 227, 255, 0.35)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 150ms',
  };

  return (
    <div
      ref={wrapperRef}
      onMouseMove={onMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={wrapperStyle}
      className={className}
    >
      {children}

      {/* Cursor Ring */}
      <div ref={ringRef} style={ringStyle}>
        <div style={ringInnerStyle} />
      </div>

      {/* Cursor Dot */}
      <div ref={dotRef} style={dotStyle} />
    </div>
  );
}
