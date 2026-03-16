"use client";

import { useState } from "react";
import { imageTools } from "@/data/images";

import ImagesNavbar from "@/components/images/ImagesNavbar";
import ImagesPageHeader from "@/components/images/ImagesPageHeader";
import ImageToolsGrid from "@/components/images/ImageToolsGrid";
import Footer from "@/components/home/Footer";

export default function ImageToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = imageTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.desc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        <ImagesNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <ImagesPageHeader />

        <ImageToolsGrid tools={filteredTools} />

        <Footer />
      </div>
    </div>
  );
}