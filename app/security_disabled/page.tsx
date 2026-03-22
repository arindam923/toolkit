import { securityTools } from "@/data/security";
import SecurityNavbar from "@/components/security/SecurityNavbar";
import SecurityPageHeader from "@/components/security/SecurityPageHeader";
import SecurityToolsGrid from "@/components/security/SecurityToolsGrid";
import Footer from "@/components/home/Footer";

export default function SecurityPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="max-w-215 mx-auto px-2 lg:px-0 pt-5 pb-12">
        <SecurityNavbar />
        <SecurityPageHeader />
        <SecurityToolsGrid tools={securityTools} />
        <Footer />
      </div>
    </div>
  );
}
