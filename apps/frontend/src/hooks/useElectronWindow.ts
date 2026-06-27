function useElectronWindow() {
	const isElectron = typeof window !== "undefined" && !!window.electronAPI;

	const minimize = () => {
		if (isElectron) window.electronAPI.minimize();
	};

	const maximize = () => {
		if (isElectron) window.electronAPI.maximize();
	};

	const close = () => {
		if (isElectron) window.electronAPI.close();
	};

	return {
		isElectron,
		minimize,
		maximize,
		close,
	};
}

export { useElectronWindow };
