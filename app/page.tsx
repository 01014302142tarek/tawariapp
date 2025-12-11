"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

const VerifiedIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? 'text-amber-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// Specialty Icons
const SpecialtyIcons: Record<string, React.ReactNode> = {
  general: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  pediatrics: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  ),
  obgyn: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  internal: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  dermatology: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
    </svg>
  ),
  mental: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
};

// Data
const specialties = [
  { key: "general", name: "General Practice" },
  { key: "pediatrics", name: "Pediatrics" },
  { key: "obgyn", name: "OB/GYN" },
  { key: "internal", name: "Internal Medicine" },
  { key: "dermatology", name: "Dermatology" },
  { key: "mental", name: "Mental Health" },
];

const doctors = [
  {
    name: "Dr. Ahmed Hassan",
    specialty: "Cardiologist",
    experience: "15 years",
    rating: 4.9,
    fee: 300,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Dr. Sara Mahmoud",
    specialty: "Pediatrician",
    experience: "8 years",
    rating: 5.0,
    fee: 250,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Dr. Omar Khaled",
    specialty: "Dermatologist",
    experience: "12 years",
    rating: 4.8,
    fee: 280,
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Dr. Mariam Nabil",
    specialty: "OB/GYN",
    experience: "10 years",
    rating: 4.9,
    fee: 320,
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
  },
];

const testimonials = [
  {
    name: "Nour E.",
    rating: 5,
    text: "Saved me a trip to the hospital late at night. The pediatrician was very professional and calming.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Karim M.",
    rating: 4.5,
    text: "The app is so easy to use. I got my prescription immediately after the call.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-black tracking-tight">
                <span className="text-teal-400">Tawari</span>
                <span className="text-white">App</span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#how-it-works" className="text-gray-300 hover:text-teal-400 transition-colors">
                How It Works
              </Link>
              <Link href="#specialties" className="text-gray-300 hover:text-teal-400 transition-colors">
                Specialties
              </Link>
              <Link href="#doctors" className="text-gray-300 hover:text-teal-400 transition-colors">
                Doctors
              </Link>
              <Link href="#why-us" className="text-gray-300 hover:text-teal-400 transition-colors">
                Why Us
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-gray-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col gap-4">
                <Link href="#how-it-works" className="text-gray-300 hover:text-teal-400 transition-colors">
                  How It Works
                </Link>
                <Link href="#specialties" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Specialties
                </Link>
                <Link href="#doctors" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Doctors
                </Link>
                <Link href="#why-us" className="text-gray-300 hover:text-teal-400 transition-colors">
                  Why Us
                </Link>
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <Link href="/login" className="text-teal-400 font-semibold">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-5 py-2 rounded-full"
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
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 hero-gradient" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <VerifiedIcon />
              <span className="text-teal-400 text-sm font-bold uppercase tracking-wide">Certified Doctors</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
              Consult Your Doctor{" "}
              <span className="text-teal-400">From Home</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl">
              Skip the waiting room. Connect with Egypt&apos;s top specialists instantly via secure video call.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg px-8 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25"
              >
                Get Started
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold text-lg px-8 py-4 rounded-full transition-colors"
              >
                Learn More
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-sm text-gray-300">Licensed Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-300">24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-gray-300">Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-sm font-bold uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Medical care in 3 simple steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: "1",
                title: "Choose Doctor",
                description: "Browse profiles of top-rated specialists and find the right doctor for you.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Book Appointment",
                description: "Pick a time that fits your schedule and make secure payment online.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Start Video Call",
                description: "Connect instantly with your doctor from the comfort of your home.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group flex items-start gap-4 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 transition-all hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.step}. {item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="py-20 lg:py-28 bg-[#1E293B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Our Specialties</h2>
            <Link href="/specialties" className="text-teal-400 text-sm font-bold hover:underline">
              See All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((specialty) => (
              <div
                key={specialty.key}
                className="group flex flex-col items-center justify-center gap-3 bg-[#1E293B] border border-[#334155] rounded-2xl p-6 cursor-pointer transition-all hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/10"
              >
                <div className="text-teal-400 group-hover:scale-110 transition-transform">
                  {SpecialtyIcons[specialty.key]}
                </div>
                <span className="text-sm font-semibold text-center">{specialty.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors */}
      <section id="doctors" className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold">Top Rated Doctors</h2>
            <Link href="/doctors" className="text-teal-400 text-sm font-bold hover:underline hidden sm:block">
              View All Doctors →
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-4 lg:overflow-visible">
            {doctors.map((doctor) => (
              <div
                key={doctor.name}
                className="snap-center shrink-0 w-[260px] lg:w-auto bg-[#1E293B] border border-[#334155] rounded-2xl p-5 flex flex-col items-center text-center relative hover:border-teal-500/50 transition-colors"
              >
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                  <StarIcon />
                  <span className="text-white text-xs font-bold">{doctor.rating}</span>
                </div>

                {/* Avatar */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-teal-500">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <h3 className="text-lg font-bold mb-1">{doctor.name}</h3>
                <p className="text-teal-400 text-sm font-medium mb-1">{doctor.specialty}</p>
                <p className="text-gray-500 text-xs mb-4">{doctor.experience} experience</p>

                <div className="mt-auto w-full">
                  <p className="text-white font-bold mb-3">
                    {doctor.fee} EGP <span className="text-xs font-normal text-gray-500">/ visit</span>
                  </p>
                  <button className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm py-2.5 rounded-full transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link href="/doctors" className="text-teal-400 text-sm font-bold hover:underline block text-center mt-6 sm:hidden">
            View All Doctors →
          </Link>
        </div>
      </section>

      {/* Why TawariApp */}
      <section id="why-us" className="py-20 lg:py-28 bg-[#1E293B] rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Why Choose TawariApp?</h2>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                title: "100% Verified Doctors",
                description: "Every doctor is vetted and licensed by the Egyptian Ministry of Health.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: "Digital Prescriptions",
                description: "Get valid prescriptions sent directly to your phone instantly after consultation.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: "Secure Payments",
                description: "Pay safely via credit card, mobile wallet (Vodafone Cash), or Fawry.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
              {
                title: "Consult From Anywhere",
                description: "Access quality healthcare from Cairo, Alexandria, or anywhere in Egypt.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">What Patients Say</h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
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
                    <p className="font-bold">{testimonial.name}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} filled={star <= Math.floor(testimonial.rating)} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 italic">&ldquo;{testimonial.text}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-teal-500/20 to-[#1E293B] rounded-3xl p-8 md:p-12 text-center border border-teal-500/30">
            <h2 className="text-2xl sm:text-3xl font-black mb-4">Start Your Health Journey Today</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Join thousands of Egyptians who trust TawariApp for quality healthcare.
            </p>
            <Link
              href="/register"
              className="inline-flex bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg px-10 py-4 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-teal-500/25"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1a] border-t border-[#334155] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="text-2xl font-black tracking-tight mb-4 block">
                <span className="text-teal-400">Tawari</span>
                <span className="text-white">App</span>
              </Link>
              <p className="text-gray-500 text-sm max-w-xs">
                Premium healthcare at your fingertips. Anywhere, anytime.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">About Us</Link>
                <Link href="/doctors" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Our Doctors</Link>
                <Link href="/careers" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Careers</Link>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <div className="flex flex-col gap-2">
                <Link href="/faq" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">FAQ</Link>
                <Link href="/contact" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Contact</Link>
                <Link href="/privacy" className="text-gray-400 text-sm hover:text-teal-400 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-[#334155] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Payment Methods */}
            <div className="flex gap-4 text-gray-500">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
              </svg>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
              </svg>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.072 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            <p className="text-xs text-gray-500">© 2025 TawariApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
