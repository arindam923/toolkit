"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, Download } from "lucide-react";
import ToolLayout from "@/components/shared/ToolLayout";

// Types
export interface PdfFile {
	id: string;
	file: File;
	previewUrl?: string;
	processedUrl?: string;
	processedBlob?: Blob;
	status: "uploaded" | "processing" | "processed" | "error";
	error?: string;
	pageCount?: number;
	processedSize?: number;
}

interface ToolProps {
	title: string;
	description: string;
	icon: string;
	children: (props: { files: PdfFile[] }) => React.ReactNode;
	onProcess?: (file: PdfFile) => Promise<string>;
	onFileRemove?: (id: string) => void;
	onFilesChange?: (files: PdfFile[]) => void;
	disabled?: boolean;
	downloadExtension?: string;
	accept?: string; // File types to accept in the file input
	fileTypeLabel?: string; // Label for file type (e.g., "PDF", "Image")
}

function formatBytes(bytes: number): string {
	if (bytes < 1024) return bytes + " B";
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
	return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function FileCard({
	file,
	onRemove,
	onDownload,
}: {
	file: PdfFile;
	onRemove: (id: string) => void;
	onDownload: (file: PdfFile) => void;
}) {
	const isProcessed = file.status === "processed";
	const isProcessing = file.status === "processing";

	return (
		<div className="relative rounded-[14px] overflow-hidden transition-all bg-background border border-border">
			{/* Status badge */}
			<div className="absolute top-2.5 left-2.5 z-10">
				{isProcessed && (
					<span
						className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
						style={{ background: "rgba(34,197,94,0.15)", color: "#16a34a" }}
					>
						<span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
						Done
					</span>
				)}
				{isProcessing && (
					<span
						className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
						style={{ background: "rgba(124,92,53,0.12)", color: "#7C5CFF" }}
					>
						<span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] inline-block animate-pulse" />
						Processing
					</span>
				)}
			</div>

			{/* Remove button */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					onRemove(file.id);
				}}
				className="absolute top-2.5 right-2.5 z-10 w-6 h-6 flex items-center justify-center rounded-full text-xs transition-all hover:scale-110"
				style={{
					background: "rgba(0,0,0,0.5)",
					color: "#fff",
					backdropFilter: "blur(4px)",
				}}
			>
				×
			</button>

			{/* File info */}
			<div className="p-3 pt-8">
				<div
					className="text-xs font-medium truncate mb-1.5"
					style={{ color: "var(--color-text-primary)" }}
					title={file.file.name}
				>
					{file.file.name}
				</div>

				{/* Size info */}
				<div className="flex items-center justify-between mb-2">
					<div
						className="text-[10px]"
						style={{ color: "var(--color-text-secondary)" }}
					>
						{formatBytes(file.file.size)}
						{file.processedSize && (
							<>
								{" → "}
								<span
									style={{
										color:
											file.processedSize < file.file.size
												? "#16a34a"
												: "var(--color-text-secondary)",
									}}
								>
									{formatBytes(file.processedSize)}
								</span>
							</>
						)}
					</div>
					{file.processedSize && (
						<span
							className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
							style={{
								background:
									file.processedSize < file.file.size
										? "rgba(34,197,94,0.12)"
										: "rgba(239,68,68,0.1)",
								color:
									file.processedSize < file.file.size ? "#16a34a" : "#dc2626",
							}}
						>
							{Math.round(100 - (file.processedSize / file.file.size) * 100)}%
						</span>
					)}
				</div>

				{/* Page count */}
				{file.pageCount && (
					<div
						className="text-[10px] mb-2"
						style={{ color: "var(--color-text-secondary)" }}
					>
						{file.pageCount} page{file.pageCount > 1 ? "s" : ""}
					</div>
				)}

				{/* Download */}
				{isProcessed && (
					<button
						onClick={() => onDownload(file)}
						className="w-full py-1.5 text-xs rounded-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
						style={{
							background: "linear-gradient(135deg, #7C5CFF, #9b7cff)",
							color: "#fff",
						}}
					>
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
							<path
								d="M6 1v7M3 5l3 3 3-3M1 10h10"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						Download
					</button>
				)}
			</div>
		</div>
	);
}

export default function BasePdfTool({
	title,
	description,
	icon,
	children,
	onProcess,
	onFileRemove,
	onFilesChange,
	disabled = false,
	downloadExtension = "pdf",
	accept = "application/pdf",
	fileTypeLabel = "PDF",
}: ToolProps) {
	const [files, setFiles] = useState<PdfFile[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Notify parent of file list changes safely (after render, not during)
	useEffect(() => {
		if (onFilesChange) onFilesChange(files);
	}, [files, onFilesChange]);

	// Handle file upload
	const handleFileUpload = async (selectedFiles: File[]) => {
		const newFiles: PdfFile[] = selectedFiles.map((file) => ({
			id: Math.random().toString(36).substring(2, 15),
			file,
			status: "uploaded",
		}));
		setFiles((prev) => [...prev, ...newFiles]);
	};

	// Handle drag and drop
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => setIsDragOver(false);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		if (e.dataTransfer.files.length > 0) {
			handleFileUpload(Array.from(e.dataTransfer.files));
		}
	};

	// Handle file input change
	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			handleFileUpload(Array.from(e.target.files));
		}
	};

	// Remove file
	const handleRemoveFile = (id: string) => {
		const fileToRemove = files.find((f) => f.id === id);
		if (fileToRemove?.previewUrl) {
			URL.revokeObjectURL(fileToRemove.previewUrl);
		}
		setFiles((prev) => prev.filter((f) => f.id !== id));
		if (onFileRemove) {
			onFileRemove(id);
		}
	};

	// Process all files
	const handleProcess = async () => {
		if (!onProcess) return;

		setIsProcessing(true);
		const updatedFiles = [...files];

		for (let i = 0; i < updatedFiles.length; i++) {
			if (updatedFiles[i].status === "processed") continue;

			updatedFiles[i] = { ...updatedFiles[i], status: "processing" };
			setFiles([...updatedFiles]);

			try {
				const processedDataUrl = await onProcess(updatedFiles[i]);
				// Estimate processed size from base64
				const base64Data = processedDataUrl.split(",")[1] || "";
				const processedSize = Math.round((base64Data.length * 3) / 4);

				updatedFiles[i] = {
					...updatedFiles[i],
					processedUrl: processedDataUrl,
					status: "processed",
					processedSize,
				};
			} catch (error) {
				updatedFiles[i] = {
					...updatedFiles[i],
					status: "error",
					error: error instanceof Error ? error.message : "Processing failed",
				};
			}

			setFiles([...updatedFiles]);
		}

		setIsProcessing(false);
	};

	// Download single processed file
	const handleDownload = (file: PdfFile) => {
		if (!file.processedUrl) return;
		const baseName = file.file.name.replace(/\.[^.]+$/, "");
		const link = document.createElement("a");
		link.href = file.processedUrl;
		link.download = `${baseName}_processed.${downloadExtension}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// Download all processed files
	const handleDownloadAll = () => {
		const processed = files.filter(
			(f) => f.processedUrl && f.status === "processed",
		);
		processed.forEach((file, i) => {
			setTimeout(() => handleDownload(file), i * 200);
		});
	};

	const processedCount = files.filter((f) => f.status === "processed").length;
	const totalFiles = files.length;

	return (
		<ToolLayout
			title={title}
			description={description}
			icon={<span>{icon}</span>}
			category="PDF"
			id="pdf-tool"
			parameters={
				files.length > 0 ? (
					children({ files })
				) : (
					<div className="text-xs text-muted-foreground font-mono uppercase tracking-widest leading-relaxed">
						Upload files to view parameters.
					</div>
				)
			}
			actions={
				files.length > 0 && (
					<>
						<button
							onClick={handleProcess}
							disabled={
								isProcessing ||
								files.some((f) => f.status === "processing") ||
								disabled
							}
							className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Process{" "}
							{totalFiles > 1
								? `${totalFiles} ${fileTypeLabel}s`
								: fileTypeLabel}{" "}
							<ChevronRight className="w-4 h-4" />
						</button>
						{processedCount >= 2 && (
							<button
								onClick={handleDownloadAll}
								className="w-full py-3 bg-transparent text-foreground border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
							>
								Download All
							</button>
						)}
						<button
							onClick={() => setFiles([])}
							className="w-full py-3 bg-transparent text-muted-foreground border border-border mono-label font-bold text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2"
						>
							Clear All
						</button>
					</>
				)
			}
		>
			<div
				className={`bg-muted/30 border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-12 text-center group transition-all ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/50"}`}
				onDragOver={disabled ? undefined : handleDragOver}
				onDragLeave={disabled ? undefined : handleDragLeave}
				onDrop={disabled ? undefined : handleDrop}
				onClick={disabled ? undefined : () => fileInputRef.current?.click()}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept={accept}
					multiple
					disabled={disabled}
					onChange={handleFileInputChange}
					className="hidden"
				/>
				<div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
					<Download className="w-6 h-6 text-muted-foreground" />
				</div>
				<div className="mono-label text-lg mb-2">
					{isDragOver
						? `Drop ${fileTypeLabel}s here`
						: `Drop ${fileTypeLabel}s here to process`}
				</div>
				<div className="mono-label text-xs opacity-50">
					Supports {fileTypeLabel} files up to 25MB
				</div>
			</div>

			{files.length > 0 && (
				<div className="mt-8 space-y-4">
					<div className="mono-label border-b border-border pb-2 flex justify-between items-center">
						<span>Uploaded {fileTypeLabel}s</span>
						{processedCount > 0 && (
							<span className="text-emerald-500">
								{processedCount}/{totalFiles} processed
							</span>
						)}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{files.map((file) => (
							<div key={file.id} className="group">
								<FileCard
									file={file}
									onRemove={handleRemoveFile}
									onDownload={handleDownload}
								/>
							</div>
						))}
					</div>
				</div>
			)}
		</ToolLayout>
	);
}
