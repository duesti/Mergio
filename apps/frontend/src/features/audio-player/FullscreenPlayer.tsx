import {
	AudioWaveform,
	ChevronDown,
	Heart,
	Pause,
	Play,
	Repeat,
	Shuffle,
	SkipBack,
	SkipForward,
	ThumbsDown,
	Volume1,
	Volume2,
	VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePlayerStore } from "./audio-player.store";

function formatTime(sec: number) {
	if (!sec || Number.isNaN(sec)) return "0:00";
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

type FullscreenPlayerProps = {
	open: boolean;
	onClose: () => void;
};

export function FullscreenPlayer({ open, onClose }: FullscreenPlayerProps) {
	const isPlaying = usePlayerStore((s) => s.isPlaying);
	const currentTime = usePlayerStore((s) => s.currentTime);
	const duration = usePlayerStore((s) => s.duration);
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const next = usePlayerStore((s) => s.next);
	const prev = usePlayerStore((s) => s.prev);
	const currentTrack = usePlayerStore((s) => s.currentTrack());
	const seek = usePlayerStore((s) => s.seek);

	const volume = usePlayerStore((s) => s.volume);
	const isMuted = usePlayerStore((s) => s.isMuted);
	const setVolume = usePlayerStore((s) => s.setVolume);

	// Local, presentation-only UI state — not wired to the store.
	const [isLiked, setIsLiked] = useState(false);
	const [isDisliked, setIsDisliked] = useState(false);
	const [isShuffled, setIsShuffled] = useState(false);
	const [isRepeating, setIsRepeating] = useState(false);

	const progressTrackRef = useRef<HTMLDivElement>(null);
	const draggingProgressRef = useRef(false);
	const [scrubTime, setScrubTime] = useState<number | null>(null);

	const volumeTrackRef = useRef<HTMLDivElement>(null);
	const draggingVolumeRef = useRef(false);

	// Close on Escape.
	useEffect(() => {
		if (!open) return;
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, onClose]);

	// Lock background scroll while open.
	useEffect(() => {
		if (!open) return;
		const original = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = original;
		};
	}, [open]);

	if (!currentTrack) return null;

	const displayTime = scrubTime ?? currentTime;
	const progressPct = duration ? (displayTime / duration) * 100 : 0;
	const volumePct = isMuted ? 0 : volume * 100;

	function getTimeFromClientX(clientX: number) {
		const el = progressTrackRef.current;
		if (!el || !duration) return 0;
		const rect = el.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return ratio * duration;
	}

	function handleProgressPointerDown(e: React.PointerEvent<HTMLDivElement>) {
		draggingProgressRef.current = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		setScrubTime(getTimeFromClientX(e.clientX));
	}

	function handleProgressPointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (draggingProgressRef.current) {
			setScrubTime(getTimeFromClientX(e.clientX));
		}
	}

	function handleProgressPointerUp(e: React.PointerEvent<HTMLDivElement>) {
		if (draggingProgressRef.current) {
			seek(getTimeFromClientX(e.clientX));
		}
		draggingProgressRef.current = false;
		setScrubTime(null);
	}

	function setVolumeFromClientX(clientX: number) {
		const el = volumeTrackRef.current;
		if (!el) return;
		const rect = el.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		setVolume(ratio);
	}

	function handleVolumePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		draggingVolumeRef.current = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		setVolumeFromClientX(e.clientX);
	}

	function handleVolumePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (draggingVolumeRef.current) {
			setVolumeFromClientX(e.clientX);
		}
	}

	function handleVolumePointerUp() {
		draggingVolumeRef.current = false;
	}

	const cover = (currentTrack as { cover?: string }).cover;

	return createPortal(
		<AnimatePresence>
			{open && (
				<motion.div
					className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden bg-zinc-950 text-white"
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 24 }}
					transition={{ duration: 0.25, ease: "easeOut" }}
				>
					{/* Ambient blurred backdrop derived from the cover art */}
					<div className="absolute inset-0 -z-10">
						{cover ? (
							<div
								className="absolute inset-0 scale-110 bg-cover bg-center opacity-60 blur-3xl"
								style={{ backgroundImage: `url(${cover})` }}
							/>
						) : (
							<div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-950 to-black" />
						)}
						<div className="absolute inset-0 bg-black/50" />
					</div>

					{/* Top bar */}
					<div className="relative flex w-full items-center justify-between px-6 pt-6">
						<button
							type="button"
							aria-label="Свернуть плеер"
							className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95"
							onClick={onClose}
						>
							<ChevronDown className="size-5" />
						</button>
						<p className="text-xs font-medium uppercase tracking-widest text-white/50">
							Сейчас играет
						</p>
						<div className="size-11" />
					</div>

					{/* Cover art */}
					<div className="relative flex w-full flex-1 items-center justify-center px-6">
						<div className="aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
							{cover ? (
								<img
									src={cover}
									alt={`${currentTrack.title} — ${currentTrack.artist}`}
									className="size-full object-cover"
								/>
							) : (
								<div className="flex size-full items-center justify-center bg-black">
									<AudioWaveform className="size-16 opacity-40" />
								</div>
							)}
						</div>
					</div>

					{/* Track info + like/dislike */}
					<div className="relative flex w-full max-w-[420px] items-center justify-between px-6">
						<div className="min-w-0">
							<div className="truncate text-xl font-semibold">{currentTrack.title}</div>
							<div className="truncate text-white/60">{currentTrack.artist}</div>
						</div>
						<div className="flex shrink-0 items-center gap-3 pl-4">
							<button
								type="button"
								aria-label="Нравится"
								aria-pressed={isLiked}
								className="cursor-pointer transition hover:scale-110 active:scale-95"
								onClick={() => {
									setIsLiked((v) => !v);
									if (isDisliked) setIsDisliked(false);
								}}
							>
								<Heart
									className="size-6"
									fill={isLiked ? "white" : "none"}
									stroke="white"
								/>
							</button>
							<button
								type="button"
								aria-label="Не нравится"
								aria-pressed={isDisliked}
								className="cursor-pointer transition hover:scale-110 active:scale-95"
								onClick={() => {
									setIsDisliked((v) => !v);
									if (isLiked) setIsLiked(false);
								}}
							>
								<ThumbsDown
									className="size-6"
									fill={isDisliked ? "white" : "none"}
									stroke="white"
								/>
							</button>
						</div>
					</div>

					{/* Progress bar */}
					<div className="relative mt-6 w-full max-w-[420px] px-6">
						<div
							ref={progressTrackRef}
							className="group relative flex h-4 w-full cursor-pointer items-center"
							onPointerDown={handleProgressPointerDown}
							onPointerMove={handleProgressPointerMove}
							onPointerUp={handleProgressPointerUp}
							onPointerCancel={handleProgressPointerUp}
						>
							<div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-all group-hover:h-1.5">
								<motion.div
									className="absolute left-0 top-0 h-full rounded-full bg-white"
									animate={{ width: `${progressPct}%` }}
									transition={{ duration: 0.05 }}
								/>
							</div>
						</div>
						<div className="-mt-1 flex justify-between text-sm text-white/60">
							<span>{formatTime(displayTime)}</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>

					{/* Transport controls */}
					<div className="relative mt-4 flex w-full max-w-[420px] items-center justify-center gap-6 px-6">
						<button
							type="button"
							aria-label="Перемешать"
							aria-pressed={isShuffled}
							className="cursor-pointer transition hover:scale-110 active:scale-95"
							onClick={() => setIsShuffled((v) => !v)}
						>
							<Shuffle
								className="size-5"
								strokeWidth={isShuffled ? 2.5 : 2}
								style={{ opacity: isShuffled ? 1 : 0.6 }}
							/>
						</button>
						<button
							type="button"
							aria-label="Предыдущий трек"
							className="cursor-pointer transition hover:scale-110 active:scale-95"
							onClick={prev}
						>
							<SkipBack className="size-7" fill="white" />
						</button>
						<button
							type="button"
							aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
							className="flex size-16 cursor-pointer items-center justify-center rounded-full bg-white transition hover:scale-105 active:scale-95"
							onClick={togglePlay}
						>
							{isPlaying ? (
								<Pause className="size-7" fill="black" stroke="black" />
							) : (
								<Play className="size-7" fill="black" stroke="black" />
							)}
						</button>
						<button
							type="button"
							aria-label="Следующий трек"
							className="cursor-pointer transition hover:scale-110 active:scale-95"
							onClick={next}
						>
							<SkipForward className="size-7" fill="white" />
						</button>
						<button
							type="button"
							aria-label="Повтор"
							aria-pressed={isRepeating}
							className="cursor-pointer transition hover:scale-110 active:scale-95"
							onClick={() => setIsRepeating((v) => !v)}
						>
							<Repeat
								className="size-5"
								strokeWidth={isRepeating ? 2.5 : 2}
								style={{ opacity: isRepeating ? 1 : 0.6 }}
							/>
						</button>
					</div>

					{/* Volume */}
					<div className="relative mb-10 mt-6 flex w-full max-w-[420px] items-center gap-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
						<button
							type="button"
							aria-label="Громкость"
							className="cursor-pointer"
							onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
						>
							{isMuted || volume === 0 ? (
								<VolumeX className="size-5" fill="white" />
							) : volume < 0.5 ? (
								<Volume1 className="size-5" fill="white" />
							) : (
								<Volume2 className="size-5" fill="white" />
							)}
						</button>
						<div
							ref={volumeTrackRef}
							className="group relative flex h-4 flex-1 cursor-pointer items-center"
							onPointerDown={handleVolumePointerDown}
							onPointerMove={handleVolumePointerMove}
							onPointerUp={handleVolumePointerUp}
							onPointerCancel={handleVolumePointerUp}
						>
							<div className="relative h-1 w-full overflow-hidden rounded-full bg-white/20 transition-all group-hover:h-1.5">
								<motion.div
									className="absolute left-0 top-0 h-full rounded-full bg-white"
									animate={{ width: `${volumePct}%` }}
									transition={{ duration: 0.05 }}
								/>
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}