import React from "react";
import HeroSection from "../components/HeroSection";
import TechTicker from "../components/TechTicker";
import Features from "../components/Features";
import EngineeringLog from "../components/EngineeringLog";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-gray-50 dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden selection:bg-emerald-200 dark:selection:bg-emerald-900 transition-colors duration-300">
      <Navbar />

      <div className="flex-1 w-full flex flex-col">
        <HeroSection />

        <TechTicker />
        <Features />
        <EngineeringLog />
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;