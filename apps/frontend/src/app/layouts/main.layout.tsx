import { useState } from "react";
import { Outlet } from "react-router";
import { twMerge } from "tailwind-merge";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";
import { Player } from "@/features/audio-player/AudioPlayer";
import { DesktopFrame } from "../../components/desktop/desktop-frame/DesktopFrame";

interface MainLayoutProps {
	className?: string;
}

function MainLayout({ className }: MainLayoutProps) {
	const [activeTab, setActiveTab] = useState(
		localStorage.getItem("activeTab") || "Главная",
	);

	return (
		<main className="w-screen h-screen flex flex-col">
			<section className={twMerge("flex flex-col h-full w-full", className)}>
				<DesktopFrame activeTab={activeTab} />

				<section className="flex flex-1 min-h-0">
					<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

					<section className="flex flex-col flex-1 gap-4 m-4 mt-0 ml-0">
						<section className="bg-[#12121A] p-4 rounded-sm w-full h-full">
							<Outlet />
						</section>

						<Player />
					</section>
				</section>
			</section>
		</main>
	);
}

export { MainLayout };
