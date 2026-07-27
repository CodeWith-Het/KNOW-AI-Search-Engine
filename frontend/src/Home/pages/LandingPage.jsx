import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import TechTicker from "../components/TechTicker";
import Features from "../components/Features";
import EngineeringLog from "../components/EngineeringLog";
import Footer from "../components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden selection:bg-emerald-500/30 selection:text-white">
      <Navbar />
      <HeroSection />
      <TechTicker />
      <Features />
      <EngineeringLog />
      <Footer />
    </div>
  );
};

export default LandingPage;
