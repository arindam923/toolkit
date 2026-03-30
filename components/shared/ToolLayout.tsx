"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export interface ToolLayoutProps {
	title: string;
	description: string;
	icon: ReactNode;
	category?: string;
	id?: string;
	parameters: ReactNode;
	actions: ReactNode;
	children: ReactNode;
}

export default function ToolLayout({
	title,
	description,
	icon,
	category = "Utility",
	id = "tool",
	parameters,
	actions,
	children,
}: ToolLayoutProps) {
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="min-h-screen bg-background text-foreground"
		>
			<div className="border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={() => router.back()}
						className="p-2 hover:bg-muted transition-colors border border-border"
					>
						<ArrowRight className="w-4 h-4 rotate-180" />
					</button>
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-bold">
							{icon}
						</div>
						<span className="font-display font-bold tracking-tight uppercase">
							{title}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div className="mono-label hidden md:block">
						Session ID: <span className="text-brand-accent">0x7F2A...</span>
					</div>
					<button
						type="button"
						className="mono-label px-4 py-1.5 bg-foreground text-background text-xs font-bold"
					>
						Deploy Tool
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 min-h-[calc(100vh-65px)]">
				<div className="lg:col-span-2 p-8 md:p-16 border-r border-border flex flex-col gap-12 bg-grid">
					<div className="space-y-4">
						<div className="mono-label text-brand-accent">
							{category} / {id}
						</div>
						<h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter leading-none uppercase">
							{title.split(" ")[0]}
							<br />
							<span className="text-muted-foreground/30">
								{title.split(" ").slice(1).join(" ") || "UTILITY"}
							</span>
						</h2>
						<p className="text-muted-foreground max-w-xl text-sm uppercase tracking-widest leading-relaxed">
							{description} This technical module is optimized for
							high-throughput processing and secure data handling.
						</p>
					</div>

					<div className="flex-1 flex flex-col">{children}</div>
				</div>

				<div className="bg-muted/10 p-8 space-y-8">
					<div className="space-y-4">
						<div className="mono-label border-b border-border pb-2">
							Parameters
						</div>
						{parameters}
					</div>

					<div className="space-y-4">
						<div className="mono-label border-b border-border pb-2">
							MCP Configuration
						</div>
						<div className="bg-background border border-border p-4 font-mono text-[10px] leading-tight text-muted-foreground">
							{"// Agent Access Key"}
							<br />
							<span className="text-brand-accent">TK_AUTH_0x992...</span>
							<br />
							<br />
							{"// Endpoint"}
							<br />
							https://api.toolkit.io/v1/{id}
						</div>
					</div>

					<div className="pt-8 flex flex-col gap-3">{actions}</div>
				</div>
			</div>
		</motion.div>
	);
}
