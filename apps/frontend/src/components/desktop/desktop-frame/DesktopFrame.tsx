import { Maximize, Minus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import mergioLogo from "@/assets/mergio-logo.svg";
import { useElectronWindow } from "@/hooks/useElectronWindow";
import "./DesktopFrame.css";

function DesktopFrame({ activeTab }: { activeTab: string }) {
	const { isElectron, minimize, maximize, close } = useElectronWindow();

	const electronControls = [
		{
			id: 0,
			icon: <Minus className="size-4" />,
			func: minimize,
		},
		{
			id: 1,
			icon: <Maximize className="size-4" />,
			func: maximize,
		},
		{
			id: 2,
			icon: <X className="size-4" />,
			func: close,
		},
	];

	return (
		<header className="p-4 select-none grid grid-cols-3 items-center app-region-drag">
			<section className="flex gap-2 items-center">
				<img src={mergioLogo} alt="M" className="size-6 pointer-events-none" />
				<p className="text-sm">Mergio</p>
			</section>

			<section className="justify-self-center">
				<AnimatePresence mode="wait">
					<motion.p
						key={activeTab}
						className="opacity-60 font-medium text-sm"
						initial={{ y: 4, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -4, opacity: 0 }}
						transition={{
							duration: 0.15
						}}
					>
						{activeTab || "Главная"}
					</motion.p>
				</AnimatePresence>
			</section>

			<section className="flex justify-end gap-2">
				{isElectron &&
					electronControls.map((control, _) => (
						<button
							type="button"
							key={control.id}
							onClick={() => control.func()}
							className="bg-[#12121A] p-2 rounded-sm cursor-pointer hover:bg-[#12121A80] transition-all active:scale-90 app-region-no-drag"
						>
							{control.icon}
						</button>
					))}
			</section>
		</header>
	);
}

export { DesktopFrame };
