import { create } from "zustand";
import { tracks } from "@/data/tracks/tracks.data";
import type { Track } from "@/data/tracks/tracks.types";

const audio = new Audio();

interface PlayerState {
	playlist: Track[];
	currentIndex: number;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;

	currentTrack: () => Track | undefined;

	play: () => void;
	pause: () => void;
	togglePlay: () => void;
	next: () => void;
	prev: () => void;
	seek: (time: number) => void;
	selectTrack: (index: number) => void;
	setVolume: (volume: number) => void;
	toggleMute: () => void;
}

function loadTrack(index: number, autoplay: boolean) {
	const track = tracks[index];
	if (!track) return;
	audio.src = track.audioUrl;
	audio.load();
	if (autoplay)
		audio.play().catch((err) => console.error("play() rejected:", err));
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
	playlist: tracks,
	currentIndex: 0,
	isPlaying: false,
	currentTime: 0,
	duration: 0,
	volume: 1,
	isMuted: false,

	currentTrack: () => get().playlist[get().currentIndex],

	play: () => {
		audio.play().catch((err) => console.error("play() rejected:", err));
		set({ isPlaying: true });
	},

	pause: () => {
		audio.pause();
		set({ isPlaying: false });
	},

	togglePlay: () => {
		get().isPlaying ? get().pause() : get().play();
	},

	next: () => {
		const { currentIndex, playlist, isPlaying } = get();
		const nextIndex = (currentIndex + 1) % playlist.length;
		set({ currentIndex: nextIndex });
		loadTrack(nextIndex, isPlaying);
	},

	prev: () => {
		const { currentIndex, playlist, isPlaying } = get();
		const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
		set({ currentIndex: prevIndex });
		loadTrack(prevIndex, isPlaying);
	},

	seek: (time: number) => {
		audio.currentTime = time;
		set({ currentTime: time });
	},

	selectTrack: (index: number) => {
		set({ currentIndex: index, isPlaying: true });
		loadTrack(index, true);
	},

	setVolume: (volume: number) => {
		const clamped = Math.max(0, Math.min(1, volume));
		audio.volume = clamped;
		set({ volume: clamped, isMuted: clamped === 0 });
	},

	toggleMute: () => {
		const { isMuted, volume } = get();
		if (isMuted) {
			const restored = volume > 0 ? volume : 1;
			audio.volume = restored;
			set({ isMuted: false, volume: restored });
		} else {
			audio.volume = 0;
			set({ isMuted: true });
		}
	},
}));

audio.addEventListener("timeupdate", () => {
	usePlayerStore.setState({ currentTime: audio.currentTime });
});

audio.addEventListener("loadedmetadata", () => {
	usePlayerStore.setState({ duration: audio.duration });
});

audio.addEventListener("ended", () => {
	usePlayerStore.getState().next();
});

audio.addEventListener("error", () => {
	console.error("Audio error:", audio.error);
});

audio.volume = usePlayerStore.getState().volume;
loadTrack(0, false);