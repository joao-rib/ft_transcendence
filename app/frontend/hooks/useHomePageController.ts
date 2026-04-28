"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function useHomePageController() {
	const router = useRouter();
	const [loginOpen, setLoginOpen] = useState(false);
	const [signupOpen, setSignupOpen] = useState(false);

	const persistLocalSession = (username: string) => {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem("ft:user", username);
	};

	const attemptAuthRequest = async (
		path: string,
		payload: Record<string, FormDataEntryValue | null>,
	) => {
		const response = await fetch(path, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error("Authentication request failed");
		}

		return response;
	};

	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			email: formData.get("email"),
			password: formData.get("password"),
		};

		try {
			await attemptAuthRequest("/api/auth/login", data);
		} catch {
			// Graceful fallback while backend auth endpoints are not wired.
		}

		const email = String(data.email ?? "player@example.com");
		const username = email.split("@")[0] || "player";
		persistLocalSession(username);
		closeLogin();
		router.push("/game/lobby");
	};

	const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			username: formData.get("username"),
			email: formData.get("email"),
			password: formData.get("password"),
		};

		try {
			await attemptAuthRequest("/api/auth/signup", data);
		} catch {
			// Graceful fallback while backend auth endpoints are not wired.
		}

		const username = String(data.username ?? "player");
		persistLocalSession(username);
		closeSignup();
		router.push("/game/lobby");
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
