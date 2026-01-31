"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/app/i18n";
import { GlowingCard } from "@/components/ui/glowing-card";

// Icons
const Icons = {
    camera: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
    microphone: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ),
    x: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    speaker: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    video: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
    ),
};

interface DeviceStatus {
    camera: "checking" | "granted" | "denied" | "error";
    microphone: "checking" | "granted" | "denied" | "error";
    speaker: "checking" | "granted" | "error";
}

export default function PreCallPage() {
    const params = useParams();
    const router = useRouter();
    const { isRTL, language } = useI18n();
    const appointmentId = params.appointmentId as string;

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
        camera: "checking",
        microphone: "checking",
        speaker: "checking",
    });
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [audioLevel, setAudioLevel] = useState(0);

    // Check device permissions
    const checkDevices = useCallback(async () => {
        try {
            // Request camera and microphone
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            setStream(mediaStream);
            streamRef.current = mediaStream;
            setDeviceStatus({
                camera: "granted",
                microphone: "granted",
                speaker: "granted",
            });

            // Connect to video element
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // Set up audio level monitoring
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(mediaStream);
            source.connect(analyser);
            analyser.fftSize = 256;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                setAudioLevel(Math.min(100, average * 2));
                requestAnimationFrame(updateAudioLevel);
            };
            updateAudioLevel();
        } catch (error) {
            const err = error as Error;

            if (err.name === "NotAllowedError") {
                setDeviceStatus({
                    camera: "denied",
                    microphone: "denied",
                    speaker: "granted",
                });
            } else {
                setDeviceStatus({
                    camera: "error",
                    microphone: "error",
                    speaker: "error",
                });
            }
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Device check on mount is required for setup
        checkDevices();

        return () => {
            // Clean up stream using ref to avoid stale closure
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [checkDevices]);

    // Toggle camera
    const toggleCamera = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    // Toggle microphone
    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    // Join call - go back to waiting room which will redirect to consultation when doctor starts
    const handleJoinCall = () => {
        // Stop preview stream before joining
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        // Go back to waiting room - it has polling that will redirect to consultation
        // when the doctor starts the call and the status changes to "in_progress"
        router.push(`/${language}/dashboard/consultation/${appointmentId}/waiting-room`);
    };

    // Go back
    const handleBack = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        router.back();
    };

    const allDevicesReady =
        deviceStatus.camera === "granted" && deviceStatus.microphone === "granted";

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "granted":
                return <span className="text-emerald-500">{Icons.check}</span>;
            case "denied":
            case "error":
                return <span className="text-red-500">{Icons.x}</span>;
            default:
                return (
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                );
        }
    };

    const getStatusText = (status: string, device: string) => {
        const texts: Record<string, Record<string, string>> = {
            camera: {
                checking: isRTL ? "جاري التحقق..." : "Checking...",
                granted: isRTL ? "الكاميرا جاهزة" : "Camera ready",
                denied: isRTL ? "تم رفض الوصول للكاميرا" : "Camera access denied",
                error: isRTL ? "خطأ في الكاميرا" : "Camera error",
            },
            microphone: {
                checking: isRTL ? "جاري التحقق..." : "Checking...",
                granted: isRTL ? "الميكروفون جاهز" : "Microphone ready",
                denied: isRTL ? "تم رفض الوصول للميكروفون" : "Microphone access denied",
                error: isRTL ? "خطأ في الميكروفون" : "Microphone error",
            },
            speaker: {
                checking: isRTL ? "جاري التحقق..." : "Checking...",
                granted: isRTL ? "مكبر الصوت جاهز" : "Speaker ready",
                error: isRTL ? "خطأ في مكبر الصوت" : "Speaker error",
            },
        };
        return texts[device]?.[status] || status;
    };

    return (
        <div className={cn("min-h-screen bg-slate-950 flex flex-col", isRTL && "rtl")}>
            {/* Header */}
            <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-white/10 flex items-center justify-between px-4">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
                        />
                    </svg>
                    <span>{isRTL ? "رجوع" : "Back"}</span>
                </button>
                <h1 className="text-white font-medium">
                    {isRTL ? "التحقق من الأجهزة" : "Device Check"}
                </h1>
                <div className="w-20" />
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Video Preview */}
                        <GlowingCard glowColor="teal" className="p-4" isDark>
                            <h2 className="text-lg font-semibold text-white mb-4">
                                {isRTL ? "معاينة الكاميرا" : "Camera Preview"}
                            </h2>
                            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                                {deviceStatus.camera === "granted" && isCameraOn ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover scale-x-[-1]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                                                {Icons.video}
                                            </div>
                                            <p className="text-gray-400">
                                                {deviceStatus.camera === "denied"
                                                    ? isRTL
                                                        ? "الكاميرا معطلة"
                                                        : "Camera is off"
                                                    : isRTL
                                                    ? "الكاميرا متوقفة"
                                                    : "Camera is off"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Camera/Mic controls overlay */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                                    <button
                                        onClick={toggleCamera}
                                        className={cn(
                                            "p-3 rounded-full transition-colors",
                                            isCameraOn
                                                ? "bg-white/20 hover:bg-white/30 text-white"
                                                : "bg-red-500/80 hover:bg-red-500 text-white"
                                        )}
                                    >
                                        {Icons.camera}
                                    </button>
                                    <button
                                        onClick={toggleMic}
                                        className={cn(
                                            "p-3 rounded-full transition-colors",
                                            isMicOn
                                                ? "bg-white/20 hover:bg-white/30 text-white"
                                                : "bg-red-500/80 hover:bg-red-500 text-white"
                                        )}
                                    >
                                        {Icons.microphone}
                                    </button>
                                </div>
                            </div>

                            {/* Audio level indicator */}
                            {isMicOn && deviceStatus.microphone === "granted" && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-teal-500">{Icons.microphone}</span>
                                        <span className="text-sm text-gray-400">
                                            {isRTL ? "مستوى الصوت" : "Audio Level"}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                                            animate={{ width: `${audioLevel}%` }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </div>
                                </div>
                            )}
                        </GlowingCard>

                        {/* Device Status */}
                        <div className="space-y-4">
                            <GlowingCard glowColor="teal" className="p-4" isDark>
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    {isRTL ? "حالة الأجهزة" : "Device Status"}
                                </h2>
                                <div className="space-y-4">
                                    {/* Camera */}
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-teal-500">{Icons.camera}</span>
                                            <span className="text-white">
                                                {isRTL ? "الكاميرا" : "Camera"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">
                                                {getStatusText(deviceStatus.camera, "camera")}
                                            </span>
                                            {getStatusIcon(deviceStatus.camera)}
                                        </div>
                                    </div>

                                    {/* Microphone */}
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-teal-500">{Icons.microphone}</span>
                                            <span className="text-white">
                                                {isRTL ? "الميكروفون" : "Microphone"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">
                                                {getStatusText(deviceStatus.microphone, "microphone")}
                                            </span>
                                            {getStatusIcon(deviceStatus.microphone)}
                                        </div>
                                    </div>

                                    {/* Speaker */}
                                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="text-teal-500">{Icons.speaker}</span>
                                            <span className="text-white">
                                                {isRTL ? "مكبر الصوت" : "Speaker"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">
                                                {getStatusText(deviceStatus.speaker, "speaker")}
                                            </span>
                                            {getStatusIcon(deviceStatus.speaker)}
                                        </div>
                                    </div>
                                </div>
                            </GlowingCard>

                            {/* Permission Warning */}
                            {(deviceStatus.camera === "denied" ||
                                deviceStatus.microphone === "denied") && (
                                <GlowingCard glowColor="amber" className="p-4" isDark>
                                    <div className="flex gap-3">
                                        <span className="text-amber-500">{Icons.warning}</span>
                                        <div>
                                            <h3 className="text-amber-400 font-medium mb-1">
                                                {isRTL
                                                    ? "صلاحيات مطلوبة"
                                                    : "Permissions Required"}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {isRTL
                                                    ? "يرجى السماح بالوصول إلى الكاميرا والميكروفون من إعدادات المتصفح للانضمام إلى المكالمة."
                                                    : "Please allow camera and microphone access in your browser settings to join the call."}
                                            </p>
                                            <button
                                                onClick={checkDevices}
                                                className="mt-3 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
                                            >
                                                {isRTL ? "إعادة المحاولة" : "Try Again"}
                                            </button>
                                        </div>
                                    </div>
                                </GlowingCard>
                            )}

                            {/* Join Button */}
                            <button
                                onClick={handleJoinCall}
                                disabled={!allDevicesReady}
                                className={cn(
                                    "w-full py-4 rounded-xl font-semibold text-lg transition-all",
                                    allDevicesReady
                                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25"
                                        : "bg-slate-800 text-gray-500 cursor-not-allowed"
                                )}
                            >
                                {allDevicesReady
                                    ? isRTL
                                        ? "انضم إلى المكالمة"
                                        : "Join Call"
                                    : isRTL
                                    ? "جاري التحقق من الأجهزة..."
                                    : "Checking devices..."}
                            </button>

                            {/* Tips */}
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>
                                    {isRTL ? "💡 نصائح:" : "💡 Tips:"}
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>
                                        {isRTL
                                            ? "تأكد من وجود إضاءة جيدة"
                                            : "Ensure good lighting"}
                                    </li>
                                    <li>
                                        {isRTL
                                            ? "استخدم سماعات للحصول على صوت أفضل"
                                            : "Use headphones for better audio"}
                                    </li>
                                    <li>
                                        {isRTL
                                            ? "أغلق التطبيقات الأخرى لأداء أفضل"
                                            : "Close other apps for better performance"}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
