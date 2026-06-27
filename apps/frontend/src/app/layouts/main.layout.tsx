import { Outlet } from "react-router";
import { twMerge } from "tailwind-merge";
import { DesktopFrame } from "../../components/desktop/desktop-frame/DesktopFrame";

interface MainLayoutProps {
	className?: string;
}

function MainLayout({ className }: MainLayoutProps) {
	return (
		<main>
			<section className={twMerge(className)}>
				<DesktopFrame />
				<Outlet />
			</section>
		</main>
	);
}

export { MainLayout };
