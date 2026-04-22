export type BoardTheme = "default" | "classic" | "kitty";

export const BOARD_THEME_STORAGE_KEY = "board-theme";
export const BOARD_THEME_CHANGE_EVENT = "board-theme-change";

export const BOARD_THEME_PALETTES: Record<
	BoardTheme,
	{ lightTile: string; darkTile: string; description: string }
> = {
	default: {
		lightTile: "#f0D8b7",
		darkTile: "#B48764",
		description: "Original board colors from the current CSS theme.",
	},
	classic: {
		lightTile: "#f0D8b7",
		darkTile: "rgba(20, 226, 14, 0.8)",
		description: "Dark tiles become a softer light green.",
	},
	kitty: {
		lightTile: "rgba(255, 0, 154, 0.9)",
		darkTile: "rgba(243, 239, 146, 0.8)",
		description: "Pink and toasted yellow tiles.",
	},
};

export function applyBoardTheme(theme: BoardTheme) {
	if (typeof document === "undefined") {
		return;
	}

	const palette = BOARD_THEME_PALETTES[theme];
	document.documentElement.style.setProperty("--light-tile", palette.lightTile);
	document.documentElement.style.setProperty("--dark-tile", palette.darkTile);
}

export function getStoredBoardTheme(): BoardTheme {
	if (typeof window === "undefined") {
		return "default";
	}

	const storedTheme = window.localStorage.getItem(BOARD_THEME_STORAGE_KEY);
	return storedTheme === "classic" || storedTheme === "kitty" ? storedTheme : "default";
}

export function saveBoardTheme(theme: BoardTheme) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(BOARD_THEME_STORAGE_KEY, theme);
}

export function broadcastBoardThemeChange(theme: BoardTheme) {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(new CustomEvent(BOARD_THEME_CHANGE_EVENT, { detail: theme }));
}
