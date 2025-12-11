"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Icons as SVG components for better performance
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// Specialty Icons
const SpecialtyIcons: Record<string, React.ReactNode> = {
  general: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  pediatrics: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  ),
  obgyn: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  internal: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  dermatology: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
    </svg>
  ),
  mental: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  cardiology: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  orthopedics: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
};

// Data
const specialties = [
  { key: "general", name: "General Practice", arabic: "طب عام" },
  { key: "pediatrics", name: "Pediatrics", arabic: "طب أطفال" },
  { key: "obgyn", name: "OB/GYN", arabic: "نساء وتوليد" },
  { key: "internal", name: "Internal Medicine", arabic: "باطنة" },
  { key: "dermatology", name: "Dermatology", arabic: "جلدية" },
  { key: "mental", name: "Mental Health", arabic: "نفسية" },
  { key: "cardiology", name: "Cardiology", arabic: "قلب" },
  { key: "orthopedics", name: "Orthopedics", arabic: "عظام" },
];

const doctors = [
  {
    name: "Dr. Ahmed Hassan",
    specialty: "Cardiologist",
    experience: "15 years",
    rating: 4.9,
    reviews: 234,
    fee: 300,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
    available: true,
  },
  {
    name: "Dr. Sara Mahmoud",
    specialty: "Pediatrician",
    experience: "8 years",
    rating: 5.0,
    reviews: 189,
    fee: 250,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
    available: true,
  },
  {
    name: "Dr. Omar Khaled",
    specialty: "Dermatologist",
    experience: "12 years",
    rating: 4.8,
    reviews: 156,
    fee: 280,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
    available: false,
  },
  {
    name: "Dr. Mariam Nabil",
    specialty: "OB/GYN",
    experience: "10 years",
    rating: 4.9,
    reviews: 312,
    fee: 320,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
    available: true,
  },
];

const testimonials = [
  {
    name: "Nour El-Din A.",
    location: "Cairo",
    rating: 5,
    text: "Saved me a trip to the hospital late at night. The pediatrician was very professional and calming. My daughter felt better within hours.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Karim M.",
    location: "Alexandria",
    rating: 5,
    text: "The app is so easy to use. I got my prescription immediately after the call. No need to travel or wait in crowded clinics anymore.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Fatma H.",
    location: "Giza",
    rating: 5,
    text: "As a working mother, TawariApp is a lifesaver. I can consult a doctor during my lunch break without leaving the office.",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face",
  },
];

const stats = [
  { number: "500+", label: "Verified Doctors", icon: "👨‍⚕️" },
  { number: "10,000+", label: "Happy Patients", icon: "😊" },
  { number: "25,000+", label: "Consultations", icon: "📹" },
  { number: "4.9/5", label: "Average Rating", icon: "⭐" },
];

// Animated counter component
function AnimatedCounter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(target.replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
    }
    return num.toString();
  };

  return <span>{target.includes('+') ? `${formatNumber(count)}+` : target.includes('/') ? target : formatNumber(count)}{suffix}</span>;
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">
                  <span className="text-teal-400">Tawari</span>
                  <span className="text-white">App</span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <Link href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                How It Works
              </Link>
              <Link href="#specialties" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Specialties
              </Link>
              <Link href="#doctors" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                Doctors
              </Link>
              <Link href="#for-doctors" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                For Doctors
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className="text-gray-300 hover:text-white font-medium text-sm px-4 py-2 transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-semibold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40"
              >
                Get Started Free
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10 animate-fade-in">
              <div className="flex flex-col gap-4">
                <Link href="#how-it-works" className="text-gray-300 hover:text-teal-400 transition-colors py-2">
                  How It Works
                </Link>
                <Link href="#specialties" className="text-gray-300 hover:text-teal-400 transition-colors py-2">
                  Specialties
                </Link>
                <Link href="#doctors" className="text-gray-300 hover:text-teal-400 transition-colors py-2">
                  Doctors
                </Link>
                <Link href="#for-doctors" className="text-gray-300 hover:text-teal-400 transition-colors py-2">
                  For Doctors
                </Link>
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Link href="/login" className="text-gray-300 font-medium py-2">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2 rounded-full flex-1 text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-[#0F172A] to-[#0F172A]" />
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-full mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-teal-400 text-sm font-medium">Doctors Available 24/7</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
                Quality Healthcare,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-300">
                  Right From Home
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                Connect with Egypt&apos;s top licensed doctors for video consultations. Get prescriptions, medical advice, and care without leaving your home.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold text-lg px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-teal-500/30"
                >
                  Book a Consultation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors"
                >
                  <PlayIcon />
                  See How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {[
                  { icon: "✓", text: "Licensed Doctors" },
                  { icon: "✓", text: "Secure Video Calls" },
                  { icon: "✓", text: "Digital Prescriptions" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-400">
                    <CheckCircleIcon />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Image/Visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-transparent rounded-3xl" />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/20 rounded-2xl blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-500/20 rounded-2xl blur-xl" />

                {/* Main image container */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10">
                  <Image
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=800&fit=crop"
                    alt="Doctor consultation"
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                </div>

                {/* Floating cards */}
                <div className="absolute -left-8 top-1/4 bg-[#1E293B] border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Verified Doctors</p>
                      <p className="text-gray-400 text-xs">Ministry of Health</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-1/4 bg-[#1E293B] border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">4.9/5 Rating</p>
                      <p className="text-gray-400 text-xs">10,000+ reviews</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                  <AnimatedCounter target={stat.number} />
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
              Get Care in <span className="text-teal-400">3 Simple Steps</span>
            </h2>
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
              No waiting rooms, no traffic, no hassle. Get the medical care you need from anywhere in Egypt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Choose Your Doctor",
                description: "Browse our verified doctors by specialty, ratings, and availability. Find the perfect match for your needs.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                color: "from-teal-500 to-teal-600",
              },
              {
                step: "02",
                title: "Book & Pay Securely",
                description: "Select a convenient time slot and pay securely with cards, Vodafone Cash, or mobile wallets.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                color: "from-amber-500 to-amber-600",
              },
              {
                step: "03",
                title: "Start Your Consultation",
                description: "Join the video call at your scheduled time. Get diagnosis, advice, and prescriptions instantly.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
                color: "from-purple-500 to-purple-600",
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="group relative bg-[#1E293B]/50 border border-white/5 rounded-3xl p-8 transition-all hover:border-white/20 hover:bg-[#1E293B]"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-8 bg-[#0F172A] px-3 py-1 rounded-full border border-white/10">
                  <span className="text-gray-500 text-sm font-mono">{item.step}</span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>

                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>

                {/* Connector line (hidden on mobile and last item) */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t border-dashed border-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="py-20 lg:py-28 bg-gradient-to-b from-[#0F172A] to-[#1E293B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">Medical Specialties</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Find the Right Specialist</h2>
            </div>
            <Link href="/doctors" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors flex items-center gap-1">
              View All Specialties
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specialties.map((specialty) => (
              <Link
                key={specialty.key}
                href={`/doctors?specialty=${specialty.key}`}
                className="group flex flex-col items-center justify-center gap-3 bg-[#1E293B]/50 border border-white/5 rounded-2xl p-6 cursor-pointer transition-all hover:border-teal-500/50 hover:bg-[#1E293B] hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-white transition-all group-hover:scale-110">
                  {SpecialtyIcons[specialty.key]}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-white">{specialty.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{specialty.arabic}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section id="doctors" className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">Top Rated</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Meet Our Best Doctors</h2>
            </div>
            <Link href="/doctors" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors flex items-center gap-1">
              View All Doctors
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.name}
                className="group bg-[#1E293B]/50 border border-white/5 rounded-2xl p-5 transition-all hover:border-teal-500/30 hover:bg-[#1E293B]"
              >
                {/* Avatar & Status */}
                <div className="relative mb-4">
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-teal-500/50 group-hover:border-teal-500 transition-colors">
                    <Image
                      src={doctor.image}
                      alt={doctor.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {doctor.available && (
                    <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Available
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="font-bold text-white mb-1">{doctor.name}</h3>
                  <p className="text-teal-400 text-sm font-medium mb-1">{doctor.specialty}</p>
                  <p className="text-gray-500 text-xs mb-3">{doctor.experience} experience</p>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= Math.floor(doctor.rating)} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">({doctor.reviews})</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-white font-bold mb-3">
                      {doctor.fee} EGP <span className="text-xs font-normal text-gray-500">/ session</span>
                    </p>
                    <button className="w-full bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white font-semibold text-sm py-2.5 rounded-xl transition-all">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TawariApp */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-[#0F172A] to-[#1E293B]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
              Healthcare Made <span className="text-teal-400">Simple & Safe</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏥",
                title: "Verified Doctors",
                description: "All doctors are licensed by the Egyptian Medical Syndicate and verified by our team.",
              },
              {
                icon: "📱",
                title: "Digital Prescriptions",
                description: "Get valid prescriptions sent directly to your phone, ready to use at any pharmacy.",
              },
              {
                icon: "💳",
                title: "Secure Payments",
                description: "Pay with Visa, Mastercard, Vodafone Cash, or any mobile wallet. 100% secure.",
              },
              {
                icon: "🌍",
                title: "Anywhere in Egypt",
                description: "Access quality healthcare from Cairo, Alexandria, or any governorate. No travel needed.",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-[#1E293B]/30 border border-white/5 rounded-2xl p-6 text-center hover:border-white/10 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-400 text-sm font-bold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">What Our Patients Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-[#1E293B]/80 to-[#1E293B]/40 border border-white/5 rounded-2xl p-6"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon key={star} filled={star <= testimonial.rating} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 leading-relaxed mb-6">&ldquo;{testimonial.text}&rdquo;</p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Doctors CTA */}
      <section id="for-doctors" className="py-20 lg:py-28 bg-gradient-to-br from-[#1E293B] to-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-amber-400 text-sm font-bold uppercase tracking-wider">For Doctors</span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3 mb-6">
                Grow Your Practice <span className="text-amber-400">Online</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Join TawariApp and reach thousands of patients across Egypt. Set your own schedule, fees, and work from anywhere.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Reach patients across all of Egypt",
                  "Set your own availability and consultation fees",
                  "Secure, compliant video consultations",
                  "Digital prescriptions with your signature",
                  "Weekly payouts directly to your account",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register/doctor"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-amber-500/25"
              >
                Register as a Doctor
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Stats for doctors */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { number: "50+", label: "Verified Doctors", sublabel: "and growing" },
                { number: "25K+", label: "Consultations", sublabel: "delivered" },
                { number: "4.9", label: "Average Rating", sublabel: "from patients" },
                { number: "EGP 50K+", label: "Monthly Earnings", sublabel: "top performers" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#0F172A]/50 border border-white/5 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-black text-amber-400 mb-1">{stat.number}</div>
                  <div className="text-white font-medium text-sm">{stat.label}</div>
                  <div className="text-gray-500 text-xs">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-8 md:p-12 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of Egyptians who trust TawariApp for convenient, quality healthcare.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-teal-700 font-bold text-lg px-10 py-4 rounded-full transition-all transform hover:scale-105 shadow-xl"
              >
                Get Started — It&apos;s Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <p className="text-teal-200 text-sm mt-4">No credit card required • Book your first consultation today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] border-t border-white/5 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">
                  <span className="text-teal-400">Tawari</span>
                  <span className="text-white">App</span>
                </span>
              </Link>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                Premium healthcare at your fingertips. Consult with Egypt&apos;s best doctors from anywhere, anytime.
              </p>
              {/* Social Links */}
              <div className="flex gap-3">
                {['facebook', 'twitter', 'instagram'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-colors">
                    <span className="sr-only">{social}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">For Patients</h4>
              <div className="flex flex-col gap-3">
                <Link href="/doctors" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Find Doctors</Link>
                <Link href="/specialties" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Specialties</Link>
                <Link href="/how-it-works" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">How It Works</Link>
                <Link href="/faq" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">FAQ</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">For Doctors</h4>
              <div className="flex flex-col gap-3">
                <Link href="/register/doctor" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Join as Doctor</Link>
                <Link href="/doctor-faq" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Doctor FAQ</Link>
                <Link href="/pricing" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Pricing</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <div className="flex flex-col gap-3">
                <Link href="/about" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">About Us</Link>
                <Link href="/contact" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Contact</Link>
                <Link href="/privacy" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/5 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Payment Methods */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">Payment Methods:</span>
                <div className="flex gap-2">
                  {/* Visa */}
                  <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-gray-400">VISA</div>
                  {/* Mastercard */}
                  <div className="w-10 h-6 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-gray-400">MC</div>
                  {/* Vodafone Cash */}
                  <div className="w-10 h-6 bg-red-500/20 rounded flex items-center justify-center text-xs font-bold text-red-400">VC</div>
                </div>
              </div>

              <p className="text-xs text-gray-500">© 2025 TawariApp. All rights reserved. Made with ❤️ in Egypt.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
