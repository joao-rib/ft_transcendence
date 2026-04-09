import RealtimeChat from "./components/realtime-chat";
import Board from "./components/chess_game/Board"

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">ft_transcendence project</h1>
        <p className="text-foreground/80">
          Chess game!!!
        </p>
      </header>
		<Board />
      {/*<RealtimeChat />*/}
    </main>
  );
}