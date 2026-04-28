"use client";

import { useState } from "react";
import HamburgerMenu from "./HamburgerMenu";

export default function GlobalHamburgerMenu() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<HamburgerMenu
			isOpen={menuOpen}
			onToggle={() => setMenuOpen((previous) => !previous)}
		/>
	);
}
