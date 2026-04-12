"use client";

import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import Background from "./components/Background";
import AuthCard from "./components/AuthCard";
import HomeFeatureCards from "./components/HomeFeatureCards";
import HomeFooterLinks from "./components/HomeFooterLinks";
import HomeHero from "./components/HomeHero";
import { useHomePageController } from "./hooks/useHomePageController";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function Home() {
  const {
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
  } = useHomePageController();

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <Background />

      <div className="fixed top-6 left-6 z-50">
        <ThemeSwitcher />
      </div>

      <LoginModal
        isOpen={loginOpen}
        onClose={closeLogin}
        onSubmit={handleLogin}
        onSwitchToSignup={switchToSignup}
      />

      <SignupModal
        isOpen={signupOpen}
        onClose={closeSignup}
        onSubmit={handleSignup}
        onSwitchToLogin={switchToLogin}
      />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 py-20">
        <div className="mx-auto w-full max-w-2xl space-y-12">
          <HomeHero />
          <AuthCard onLoginClick={openLogin} onSignupClick={openSignup} />
          <HomeFeatureCards />
          <HomeFooterLinks />
        </div>
      </main>
    </div>
  );
}