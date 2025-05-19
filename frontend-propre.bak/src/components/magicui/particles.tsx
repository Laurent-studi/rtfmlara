'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  refresh?: boolean;
  color?: string;
  size?: number;
}

export function Particles({
  className = '',
  quantity = 40,
  staticity = 50,
  ease = 50,
  refresh = false,
  color = '#ffffff',
  size = 1.3,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<any[]>([]);
  const mousePosition = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };
  const mouse = {
    x: 0,
    y: 0,
  };
  const canvasSize = {
    w: 0,
    h: 0,
  };
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext('2d');
    }
    initCanvas();
    animate();
    window.addEventListener('resize', initCanvas);

    return () => {
      window.removeEventListener('resize', initCanvas);
    };
  }, [quantity, staticity, ease, refresh, windowSize]);

  useEffect(() => {
    initCanvas();
  }, [refresh]);

  const initCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current = [];
      canvasSize.w = canvasContainerRef.current.offsetWidth;
      canvasSize.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.w * dpr;
      canvasRef.current.height = canvasSize.h * dpr;
      canvasRef.current.style.width = `${canvasSize.w}px`;
      canvasRef.current.style.height = `${canvasSize.h}px`;
      context.current.scale(dpr, dpr);

      for (let i = 0; i < quantity; i++) {
        const x = Math.random() * canvasSize.w;
        const y = Math.random() * canvasSize.h;
        const radius = Math.random() * size + 0.5;
        circles.current.push(new Circle(x, y, radius, context.current, canvasSize, mouse, staticity, ease, color));
      }
    }
  };

  const animate = () => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasSize.w, canvasSize.h);
      circles.current.forEach((circle) => {
        circle.move();
        circle.draw();
      });
      window.requestAnimationFrame(animate);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
    }
  };

  return (
    <div 
      className={className}
      ref={canvasContainerRef}
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

class Circle {
  x: number;
  y: number;
  radius: number;
  context: CanvasRenderingContext2D;
  canvasSize: { w: number; h: number };
  mouse: { x: number; y: number };
  staticity: number;
  ease: number;
  color: string;
  dx: number;
  dy: number;

  constructor(
    x: number,
    y: number,
    radius: number,
    context: CanvasRenderingContext2D,
    canvasSize: { w: number; h: number },
    mouse: { x: number; y: number },
    staticity: number,
    ease: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.context = context;
    this.canvasSize = canvasSize;
    this.mouse = mouse;
    this.staticity = staticity;
    this.ease = ease;
    this.color = color;
    this.dx = Math.random() * 0.8 - 0.4;
    this.dy = Math.random() * 0.8 - 0.4;
  }

  draw() {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.context.closePath();
    this.context.fillStyle = this.color;
    this.context.fill();
  }

  move() {
    const distanceFromMouseX = this.mouse.x - this.x;
    const distanceFromMouseY = this.mouse.y - this.y;
    const distance = Math.sqrt(distanceFromMouseX ** 2 + distanceFromMouseY ** 2);
    const hasIntersection = distance < 120;

    if (hasIntersection) {
      const angle = Math.atan2(distanceFromMouseY, distanceFromMouseX);
      const velocity = 120 / distance;

      this.dx = Math.cos(angle) * velocity * -1;
      this.dy = Math.sin(angle) * velocity * -1;
    } else {
      this.dx += Math.random() * 0.02 - 0.01;
      this.dy += Math.random() * 0.02 - 0.01;
      this.dx *= 0.9;
      this.dy *= 0.9;
    }

    if (this.x + this.radius < 0) this.x = this.canvasSize.w + this.radius;
    else if (this.x - this.radius > this.canvasSize.w) this.x = -this.radius;
    if (this.y + this.radius < 0) this.y = this.canvasSize.h + this.radius;
    else if (this.y - this.radius > this.canvasSize.h) this.y = -this.radius;

    this.x += this.dx;
    this.y += this.dy;
  }
} 