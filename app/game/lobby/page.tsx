import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import authOptions from "@/app/api/auth/[...nextauth]/route";
import LobbyPageClient from "./LobbyPageClient";

export default async function LobbyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return <LobbyPageClient />;
}