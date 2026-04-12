import Link from "next/link";

export default function RulesBackLink() {
	return (
		<Link
			href="/"
			className="fixed top-8 left-8 z-20 transition-colors hover:opacity-80 flex items-center gap-2 text-lg"
			style={{ color: "var(--text-accent)" }}
		>
			<span>←</span>
			<span>Back to Home</span>
		</Link>
	);
}
