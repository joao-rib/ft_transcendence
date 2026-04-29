"use client";

import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

interface HamburgerMenuProps {
	isOpen: boolean;
	onOpenSettings: () => void;
	onToggle: () => void;
}

export default function HamburgerMenu({ isOpen, onOpenSettings, onToggle }: HamburgerMenuProps) {
	return (
		<>
			<button
				onClick={onToggle}
				className="fixed top-6 right-6 z-50 rounded-lg border p-3 transition-all hover:opacity-90"
				style={{
					backgroundColor: "var(--overlay-light)",
					borderColor: "var(--border-secondary)",
				}}
				aria-label="Menu"
			>
				<div className="space-y-1.5">
					<span className="block h-0.5 w-6 rounded" style={{ backgroundColor: "var(--text-secondary)" }}></span>
					<span className="block h-0.5 w-6 rounded" style={{ backgroundColor: "var(--text-secondary)" }}></span>
					<span className="block h-0.5 w-6 rounded" style={{ backgroundColor: "var(--text-secondary)" }}></span>
				</div>
			</button>

			{isOpen && (
				<div
					className="fixed right-6 top-20 z-40 w-56 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-5 fade-in duration-200"
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
						<Link href="/privacy" onClick={onToggle} className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							Privacy Policy
						</Link>
						<Link href="/terms" onClick={onToggle} className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							Terms of Service
						</Link>
						<a href="#settings" className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							Settings
						</a>
						<div className="border-t my-2" style={{ borderColor: "var(--border-secondary)" }}></div>
						<a href="#about" className="block px-4 py-3 rounded-lg transition-colors text-[var(--text-primary)] hover:bg-[var(--btn-primary-bg)]">
							About
						</a> {/*//TODO: Fazer isto ir para o github quando estiver publico */}
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
