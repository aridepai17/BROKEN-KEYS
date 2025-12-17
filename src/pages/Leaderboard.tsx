import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import {
	ModeSelector,
	TestMode,
	WordLimit,
	TimeLimit,
} from "@/components/ModeSelector";
import { Leaderboard } from "@/components/Leaderboard";

export default function LeaderboardPage() {
	const [mode, setMode] = useState<TestMode>("words");
	const [wordLimit, setWordLimit] = useState<WordLimit>(25);
	const [timeLimit, setTimeLimit] = useState<TimeLimit>(25);

	// Add dark mode by default
	useEffect(() => {
		document.documentElement.classList.add("dark");
	}, []);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header />

			<main className="flex-1 container mx-auto px-4 py-8">
				<div className="flex flex-col items-center gap-8">
					<ModeSelector
						mode={mode}
						wordLimit={wordLimit}
						timeLimit={timeLimit}
						onModeChange={setMode}
						onWordLimitChange={setWordLimit}
						onTimeLimitChange={setTimeLimit}
					/>
					<Leaderboard
						mode={mode}
						wordLimit={wordLimit}
						timeLimit={timeLimit}
					/>
				</div>
			</main>

			<footer className="border-t border-border py-4">
				<div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
					Practice typing numbers and special characters
				</div>
			</footer>
		</div>
	);
}
