import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import authOptions from "./api/auth/[...nextauth]/route";
import HomePageClient from "./frontend/components/HomePageClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/game/lobby");
  }

  return <HomePageClient />;
}