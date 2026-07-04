import track1 from "@/assets/audio/track-001.mp3";
import track2 from "@/assets/audio/track-002.mp3";
import track3 from "@/assets/audio/track-003.mp3";
import track4 from "@/assets/audio/track-004.mp3";
import type { Track } from "./tracks.types";

const tracks: Track[] = [
	{
		id: "1",
		title: "overdose",
		artist: "Тёмный друн",
		duration: 88,
		audioUrl: track1,
	},
	{
		id: "2",
		title: "2 AM",
		artist: "King Von",
		duration: 120,
		audioUrl: track2,
	},
	{
		id: "3",
		title: "ДНК",
		artist: "FACE",
		duration: 173,
		audioUrl: track3,
	},
	{
		id: "4",
		title: "вклубе",
		artist: "Тёмный друн",
		duration: 93,
		audioUrl: track4,
	},
];

export { tracks };
