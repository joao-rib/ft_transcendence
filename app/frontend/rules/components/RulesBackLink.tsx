import Link from "next/link";

export default function RulesBackLink() {
	return (
		<Link
			href="/"
			className="fixed top-8 left-8 z-20 transition-colors hover:opacity-80 flex items-center gap-2 text-lg"
			style={{ color: "var(--text-accent)" }}
		>
			<span className="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
				<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
					<path d="M15 18l-6-6 6-6" />
				</svg>
			</span>
			<span className="leading-normal">Back to Home</span>
		</Link>
	);
}