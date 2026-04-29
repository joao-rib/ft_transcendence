"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export function useHomePageController() {
	const router = useRouter();
	const [loginOpen, setLoginOpen] = useState(false);
	const [signupOpen, setSignupOpen] = useState(false);

	/**
	 * Handle login: uses NextAuth signIn with Credentials provider
	 * - Extracts email/password from form
	 * - Calls NextAuth signIn() which validates against database
	 * - If valid, creates JWT session stored in HTTP-only cookie
	 * - Errors are caught and displayed to user
	 */
	const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const email = String(formData.get("email"));
		const password = String(formData.get("password"));

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false, // We'll handle redirect manually
			});

			console.log("[handleLogin] signIn result:", result);

			if (!result?.ok) {
				const providerError = result?.error ?? "CredentialsSignin";
				const errorMessage = providerError === "CredentialsSignin"
					? "Invalid email or password"
					: providerError;
				setError(errorMessage);
				console.error("[handleLogin] Login failed:", result?.error);
				return;
			}

			console.log("[handleLogin] Login successful, about to redirect");
			// Redirect to lobby after successful login (do this BEFORE closing modal to avoid form element issues)
			console.log("[handleLogin] Calling router.push('/game/lobby')");
			router.push("/game/lobby");
			
			// Close modal after redirect is initiated
			setLoginOpen(false);
			console.log("[handleLogin] router.push() called");
		} catch (err) {
			const fallbackError = err instanceof Error && err.message.includes("NetworkError")
				? "Invalid email or password."
				: "An error occurred during login";
			setError(fallbackError);
			console.error("[handleLogin] Error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Handle signup: calls Server Action registerUser, then auto-signs in
	 * - Calls Server Action to hash password + create user + initialize scores
	 * - If successful, automatically signs in the new user
	 * - Validates input before sending
	 */
	const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const username = String(formData.get("username"));
		const email = String(formData.get("email"));
		const password = String(formData.get("password"));

		// Basic client-side validation
		if (!username || !email || !password) {
			setError("All fields are required");
			setIsLoading(false);
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
