"use client";

import { useState, useRef, useEffect, useCallback } from "react";

import { ChevronRight, Download } from "lucide-react";
import ToolLayout from "@/components/shared/ToolLayout";

// Types
export interface ImageFile {
	id: string;
	file: File;
	previewUrl: string;
	processedUrl?: string;
	processedBlob?: Blob;
	status: "uploaded" | "processing" | "processed" | "error";
	error?: string;
	dimensions?: { width: number; height: number };
	processedSize?: number;
}

interface ToolProps {
	title: string;
	description: string;
	icon: string;
	children: (props: { files: ImageFile[] }) => React.ReactNode;
	onProcess?: (file: ImageFile) => Promise<string>;
	onFileRemove?: (id: string) => void;
	onFilesChange?: (files: ImageFile[]) => void;
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
	file: ImageFile;
	onRemove: (id: string) => void;
	onDownload: (file: ImageFile) => void;
}) {
	const [showBefore, setShowBefore] = useState(false);
	const [sliderPos, setSliderPos] = useState(50);
	const cardRef = useRef<HTMLDivElement>(null);
	const isDraggingSlider = useRef(false);

	const handleSliderMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		isDraggingSlider.current = true;
	};

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDraggingSlider.current || !cardRef.current) return;
		const rect = cardRef.current
			.querySelector(".image-container")
			?.getBoundingClientRect();
		if (!rect) return;
		const pos = Math.max(
			0,
			Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
		);
		setSliderPos(pos);
	}, []);

	const handleMouseUp = useCallback(() => {
		isDraggingSlider.current = false;
	}, []);

	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [handleMouseMove, handleMouseUp]);

	const savings =
		file.processedSize && file.file.size
			? Math.round(100 - (file.processedSize / file.file.size) * 100)
			: null;

	const isProcessed = file.status === "processed";
	const isProcessing = file.status === "processing";

	return (
		<div
			ref={cardRef}
			className="relative rounded-[14px] overflow-hidden transition-all bg-background border border-border"
		>
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
						style={{ background: "rgba(255,92,53,0.12)", color: "#FF5C35" }}
					>
						<span className="w-1.5 h-1.5 rounded-full bg-[#FF5C35] inline-block animate-pulse" />
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

			{/* Image area with before/after slider */}
			<div
				className="image-container relative overflow-hidden cursor-crosshair select-none"
				style={{ height: "160px" }}
				onMouseEnter={() => isProcessed && setShowBefore(true)}
				onMouseLeave={() => {
					setShowBefore(false);
					setSliderPos(50);
				}}
			>
				{/* Main image (original or processed) */}
				<img
					src={file.processedUrl || file.previewUrl}
					alt={file.file.name}
					className="absolute inset-0 w-full h-full object-cover"
					draggable={false}
				/>

				{/* Before/after comparison overlay */}
				{isProcessed && showBefore && file.previewUrl && (
					<>
						{/* Original image clipped to left side */}
						<div
							className="absolute inset-0 overflow-hidden"
							style={{ width: `${sliderPos}%` }}
						>
							<img
								src={file.previewUrl}
								alt="Original"
								className="absolute inset-0 w-full h-full object-cover"
								style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}
								draggable={false}
							/>
						</div>

						{/* Divider line */}
						<div
							className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize"
							style={{ left: `calc(${sliderPos}% - 1px)` }}
							onMouseDown={handleSliderMouseDown}
						>
							<div
								className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
								style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
							>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
									<path
										d="M4 2L1 6L4 10M8 2L11 6L8 10"
										stroke="#333"
										strokeWidth="1.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>

						{/* Labels */}
						<div
							className="absolute top-2 pointer-events-none"
							style={{ left: "8px" }}
						>
							<span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">
								BEFORE
							</span>
						</div>
						<div
							className="absolute top-2 pointer-events-none"
							style={{ right: "8px" }}
						>
							<span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-white">
								AFTER
							</span>
						</div>
					</>
				)}

				{/* Processing overlay */}
				{isProcessing && (
					<div
						className="absolute inset-0 flex flex-col items-center justify-center gap-2"
						style={{
							background: "rgba(255,255,255,0.85)",
							backdropFilter: "blur(4px)",
						}}
					>
						<div className="w-8 h-8 rounded-full border-2 border-[#FF5C35] border-t-transparent animate-spin" />
						<span
							className="text-xs font-medium"
							style={{ color: "var(--color-text-primary)" }}
						>
							Processing…
						</span>
					</div>
				)}

				{/* Error overlay */}
				{file.status === "error" && (
					<div
						className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2"
						style={{
							background: "rgba(255,92,53,0.1)",
							backdropFilter: "blur(4px)",
						}}
					>
						<span className="text-lg">⚠️</span>
						<div
							className="text-[10px] text-center font-medium"
							style={{ color: "#FF5C35" }}
						>
							{file.error || "Processing failed"}
						</div>
					</div>
				)}

				{/* Hover hint for before/after */}
				{isProcessed && !showBefore && (
					<div className="absolute bottom-2 right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
						<span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/50 text-white">
							Hover to compare
						</span>
					</div>
				)}
			</div>

			{/* File info */}
			<div className="p-3">
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
											savings && savings > 0
												? "#16a34a"
												: "var(--color-text-secondary)",
									}}
								>
									{formatBytes(file.processedSize)}
								</span>
							</>
						)}
					</div>
					{savings !== null && (
						<span
							className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
							style={{
								background:
									savings > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
								color: savings > 0 ? "#16a34a" : "#dc2626",
							}}
						>
							{savings > 0 ? `−${savings}%` : `+${Math.abs(savings)}%`}
						</span>
					)}
				</div>

				{/* Dimensions */}
				{file.dimensions && (
					<div
						className="text-[10px] mb-2"
						style={{ color: "var(--color-text-secondary)" }}
					>
						{file.dimensions.width} × {file.dimensions.height}px
					</div>
				)}

				{/* Download */}
				{isProcessed && (
					<button
						onClick={() => onDownload(file)}
						className="w-full py-1.5 text-xs rounded-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-[0.98]"
						style={{
							background: "linear-gradient(135deg, #FF5C35, #ff7a54)",
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

export default function BaseTool({
	title,
	description,
	icon,
	children,
	onProcess,
	onFileRemove,
	onFilesChange,
}: ToolProps) {
	const [files, setFiles] = useState<ImageFile[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Notify parent of file list changes safely (after render, not during)
	useEffect(() => {
		if (onFilesChange) onFilesChange(files);
	}, [files, onFilesChange]);

	// Get image dimensions
	const getImageDimensions = (
		url: string,
	): Promise<{ width: number; height: number }> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () =>
				resolve({ width: img.naturalWidth, height: img.naturalHeight });
			img.onerror = () => resolve({ width: 0, height: 0 });
			img.src = url;
		});
	};

	// Handle file upload
	const handleFileUpload = async (selectedFiles: File[]) => {
		const newFiles: ImageFile[] = selectedFiles.map((file) => ({
			id: Math.random().toString(36).substring(2, 15),
			file,
			previewUrl: URL.createObjectURL(file),
			status: "uploaded",
		}));
		setFiles((prev) => [...prev, ...newFiles]);

		// Load dimensions asynchronously
		for (const f of newFiles) {
			const dims = await getImageDimensions(f.previewUrl);
			if (dims.width > 0) {
				setFiles((prev) =>
					prev.map((existing) =>
						existing.id === f.id ? { ...existing, dimensions: dims } : existing,
					),
				);
			}
		}
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
	const handleDownload = (file: ImageFile) => {
		if (!file.processedUrl) return;
		const ext = file.processedUrl.startsWith("data:image/webp")
			? "webp"
			: "jpg";
		const baseName = file.file.name.replace(/\.[^.]+$/, "");
		const link = document.createElement("a");
		link.href = file.processedUrl;
		link.download = `${baseName}_processed.${ext}`;
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
			category="Image"
			id="image-tool"
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
								isProcessing || files.some((f) => f.status === "processing")
							}
							className="w-full py-4 bg-foreground text-background mono-label font-bold text-sm hover:bg-brand-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Process {totalFiles > 1 ? `${totalFiles} Images` : "Image"}{" "}
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
				className={`bg-muted/30 border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-12 text-center group transition-all cursor-pointer hover:bg-muted/50`}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					onChange={handleFileInputChange}
					className="hidden"
				/>
				<div className="w-16 h-16 rounded-full border border-border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
					<Download className="w-6 h-6 text-muted-foreground" />
				</div>
				<div className="mono-label text-lg mb-2">
					{isDragOver ? "Drop images here" : "Drop images here to process"}
				</div>
				<div className="mono-label text-xs opacity-50">
					Supports JPG, PNG, WEBP, AVIF up to 25MB
				</div>
			</div>

			{files.length > 0 && (
				<div className="mt-8 space-y-4">
					<div className="mono-label border-b border-border pb-2 flex justify-between items-center">
						<span>Uploaded Images</span>
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
