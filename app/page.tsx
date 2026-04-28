"use client";

import LoginModal from "./frontend/components/LoginModal";
import SignupModal from "./frontend/components/SignupModal";
import Background from "./frontend/components/Background";
import AuthCard from "./frontend/components/AuthCard";
import HomeFeatureCards from "./frontend/components/HomeFeatureCards";
import HomeFooterLinks from "./frontend/components/HomeFooterLinks";
import HomeHero from "./frontend/components/HomeHero";
import { useHomePageController } from "./frontend/hooks/useHomePageController";
import ThemeSwitcher from "./frontend/components/ThemeSwitcher";

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