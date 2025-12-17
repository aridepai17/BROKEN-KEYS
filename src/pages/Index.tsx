import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import {
	ModeSelector,
	TestMode,
	WordLimit,
	TimeLimit,
} from "@/components/ModeSelector";
import { TypingTest, TestResults } from "@/components/TypingTest";
import { Results } from "@/components/Results";
import { Leaderboard } from "@/components/Leaderboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Index() {
	const [mode, setMode] = useState<TestMode>("words");
	const [wordLimit, setWordLimit] = useState<WordLimit>(25);
	const [timeLimit, setTimeLimit] = useState<TimeLimit>(25);
	const [isTestActive, setIsTestActive] = useState(false);
	const [testResults, setTestResults] = useState<TestResults | null>(null);
	const [activeTab, setActiveTab] = useState<"test" | "leaderboard">("test");

	// Add dark mode by default
	useEffect(() => {
		document.documentElement.classList.add("dark");
	}, []);

	const handleStart = () => {
		setIsTestActive(true);
	};

	const handleComplete = (results: TestResults) => {
		setTestResults(results);
		setIsTestActive(false);
	};

	const handleRestart = () => {
		setTestResults(null);
		setIsTestActive(false);
	};

	const handleModeChange = (newMode: TestMode) => {
		if (isTestActive) return;
		setMode(newMode);
		setTestResults(null);
	};

	const handleWordLimitChange = (limit: WordLimit) => {
		if (isTestActive) return;
		setWordLimit(limit);
		setTestResults(null);
	};

	const handleTimeLimitChange = (limit: TimeLimit) => {
		if (isTestActive) return;
		setTimeLimit(limit);
		setTestResults(null);
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<Header />

			<main className="flex-1 container mx-auto px-4 py-8">
				<Tabs
					value={activeTab}
					onValueChange={(v) =>
						setActiveTab(v as "test" | "leaderboard")
					}
					className="w-full"
				>
					<div className="flex justify-center mb-8">
						<TabsList>
							<TabsTrigger value="test">Test</TabsTrigger>
							<TabsTrigger value="leaderboard">
								Leaderboard
							</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="test" className="mt-0">
						<div className="flex flex-col items-center gap-8">
							{!testResults && (
								<ModeSelector
									mode={mode}
									wordLimit={wordLimit}
									timeLimit={timeLimit}
									onModeChange={handleModeChange}
									onWordLimitChange={handleWordLimitChange}
									onTimeLimitChange={handleTimeLimitChange}
									disabled={isTestActive}
								/>
							)}

							{testResults ? (
								<Results
									results={testResults}
									onRestart={handleRestart}
								/>
							) : (
								<TypingTest
									mode={mode}
									wordLimit={wordLimit}
									timeLimit={timeLimit}
									onStart={handleStart}
									onComplete={handleComplete}
									isActive={!testResults}
								/>
							)}
						</div>
					</TabsContent>

					<TabsContent value="leaderboard" className="mt-0">
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
					</TabsContent>
				</Tabs>
			</main>

			<footer className="border-t border-border py-4">
				<div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
					Practice typing numbers and special characters
				</div>
			</footer>
		</div>
	);
}
