"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

// Particle class for sparkles animation - moved outside component to avoid inline class warning
class Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;

    constructor(
        canvas: HTMLCanvasElement,
        minSize: number,
        maxSize: number
    ) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (maxSize - minSize) + minSize;
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

    draw(ctx: CanvasRenderingContext2D, particleColor: string) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${this.opacity})`;
        ctx.fill();
    }
}

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
    const [reduceMotion, setReduceMotion] = useState(false);
    const [isDocumentVisible, setIsDocumentVisible] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const particles = useRef<Particle[]>([]);
    const animationRef = useRef<number | undefined>(undefined);

    // Store props in refs to use in animation loop
    const minSizeValue = minSize || 0.5;
    const maxSizeValue = maxSize || 2;
    const colorValue = particleColor || "255, 255, 255";

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduceMotion(mediaQuery.matches);
        update();
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", update);
            return () => mediaQuery.removeEventListener("change", update);
        }
        mediaQuery.addListener(update);
        return () => mediaQuery.removeListener(update);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        let timeoutId: number | undefined;
        const { requestIdleCallback, cancelIdleCallback } = window as Window & {
            requestIdleCallback?: (cb: () => void) => number;
            cancelIdleCallback?: (id: number) => void;
        };
        const idleCallback = requestIdleCallback ? requestIdleCallback(() => setIsReady(true)) : undefined;
        if (!idleCallback) {
            timeoutId = window.setTimeout(() => setIsReady(true), 250);
        }
        return () => {
            if (idleCallback && cancelIdleCallback) {
                cancelIdleCallback(idleCallback);
            }
            if (timeoutId) {
                window.clearTimeout(timeoutId);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const handleVisibility = () => setIsDocumentVisible(document.visibilityState === "visible");
        handleVisibility();
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

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
        if (!canvas || canvasSize.width === 0 || !isDocumentVisible || !isReady) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const density = particleDensity || 100;
        const effectiveDensity = reduceMotion ? Math.max(10, Math.floor(density * 0.3)) : density;
        particles.current = Array.from(
            { length: effectiveDensity },
            () => new Particle(canvas, minSizeValue, maxSizeValue)
        );

        const drawFrame = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.current.forEach((particle) => {
                particle.update(canvas);
                particle.draw(ctx, colorValue);
            });
        };

        if (reduceMotion) {
            drawFrame();
            return () => {
                if (animationRef.current) cancelAnimationFrame(animationRef.current);
            };
        }

        const animate = () => {
            drawFrame();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [canvasSize, particleDensity, minSizeValue, maxSizeValue, colorValue, reduceMotion, isDocumentVisible, isReady]);

    return (
        <canvas
            ref={canvasRef}
            id={id}
            className={cn("absolute inset-0 pointer-events-none", className)}
            style={{ background: background || "transparent" }}
        />
    );
};
