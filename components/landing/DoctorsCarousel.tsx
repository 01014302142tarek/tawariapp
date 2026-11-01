"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGlobalTheme } from "@/app/context/GlobalThemeContext";

export interface Doctor {
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  experience: string;
  rating: number;
  reviews: number;
  fee: number;
  image: string;
  available: boolean;
}

interface DoctorsCarouselProps {
  doctors: Doctor[];
  isRTL: boolean;
  language: string;
}

export default function DoctorsCarousel({
  doctors,
  isRTL,
  language,
}: DoctorsCarouselProps) {
  const { isDark } = useGlobalTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  // Update visibleCount based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(1, doctors.length - visibleCount + 1);

  // Auto-advance carousel
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex - 1 : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch handlers for swipe on mobile with scroll protection
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distX = touchStartX.current - touchEndX.current;
    const distY = touchStartY.current && touchEndY.current ? touchStartY.current - touchEndY.current : 0;
    
    // Only trigger horizontal swipe when horizontal movement is intentional and dominant
    const isSwipe = Math.abs(distX) > 40 && Math.abs(distX) > Math.abs(distY) * 1.2;

    if (isSwipe) {
      if (distX > 0) {
        // Swiped left
        if (isRTL) prevSlide();
        else nextSlide();
      } else {
        // Swiped right
        if (isRTL) nextSlide();
        else prevSlide();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Shift calculation
  const shiftPercentage = (currentIndex * 100) / visibleCount;
  // In RTL, positive translateX shifts the items to the right, showing next items
  const transformStyle = isRTL
    ? `translateX(${shiftPercentage}%)`
    : `translateX(-${shiftPercentage}%)`;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel Viewport */}
      <div className="overflow-hidden py-4 -my-4 px-1">
        <div
          className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: transformStyle }}
        >
          {doctors.map((doctor, index) => (
            <div
              key={`${doctor.name}-${index}`}
              className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 px-2 sm:px-3"
            >
              <div
                className={`h-full rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden group hover:-translate-y-1.5 ${
                  isDark
                    ? "bg-gradient-to-b from-[#0F1D38]/95 via-[#0B152B]/98 to-[#060D1E]/98 border border-blue-500/30 hover:border-cyan-400/50 shadow-[0_10px_30px_rgba(3,11,26,0.6)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.35)]"
                    : "bg-white border-2 border-blue-100/80 hover:border-blue-400 shadow-[0_10px_30px_rgba(37,99,235,0.06)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.15)]"
                }`}
              >
                {/* Subtle top ambient glow inside the card */}
                <div
                  className={`absolute top-0 inset-x-0 h-24 pointer-events-none ${
                    isDark
                      ? "bg-gradient-to-b from-blue-500/10 to-transparent"
                      : "bg-gradient-to-b from-blue-500/5 to-transparent"
                  }`}
                />

                {/* Doctor Avatar with Elegant Gradient Ring and Online Status */}
                <div className="relative w-28 h-28 rounded-full p-[2.5px] bg-gradient-to-tr from-blue-600 via-cyan-400 to-amber-400/80 shadow-[0_0_20px_rgba(56,189,248,0.25)] mb-4">
                  <div className={`relative w-full h-full rounded-full overflow-hidden ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  {/* Verified Active Badge */}
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] ${
                      isDark ? "border-[#0B152B]" : "border-white"
                    }`}
                    title={isRTL ? "متاح الآن" : "Available Now"}
                  />
                </div>

                {/* Doctor Name */}
                <h3
                  className={`font-bold text-lg mb-1 transition-colors ${
                    isDark
                      ? "text-white group-hover:text-cyan-300"
                      : "text-slate-900 group-hover:text-blue-600"
                  }`}
                >
                  {isRTL ? doctor.nameAr : doctor.name}
                </h3>

                {/* Specialty */}
                <p
                  className={`text-xs sm:text-sm font-medium mb-3 min-h-[2.5rem] flex items-center justify-center ${
                    isDark ? "text-blue-200/75" : "text-slate-600"
                  }`}
                >
                  {isRTL ? doctor.specialtyAr : doctor.specialty}
                </p>

                {/* 5 Gold Stars & Rating */}
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className="w-4 h-4 fill-current drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isDark ? "text-blue-200/60" : "text-slate-500"
                    }`}
                  >
                    ({doctor.rating.toFixed(1)})
                  </span>
                </div>

                {/* Experience & Fee Tags */}
                <div
                  className={`flex items-center justify-center gap-3 w-full mb-5 text-xs border-t pt-3 ${
                    isDark
                      ? "text-blue-200/60 border-blue-900/40"
                      : "text-slate-500 border-slate-100"
                  }`}
                >
                  <span>
                    {doctor.experience} {isRTL ? "سنوات خبرة" : "yrs exp"}
                  </span>
                  <span
                    className={`w-1 h-1 rounded-full ${
                      isDark ? "bg-blue-500/50" : "bg-slate-300"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      isDark ? "text-amber-300/90" : "text-amber-600 font-bold"
                    }`}
                  >
                    {doctor.fee} {isRTL ? "ج.م" : "EGP"}
                  </span>
                </div>

                {/* Book Appointment CTA Button */}
                <Link
                  href={`/${language}/doctors`}
                  className="w-full mt-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-blue-500/25 hover:shadow-[0_0_20px_rgba(59,130,246,0.45)] hover:scale-[1.02] active:scale-[0.98] text-center block"
                >
                  {isRTL ? "احجز موعد الآن" : "Book Appointment"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls: Prev Button, Indicators, Next Button */}
      <div className="flex items-center justify-center gap-3 sm:gap-5 mt-6 sm:mt-8 select-none">
        <button
          onClick={isRTL ? nextSlide : prevSlide}
          aria-label={isRTL ? "الطبيب التالي" : "Previous Doctor"}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer ${
            isDark
              ? "bg-[#0E1F45]/90 hover:bg-blue-900 border border-blue-500/40 text-blue-300 hover:text-white shadow-[0_0_15px_rgba(37,99,235,0.25)]"
              : "bg-white hover:bg-blue-50 border-2 border-blue-100 text-slate-700 hover:text-blue-600 shadow-md shadow-blue-100/50"
          }`}
        >
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Pagination Indicator Dots */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: maxIndex }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? isDark
                    ? "w-7 sm:w-8 h-2 sm:h-2.5 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)]"
                    : "w-7 sm:w-8 h-2 sm:h-2.5 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                  : isDark
                  ? "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-blue-900/60 hover:bg-blue-700/60"
                  : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        <button
          onClick={isRTL ? prevSlide : nextSlide}
          aria-label={isRTL ? "الطبيب السابق" : "Next Doctor"}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer ${
            isDark
              ? "bg-[#0E1F45]/90 hover:bg-blue-900 border border-blue-500/40 text-blue-300 hover:text-white shadow-[0_0_15px_rgba(37,99,235,0.25)]"
              : "bg-white hover:bg-blue-50 border-2 border-blue-100 text-slate-700 hover:text-blue-600 shadow-md shadow-blue-100/50"
          }`}
        >
          <svg
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
