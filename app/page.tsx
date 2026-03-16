"use client";

import { useState } from "react";

import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import SearchResults from "@/components/home/SearchResults";
import CategoriesSection from "@/components/home/CategoriesSection";
import ToolsSpotlight from "@/components/home/ToolsSpotlight";
import UserFlow from "@/components/home/UserFlow";
import KeyFeatures from "@/components/home/KeyFeatures";
import PricingSection from "@/components/home/PricingSection";
import Footer from "@/components/home/Footer";

export default function Home() {
  const [activeTab, setActiveTab] = useState("All Tools");
  const [searchQuery, setSearchQuery] = useState("");

  const showSections = !searchQuery;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <HeroSection />

        {searchQuery && <SearchResults query={searchQuery} />}

        {showSections && (
          <>
            <CategoriesSection />
            <ToolsSpotlight />
            <UserFlow />
            <KeyFeatures />
            <PricingSection />
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
