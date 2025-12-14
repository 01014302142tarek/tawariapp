"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const SparklesCore = ({
    id,
    background,
    minSize,
    maxSize,
    particleDensity,
    className,
    particleColor,
}: {
    id?: string;
    background?: string;
    minSize?: number;
    maxSize?: number;
    particleDensity?: number;
    className?: string;
    particleColor?: string;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const particles = useRef<Particle[]>([]);
    const animationRef = useRef<number | undefined>(undefined);

    class Particle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        opacity: number;

        constructor(canvas: HTMLCanvasElement) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * ((maxSize || 2) - (minSize || 0.5)) + (minSize || 0.5);
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random();
        }

        update(canvas: HTMLCanvasElement) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity += (Math.random() - 0.5) * 0.05;
            this.opacity = Math.max(0.1, Math.min(1, this.opacity));

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor || "255, 255, 255"}, ${this.opacity})`;
            ctx.fill();
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                setCanvasSize({ width: canvas.width, height: canvas.height });
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasSize.width === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const density = particleDensity || 100;
        particles.current = Array.from(
            { length: density },
            () => new Particle(canvas)
        );

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current.forEach((particle) => {
                particle.update(canvas);
                particle.draw(ctx);
            });
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [canvasSize, particleDensity, minSize, maxSize, particleColor]);

    return (
        <canvas
            ref={canvasRef}
            id={id}
            className={cn("absolute inset-0 pointer-events-none", className)}
            style={{ background: background || "transparent" }}
        />
    );
};
