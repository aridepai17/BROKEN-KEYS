import { cn } from "@/lib/utils";

export type TestMode = "words" | "time";
export type WordLimit = 10 | 25 | 50;
export type TimeLimit = 10 | 25 | 60;

interface ModeSelectorProps {
	mode: TestMode;
	wordLimit: WordLimit;
	timeLimit: TimeLimit;
	onModeChange: (mode: TestMode) => void;
	onWordLimitChange: (limit: WordLimit) => void;
	onTimeLimitChange: (limit: TimeLimit) => void;
	disabled?: boolean;
}

export function ModeSelector({
	mode,
	wordLimit,
	timeLimit,
	onModeChange,
	onWordLimitChange,
	onTimeLimitChange,
	disabled = false,
}: ModeSelectorProps) {
	const wordLimits: WordLimit[] = [10, 25, 50];
	const timeLimits: TimeLimit[] = [10, 25, 60];

	return (
		<div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
			<div className="flex items-center gap-2 rounded-lg bg-secondary p-1">
				<button
					onClick={() => onModeChange("words")}
					disabled={disabled}
					className={cn(
						"px-4 py-2 text-sm font-medium transition-colors rounded-md",
						mode === "words"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground",
						disabled && "opacity-50 cursor-not-allowed"
					)}
				>
					words
				</button>
				<button
					onClick={() => onModeChange("time")}
					disabled={disabled}
					className={cn(
						"px-4 py-2 text-sm font-medium transition-colors rounded-md",
						mode === "time"
							? "bg-background text-foreground shadow-sm"
							: "text-muted-foreground hover:text-foreground",
						disabled && "opacity-50 cursor-not-allowed"
					)}
				>
					time
				</button>
			</div>

			<div className="flex items-center gap-2">
				{mode === "words"
					? wordLimits.map((limit) => (
							<button
								key={limit}
								onClick={() => onWordLimitChange(limit)}
								disabled={disabled}
								className={cn(
									"px-3 py-1.5 text-sm font-mono transition-colors rounded-md",
									wordLimit === limit
										? "text-foreground bg-secondary"
										: "text-muted-foreground hover:text-foreground",
									disabled && "opacity-50 cursor-not-allowed"
								)}
							>
								{limit}
							</button>
					  ))
					: timeLimits.map((limit) => (
							<button
								key={limit}
								onClick={() => onTimeLimitChange(limit)}
								disabled={disabled}
								className={cn(
									"px-3 py-1.5 text-sm font-mono transition-colors rounded-md",
									timeLimit === limit
										? "text-foreground bg-secondary"
										: "text-muted-foreground hover:text-foreground",
									disabled && "opacity-50 cursor-not-allowed"
								)}
							>
								{limit}s
							</button>
					  ))}
			</div>
		</div>
	);
}
