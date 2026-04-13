"use client";

import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

interface HamburgerMenuProps {
	isOpen: boolean;
	onToggle: () => void;
}

export default function HamburgerMenu({ isOpen, onToggle }: HamburgerMenuProps) {
	return (
		<>
			{/* Hamburger Menu Button */}
			<button 
				onClick={onToggle}
				className="fixed top-6 right-6 z-50 p-3 rounded-lg hover:opacity-90 transition-all border"
				style={{
					backgroundColor: "var(--overlay-light)",
					borderColor: "var(--border-secondary)",
				}}
				aria-label="Menu"
			>
				<div className="space-y-1.5">
					<span className="block w-6 h-0.5 rounded" style={{ backgroundColor: "var(--text-secondary)" }}></span>
					<span className="block w-6 h-0.5 rounded" style={{ backgroundColor: "var(--text-secondary)" }}></span>
					<span className="block w-6 h-0.5 rounded" style={{ backgroundColor: "var(--text-secondary)" }}></span>
				</div>
			</button>

			{/* Menu Dropdown */}
			{isOpen && (
				<div
					className="fixed top-20 right-6 z-40 backdrop-blur-xl border rounded-2xl shadow-2xl p-4 w-56 animate-in slide-in-from-top-5 fade-in duration-200"
					style={{
						backgroundColor: "var(--bg-primary)",
						borderColor: "var(--border-primary)",
					}}
				>
					<nav className="space-y-2">
						<a href="#new-game" className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							New Game
						</a>
						<Link href="/rules" onClick={onToggle} className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							Rules
						</Link>
						<Link href="/rankings" onClick={onToggle} className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							Leaderboard
						</Link>
						<a href="#settings" className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							Settings
						</a>
						<div className="border-t my-2" style={{ borderColor: "var(--border-secondary)" }}></div>
						<a href="#about" className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							About
						</a>
						<div className="border-t my-2 pt-3" style={{ borderColor: "var(--border-secondary)" }}>
							<div className="px-1">
								<ThemeSwitcher direction="column" />
							</div>
						</div>
					</nav>
				</div>
			)}
		</>
	);
}
