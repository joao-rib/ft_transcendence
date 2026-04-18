"use client";

import { useState } from "react";
import type { FormEvent } from "react";

export function useHomePageController() {
	const [loginOpen, setLoginOpen] = useState(false);
	const [signupOpen, setSignupOpen] = useState(false);

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			email: formData.get("email"),
			password: formData.get("password"),
		};

		// TODO: Connect to your PostgreSQL backend API.
		console.log("Login data:", data);
	};

	const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const formData = new FormData(e.currentTarget);
			const data = {
				username: String(formData.get("username") ?? ""),
				email: String(formData.get("email") ?? ""),
				password: String(formData.get("password") ?? ""),
			};

			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const result = (await response.json().catch(() => null)) as { error?: string } | null;
				const message = result?.error ?? "Could not create account.";
				throw new Error(message);
			}

			e.currentTarget.reset();
			setSignupOpen(false);
			setLoginOpen(true);
		} catch (error) {
			console.error("Signup failed", error);
		}
	};

	const openLogin = () => setLoginOpen(true);
	const closeLogin = () => setLoginOpen(false);
	const openSignup = () => setSignupOpen(true);
	const closeSignup = () => setSignupOpen(false);

	const switchToLogin = () => {
		setSignupOpen(false);
		setLoginOpen(true);
	};

	const switchToSignup = () => {
		setLoginOpen(false);
		setSignupOpen(true);
	};

	return {
		loginOpen,
		signupOpen,
		handleLogin,
		handleSignup,
		openLogin,
		closeLogin,
		openSignup,
		closeSignup,
		switchToLogin,
		switchToSignup,
	};
}
