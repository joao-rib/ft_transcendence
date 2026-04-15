"use client";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	onSwitchToSignup: () => void;
}

export default function LoginModal({ isOpen, onClose, onSubmit, onSwitchToSignup}: LoginModalProps) {
	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
				onClick={onClose}
			></div>
			
			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-10 fade-in duration-300">
				<div className="backdrop-blur-xl border rounded-2xl shadow-2xl p-8" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}>
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Login</h3>
						<button 
							onClick={onClose}
							className="transition-colors hover:opacity-100"
							style={{ color: "var(--text-secondary)", opacity: 0.85 }}
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					
					<form onSubmit={onSubmit} className="space-y-4">
						<div>
							<label htmlFor="login-email" className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
								Email
							</label>
							<input
								id="login-email"
								name="email"
								type="email"
								required
								placeholder="your@email.com"
								className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors"
								style={{
									backgroundColor: "var(--overlay-light)",
									borderColor: "var(--border-primary)",
									color: "var(--text-primary)",
								}}
							/>
						</div>
						
						<div>
							<label htmlFor="login-password" className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
								Password
							</label>
							<input
								id="login-password"
								name="password"
								type="password"
								required
								placeholder="••••••••"
								className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-colors"
								style={{
									backgroundColor: "var(--overlay-light)",
									borderColor: "var(--border-primary)",
									color: "var(--text-primary)",
								}}
							/>
						</div>
						
						<button
							type="submit"
							className="w-full font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 mt-6"
							style={{
								background: "linear-gradient(to right, var(--avatar-mid), var(--avatar-end))",
								color: "var(--bg-primary)",
							}}
						>
							Sign In
						</button>
					</form>
					{/*//TODO: Vamos fazer um forgot password?*/}
					<div className="mt-6 text-center">
						<button className="text-sm transition-colors" style={{ color: "var(--text-accent)" }}> 
							Forgot password?
						</button> 
					</div>
					<div className="mt-6 text-center">
						<p className="text-sm" style={{ color: "var(--text-accent)" }}>
							Don't have an account?{' '}
							<button 
								onClick={onSwitchToSignup}
								className="font-semibold transition-colors"
								style={{ color: "var(--text-primary)" }}
							>
								Sign up
							</button>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
