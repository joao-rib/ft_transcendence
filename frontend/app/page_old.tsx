"use client";

import { useState } from "react";

export default function Home() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [loginOpen, setLoginOpen] = useState(false);
	const [signupOpen, setSignupOpen] = useState(false);

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			email: formData.get('email'),
			password: formData.get('password'),
		};
		
		// TODO: Connect to your PostgreSQL backend API
		console.log('Login data:', data);
		// Example: await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
	};

	const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			username: formData.get('username'),
			email: formData.get('email'),
			password: formData.get('password'),
		};
		
		// TODO: Connect to your PostgreSQL backend API
		console.log('Signup data:', data);
		// Example: await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
	};

	return (
<div className="relative min-h-screen overflow-hidden font-sans">
			{/* Clean Gradient Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900"></div>
			
			{/* Subtle grid pattern */}
			<div className="absolute inset-0 opacity-[0.03]" style={{
				backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
				backgroundSize: '50px 50px'
			}}></div>

			{/* Glowing orbs */}
			<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl"></div>
			<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"></div>

			{/* Hamburger Menu Button */}
			<button 
				onClick={() => setMenuOpen(!menuOpen)}
				className="fixed top-6 right-6 z-50 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-yellow-600/20"
				aria-label="Menu"
			>
				<div className="space-y-1.5">
					<span className="block w-6 h-0.5 bg-yellow-200 rounded"></span>
					<span className="block w-6 h-0.5 bg-yellow-200 rounded"></span>
					<span className="block w-6 h-0.5 bg-yellow-200 rounded"></span>
				</div>
			</button>

			{/* Menu Dropdown */}
			{menuOpen && (
				<div className="fixed top-20 right-6 z-40 bg-slate-900/95 backdrop-blur-xl border border-yellow-600/30 rounded-2xl shadow-2xl p-4 w-56 animate-in slide-in-from-top-5 fade-in duration-200">
					<nav className="space-y-2">
						<a href="#new-game" className="block px-4 py-3 text-yellow-100 hover:bg-yellow-600/20 rounded-lg transition-colors">
							New Game
						</a>
						<a href="#rules" className="block px-4 py-3 text-yellow-100 hover:bg-yellow-600/20 rounded-lg transition-colors">
							Rules
						</a>
						<a href="#leaderboard" className="block px-4 py-3 text-yellow-100 hover:bg-yellow-600/20 rounded-lg transition-colors">
							Leaderboard
						</a>
						<a href="#settings" className="block px-4 py-3 text-yellow-100 hover:bg-yellow-600/20 rounded-lg transition-colors">
							Settings
						</a>
						<div className="border-t border-yellow-600/20 my-2"></div>
						<a href="#about" className="block px-4 py-3 text-yellow-100 hover:bg-yellow-600/20 rounded-lg transition-colors">
							About
						</a>
					</nav>
				</div>
			)}

			{/* Login Modal */}
			{loginOpen && (
				<>
					{/* Backdrop */}
					<div 
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
						onClick={() => setLoginOpen(false)}
					></div>
					
					{/* Modal */}
					<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-10 fade-in duration-300">
						<div className="bg-zinc-950 backdrop-blur-xl border border-yellow-600/30 rounded-2xl shadow-2xl p-8">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-2xl font-bold text-white">Login</h3>
								<button 
									onClick={() => setLoginOpen(false)}
									className="text-yellow-200 hover:text-white transition-colors"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							{/* TODO: Add real login logic */}
							<form onSubmit={handleLogin} className="space-y-4"> 
								<div>
									<label htmlFor="login-email" className="block text-sm font-medium text-yellow-200 mb-2">
										Email
									</label>
									<input
										id="login-email"
										name="email"
										type="email"
										required
										placeholder="your@email.com"
										className="w-full px-4 py-3 bg-white/5 border border-yellow-600/30 rounded-xl text-white placeholder-yellow-200/40 focus:outline-none focus:border-yellow-600/60 transition-colors"
									/>
								</div>
								
								<div>
									<label htmlFor="login-password" className="block text-sm font-medium text-yellow-200 mb-2">
										Password
									</label>
									<input
										id="login-password"
										name="password"
										type="password"
										required
										placeholder="••••••••"
										className="w-full px-4 py-3 bg-white/5 border border-yellow-600/30 rounded-xl text-white placeholder-yellow-200/40 focus:outline-none focus:border-yellow-600/60 transition-colors"
									/>
								</div>
								
								<button
									type="submit"
									className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-500/30 mt-6"
								>
									Sign In
								</button>
							</form>
							
							<div className="mt-6 text-center">
								<p className="text-sm text-yellow-300">
									Don't have an account?{' '}
									<button 
										onClick={() => {
											setLoginOpen(false);
											setSignupOpen(true);
										}}
										className="text-yellow-100 hover:text-white font-semibold transition-colors"
									>
										Sign up
									</button>
								</p>
							</div>
							</div>
						</div>
				</>
			)}

			{/* Signup Modal */}
			{signupOpen && (
				<>
					{/* Backdrop */}
					<div 
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
						onClick={() => setSignupOpen(false)}
					></div>
					
					{/* Modal */}
					<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-10 fade-in duration-300">
						<div className="bg-zinc-950 backdrop-blur-xl border border-yellow-600/30 rounded-2xl shadow-2xl p-8">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-2xl font-bold text-white">Create Account</h3>
								<button 
									onClick={() => setSignupOpen(false)}
									className="text-yellow-200 hover:text-white transition-colors"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							
							{/* TODO: Add real signup logic */}

							<form onSubmit={handleSignup} className="space-y-4"> 
								<div>
									<label htmlFor="signup-username" className="block text-sm font-medium text-yellow-200 mb-2">
										Username
									</label>
									<input
										id="signup-username"
										name="username"
										type="text"
										required
										placeholder="johndoe"
										className="w-full px-4 py-3 bg-white/5 border border-yellow-600/30 rounded-xl text-white placeholder-yellow-200/40 focus:outline-none focus:border-yellow-600/60 transition-colors"
									/>
								</div>
								
								<div>
									<label htmlFor="signup-email" className="block text-sm font-medium text-yellow-200 mb-2">
										Email
									</label>
									<input
										id="signup-email"
										name="email"
										type="email"
										required
										placeholder="your@email.com"
										className="w-full px-4 py-3 bg-white/5 border border-yellow-600/30 rounded-xl text-white placeholder-yellow-200/40 focus:outline-none focus:border-yellow-600/60 transition-colors"
									/>
								</div>
								
								<div>
									<label htmlFor="signup-password" className="block text-sm font-medium text-yellow-200 mb-2">
										Password
									</label>
									<input
										id="signup-password"
										name="password"
										type="password"
										required
										placeholder="••••••••"
										minLength={8}
										className="w-full px-4 py-3 bg-white/5 border border-yellow-600/30 rounded-xl text-white placeholder-yellow-200/40 focus:outline-none focus:border-yellow-600/60 transition-colors"
									/>
								</div>
								
								<button
									type="submit"
									className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-500/30 mt-6"
								>
									Create Account
								</button>
							</form>
							
							<div className="mt-6 text-center">
								<p className="text-sm text-yellow-300">
									Already have an account?{' '}
									<button 
										onClick={() => {
											setSignupOpen(false);
											setLoginOpen(true);
										}}
										className="text-yellow-100 hover:text-white font-semibold transition-colors"
									>
										Sign in
									</button>
								</p>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Main Content */}
			<main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 py-20">
				<div className="w-full max-w-2xl mx-auto space-y-12">
					
					{/* Title Section */}
					<div className="text-center space-y-3 px-4">
						<h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-100 to-amber-200 tracking-tight break-words">
							ft_transcendence
						</h1>
						<p className="text-yellow-300 text-lg">
							The Ultimate Card Game Experience
						</p>
					</div>

					{/* Login Card */}
					<div className="bg-white/5 backdrop-blur-xl border border-yellow-600/30 rounded-3xl p-10 shadow-2xl shadow-yellow-900/20">
						<div className="text-center space-y-8">
							<div>
								<h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
								<p className="text-yellow-200 text-sm">Sign in to start your journey</p>
							</div>
							
							<div className="space-y-4">
								<button 
									onClick={() => setLoginOpen(true)}
									className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold py-5 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-yellow-500/30"
								>
									Login
								</button>
								
								<button 
									onClick={() => setSignupOpen(true)}
									className="w-full bg-white/10 hover:bg-white/15 text-white font-semibold py-5 px-6 rounded-xl border-2 border-yellow-600/30 hover:border-yellow-600/50 transition-all transform hover:scale-[1.02]"
								>
									Create Account
								</button>
							</div>
						</div>
					</div>

					{/* Feature Cards */}
					<div className="grid grid-cols-3 gap-4">
						<div className="bg-white/5 border border-yellow-600/20 rounded-xl p-5 text-center hover:bg-yellow-500/10 hover:border-yellow-600/40 transition-all">
							<div className="text-3xl mb-2">⚡</div>
							<h3 className="text-yellow-100 text-sm font-semibold">Quick Match</h3>
						</div>
						
						<div className="bg-white/5 border border-yellow-600/20 rounded-xl p-5 text-center hover:bg-yellow-500/10 hover:border-yellow-600/40 transition-all">
							<div className="text-3xl mb-2">👥</div>
							<h3 className="text-yellow-100 text-sm font-semibold">Multiplayer</h3>
						</div>
						
						<div className="bg-white/5 border border-yellow-600/20 rounded-xl p-5 text-center hover:bg-yellow-500/10 hover:border-yellow-600/40 transition-all">
							<div className="text-3xl mb-2">🏆</div>
							<h3 className="text-yellow-100 text-sm font-semibold">Rankings</h3>
						</div>
					</div>

					{/* Footer Links */}
					<div className="flex justify-center items-center gap-6 text-sm pt-4">
						<a href="#rules" className="text-yellow-300 hover:text-yellow-100 transition-colors">
							Rules
						</a>
						<span className="text-yellow-700">•</span>
						<a href="#privacy" className="text-yellow-300 hover:text-yellow-100 transition-colors">
							Privacy
						</a>
						<span className="text-yellow-700">•</span>
						<a href="#support" className="text-yellow-300 hover:text-yellow-100 transition-colors">
							Support
						</a>
					</div>
				</div>
			</main>
		</div>
	);
}
