"use client";

import { useState } from "react";
import { fileTools } from "@/data/files";

import FilesNavbar from "@/components/files/FilesNavbar";
import FilesPageHeader from "@/components/files/FilesPageHeader";
import FilesToolsGrid from "@/components/files/FilesToolsGrid";
import Footer from "@/components/home/Footer";

export default function FileToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = fileTools.filter(
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
        <FilesNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <FilesPageHeader />

        <FilesToolsGrid tools={filteredTools} />

        <Footer />
      </div>
    </div>
  );
}
