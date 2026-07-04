import {
	AudioWaveform,
	Maximize2,
	Pause,
	Play,
	SkipBack,
	SkipForward,
	Volume1,
	Volume2,
	VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "./audio-player.store";
import { FullscreenPlayer } from "./FullscreenPlayer";

function formatTime(sec: number) {
	if (!sec || Number.isNaN(sec)) return "0:00";
	const m = Math.floor(sec / 60);
	const s = Math.floor(sec % 60);
	return `${m}:${s.toString().padStart(2, "0")}`;
}

const VOLUME_AUTO_CLOSE_MS = 10_000;

export function Player() {
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

	const volumeTrackRef = useRef<HTMLDivElement>(null);
	const draggingVolumeRef = useRef(false);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [isVolumeOpen, setIsVolumeOpen] = useState(false);

	const progressTrackRef = useRef<HTMLDivElement>(null);
	const draggingProgressRef = useRef(false);
	const [scrubTime, setScrubTime] = useState<number | null>(null);

	const [isFullscreen, setIsFullscreen] = useState(false);

	if (!currentTrack) return null;

	const volumePct = isMuted ? 0 : volume * 100;
	const displayTime = scrubTime ?? currentTime;
	const progressPct = duration ? (displayTime / duration) * 100 : 0;

	function scheduleClose() {
		if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		closeTimerRef.current = setTimeout(() => {
			setIsVolumeOpen(false);
		}, VOLUME_AUTO_CLOSE_MS);
	}

	function clearCloseTimer() {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current);
			closeTimerRef.current = null;
		}
	}

	useEffect(() => {
		if (isVolumeOpen) {
			scheduleClose();
		} else {
			clearCloseTimer();
		}
		return clearCloseTimer;
	}, [isVolumeOpen]);

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
		scheduleClose();
	}

	function handleVolumePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		if (draggingVolumeRef.current) {
			setVolumeFromClientX(e.clientX);
			scheduleClose();
		}
	}

	function handleVolumePointerUp() {
		draggingVolumeRef.current = false;
		scheduleClose();
	}

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
			const time = getTimeFromClientX(e.clientX);
			seek(time);
		}
		draggingProgressRef.current = false;
		setScrubTime(null);
	}

	return (
		<div className="flex flex-col gap-3 relative">
			<div
				ref={progressTrackRef}
				className="relative h-4 flex items-center cursor-pointer group"
				onPointerDown={handleProgressPointerDown}
				onPointerMove={handleProgressPointerMove}
				onPointerUp={handleProgressPointerUp}
				onPointerCancel={handleProgressPointerUp}
			>
				<div className="relative w-full h-1 rounded-full bg-white/20 overflow-hidden group-hover:h-1.5 transition-all">
					<motion.div
						className="absolute left-0 top-0 h-full rounded-full bg-white"
						animate={{ width: `${progressPct}%` }}
						transition={{ duration: 0.05 }}
					/>
				</div>
			</div>

			<div className="grid grid-cols-3 relative">
				<section className="flex items-center gap-4">
					<section className="relative flex items-center justify-center bg-black p-4 rounded-md">
						<AudioWaveform />

						<button
							type="button"
							aria-label="Развернуть плеер"
							className="bg-black/80 flex items-center justify-center absolute h-full w-full rounded-md opacity-0 hover:opacity-100 transition cursor-pointer active:opacity-90"
							onClick={() => setIsFullscreen(true)}
						>
							<Maximize2 className="size-6 opacity-80" />
						</button>
					</section>

					<div>
						<div>{currentTrack.title}</div>
						<div className="opacity-60">{currentTrack.artist}</div>
					</div>
				</section>

				<div className="flex gap-4 justify-center">
					<button
						type="button"
						className="cursor-pointer hover:scale-110 transition active:scale-95"
						onClick={prev}
					>
						<SkipBack className="size-6" fill="white" />
					</button>
					<button
						type="button"
						className="bg-black p-4 rounded-full cursor-pointer hover:scale-110 hover:bg-black/60 transition active:scale-95"
						onClick={togglePlay}
					>
						{isPlaying ? <Pause fill="white" /> : <Play fill="white" />}
					</button>
					<button
						type="button"
						className="cursor-pointer hover:scale-110 transition active:scale-95"
						onClick={next}
					>
						<SkipForward className="size-6" fill="white" />
					</button>
				</div>

				<section className="flex items-center justify-end gap-4">
					<section
						className="flex items-center gap-2"
						onMouseEnter={() => isVolumeOpen && clearCloseTimer()}
						onMouseLeave={() => isVolumeOpen && scheduleClose()}
					>
						<button
							type="button"
							className="cursor-pointer"
							onClick={() => setIsVolumeOpen((v) => !v)}
						>
							{isMuted || volume === 0 ? (
								<VolumeX fill="white" />
							) : volume < 0.5 ? (
								<Volume1 fill="white" />
							) : (
								<Volume2 fill="white" />
							)}
						</button>

						<AnimatePresence initial={false}>
							{isVolumeOpen && (
								<motion.div
									initial={{ width: 0, opacity: 0 }}
									animate={{ width: 96, opacity: 1 }}
									exit={{ width: 0, opacity: 0 }}
									transition={{ duration: 0.2, ease: "easeOut" }}
									style={{ overflow: "hidden" }}
								>
									<div
										ref={volumeTrackRef}
										className="relative w-24 h-4 flex items-center cursor-pointer group"
										onPointerDown={handleVolumePointerDown}
										onPointerMove={handleVolumePointerMove}
										onPointerUp={handleVolumePointerUp}
										onPointerCancel={handleVolumePointerUp}
									>
										<div className="relative w-full h-1 rounded-full bg-white/20 overflow-hidden transition-all">
											<motion.div
												className="absolute left-0 top-0 h-full rounded-full bg-white"
												animate={{ width: `${volumePct}%` }}
												transition={{ duration: 0.05 }}
											/>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</section>

					<section className="flex gap-2 items-center">
						<p className="bg-black/60 px-4 py-2 rounded-full min-w-20 flex justify-center">
							{formatTime(displayTime)}
						</p>
						<p className="opacity-60">/</p>
						<p className="bg-black/60 px-4 py-2 rounded-full min-w-20 flex justify-center">
							{formatTime(duration)}
						</p>
					</section>
				</section>
			</div>

			<FullscreenPlayer
				open={isFullscreen}
				onClose={() => setIsFullscreen(false)}
			/>
		</div>
	);
}