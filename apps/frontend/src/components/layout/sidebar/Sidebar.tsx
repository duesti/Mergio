import { motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { sidebarItems } from "./Sidebar.items";

interface SidebarProps {
	activeTab?: string;
	setActiveTab?: Dispatch<SetStateAction<string>>;
}

function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
	// const [isCollapsed, setCollapsed] = useState<boolean>(false);

	return (
		<aside className="p-4 flex flex-col">
			<section className="flex flex-col gap-2">
				{sidebarItems.map((item, _) => (
					<button
						type="button"
						key={item.id}
						className={twMerge(
							"flex gap-2 items-center cursor-pointer transition px-4 py-3 w-full rounded-lg relative select-none",
						)}
						onClick={() => {
						setActiveTab?.(item.label);
						localStorage.setItem("activeTab", item.label);
						}}
					>
            {activeTab === item.label && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-[#12121A]  rounded-lg -z-10"
                transition={{
                  duration: 0.15
                }}
              />
            )}
						<item.icon className="size-4" />
						<p>{item.label}</p>
					</button>
				))}
			</section>
		</aside>
	);
}

export { Sidebar };
