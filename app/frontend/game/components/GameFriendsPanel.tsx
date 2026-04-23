interface FriendEntry {
	id: string;
	name: string;
	status: "online" | "offline";
}

interface GameFriendsPanelProps {
	friends: FriendEntry[];
	isOpen: boolean;
	onClose: () => void;
}

export default function GameFriendsPanel({ friends, isOpen, onClose }: GameFriendsPanelProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-6">
			<div
				className="w-full max-w-md rounded-3xl p-6 backdrop-blur-xl"
				style={{
					backgroundColor: "var(--bg-primary)",
					border: "1px solid var(--border-primary)",
				}}
			>
				<div className="mb-5 flex items-start justify-between gap-4">
					<div>
						<h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
							Friends
						</h2>
						<p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
							Your friend list for quick match invites.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
						style={{
							backgroundColor: "var(--overlay-light)",
							border: "1px solid var(--border-primary)",
							color: "var(--text-primary)",
						}}
					>
						Close
					</button>
				</div>

				<div className="space-y-3">
					{friends.map((friend) => {
						const isOnline = friend.status === "online";

						return (
							<div
								key={friend.id}
								className="flex items-center justify-between rounded-2xl px-4 py-3"
								style={{
									backgroundColor: "var(--overlay-light)",
									border: "1px solid var(--border-primary)",
								}}
							>
								<div className="flex items-center gap-3">
									<span
										className="h-2.5 w-2.5 rounded-full"
										style={{ backgroundColor: isOnline ? "#22c55e" : "#64748b" }}
									/>
									<span className="font-medium" style={{ color: "var(--text-primary)" }}>
										{friend.name}
									</span>
								</div>
								<span className="text-sm" style={{ color: "var(--text-muted)" }}>
									{isOnline ? "Online" : "Offline"}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
