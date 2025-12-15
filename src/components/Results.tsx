import { TestResults } from "./TypingTest";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Trophy } from "lucide-react";

interface ResultsProps {
	results: TestResults;
	onRestart: () => void;
}

export function Results({ results, onRestart }: ResultsProps) {
	const { user } = useAuth();
	const [saved, setSaved] = useState(false);
	const [isNewHighscore, setIsNewHighscore] = useState(false);

	useEffect(() => {
		const saveScore = async () => {
			if (!user || saved) return;

			try {
				// Check if this is a new personal best
				const { data: existingScores } = await supabase
					.from("highscores")
					.select("wpm")
					.eq("user_id", user.id)
					.eq("mode", results.mode)
					.eq("limit_value", results.limitValue)
					.order("wpm", { ascending: false })
					.limit(1);

				const previousBest = existingScores?.[0]?.wpm || 0;
				if (results.wpm > previousBest) {
					setIsNewHighscore(true);
				}

				// Save the score
				const { error } = await supabase.from("highscores").insert({
					user_id: user.id,
					mode: results.mode,
					limit_value: results.limitValue,
					wpm: results.wpm,
					accuracy: results.accuracy,
					raw_wpm: results.rawWpm,
				});

				if (error) throw error;
				setSaved(true);

				if (results.wpm > previousBest && previousBest > 0) {
					toast.success("New personal best!");
				}
			} catch (error) {
				console.error("Failed to save score:", error);
			}
		};

		saveScore();
	}, [user, results, saved]);

	return (
		<div className="w-full max-w-2xl mx-auto">
			<div className="text-center mb-8">
				{isNewHighscore && (
					<div className="flex items-center justify-center gap-2 text-success mb-4">
						<Trophy className="h-6 w-6" />
						<span className="text-lg font-medium">
							New Personal Best!
						</span>
					</div>
				)}
				<h2 className="text-2xl font-semibold mb-2">Test Complete</h2>
				<p className="text-muted-foreground">
					{results.mode === "words"
						? `${results.limitValue} words`
						: `${results.limitValue}s`}
				</p>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
				<div className="text-center p-4 rounded-lg bg-card border border-border">
					<div className="text-4xl font-mono font-bold text-foreground mb-1">
						{Math.round(results.wpm)}
					</div>
					<div className="text-sm text-muted-foreground">wpm</div>
				</div>

				<div className="text-center p-4 rounded-lg bg-card border border-border">
					<div className="text-4xl font-mono font-bold text-foreground mb-1">
						{results.accuracy.toFixed(1)}%
					</div>
					<div className="text-sm text-muted-foreground">
						accuracy
					</div>
				</div>

				<div className="text-center p-4 rounded-lg bg-card border border-border">
					<div className="text-4xl font-mono font-bold text-foreground mb-1">
						{Math.round(results.rawWpm)}
					</div>
					<div className="text-sm text-muted-foreground">raw wpm</div>
				</div>

				<div className="text-center p-4 rounded-lg bg-card border border-border">
					<div className="text-4xl font-mono font-bold text-foreground mb-1">
						{results.timeElapsed.toFixed(1)}s
					</div>
					<div className="text-sm text-muted-foreground">time</div>
				</div>
			</div>

			<div className="text-center text-sm text-muted-foreground mb-8">
				<span className="text-success">{results.correctChars}</span>{" "}
				correct /{" "}
				<span className="text-destructive">
					{results.incorrectChars}
				</span>{" "}
				incorrect
			</div>

			<div className="flex justify-center">
				<Button onClick={onRestart} size="lg" className="gap-2">
					<RotateCcw className="h-4 w-4" />
					Try Again
				</Button>
			</div>

			{!user && (
				<p className="text-center text-muted-foreground mt-6 text-sm">
					Sign in to save your scores and compete on the leaderboard
				</p>
			)}
		</div>
	);
}
