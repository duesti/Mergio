import { Maximize, Minus, X } from "lucide-react";
import mergioLogo from "@/assets/mergio-logo.svg";
import { useElectronWindow } from "@/hooks/useElectronWindow";
import "./DesktopFrame.css"

function DesktopFrame() {
	const { isElectron, minimize, maximize, close } = useElectronWindow();

	const electronControls = [
		{
			id: 0,
			icon: <Minus className="size-4" />,
			func: minimize
		},
		{
			id: 1,
			icon: <Maximize className="size-4" />,
			func: maximize
		},
		{
			id: 2,
			icon: <X className="size-4" />,
			func: close
		}
	]

	return (
		<header className="p-4 select-none grid grid-cols-3 items-center app-region-drag">
			<section className="flex gap-2 items-center">
				<img src={mergioLogo} alt="M" className="size-6 pointer-events-none" />
				<p className="text-xl">Mergio</p>
			</section>

			<section className="justify-self-center">
				<p className="opacity-80 font-medium">Главная</p>
			</section>

			<section className="flex justify-end gap-1">
				{isElectron && electronControls.map(
					(control, _) => (
						<button
							type="button"
							key={control.id}
							onClick={() => control.func()}
							className="bg-[#12121A] p-2 rounded-sm cursor-pointer hover:bg-[#12121A80] transition-all active:scale-90 app-region-no-drag"
						>
							{control.icon}
						</button>
					)
				)}
			</section>
		</header>
	);
}

export { DesktopFrame };
