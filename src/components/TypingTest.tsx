import { useEffect, useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import {
	generateCharacters,
	generateCharactersForTime,
} from "@/lib/generateCharacters";
import { TestMode, WordLimit, TimeLimit } from "./ModeSelector";
import { RotateCcw } from "lucide-react";

interface TypingTestProps {
	mode: TestMode;
	wordLimit: WordLimit;
	timeLimit: TimeLimit;
	onStart: () => void;
	onComplete: (results: TestResults) => void;
	isActive: boolean;
}

export interface TestResults {
	wpm: number;
	rawWpm: number;
	accuracy: number;
	correctChars: number;
	incorrectChars: number;
	totalChars: number;
	timeElapsed: number;
	mode: TestMode;
	limitValue: number;
}

export function TypingTest({
	mode,
	wordLimit,
	timeLimit,
	onStart,
	onComplete,
	isActive,
}: TypingTestProps) {
	const [text, setText] = useState("");
	const [typed, setTyped] = useState("");
	const [startTime, setStartTime] = useState<number | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [errors, setErrors] = useState<Set<number>>(new Set());
	const containerRef = useRef<HTMLDivElement>(null);

	const generateNewText = useCallback(() => {
		if (mode === "words") {
			setText(generateCharacters(wordLimit));
		} else {
			// Generate enough characters for time mode (estimate ~5 chars per second)
			setText(generateCharactersForTime(timeLimit * 8));
		}
	}, [mode, wordLimit, timeLimit]);

	useEffect(() => {
		generateNewText();
		setTyped("");
		setCurrentIndex(0);
		setErrors(new Set());
		setStartTime(null);
		setTimeRemaining(timeLimit);
	}, [mode, wordLimit, timeLimit, generateNewText]);

	useEffect(() => {
		if (!isActive) {
			setTyped("");
			setCurrentIndex(0);
			setErrors(new Set());
			setStartTime(null);
			setTimeRemaining(timeLimit);
			generateNewText();
		}
	}, [isActive, timeLimit, generateNewText]);

	useEffect(() => {
		if (mode === "time" && startTime && isActive) {
			const interval = setInterval(() => {
				const elapsed = (Date.now() - startTime) / 1000;
				const remaining = Math.max(0, timeLimit - elapsed);
				setTimeRemaining(remaining);

				if (remaining <= 0) {
					clearInterval(interval);
					completeTest();
				}
			}, 100);

			return () => clearInterval(interval);
		}
	}, [mode, startTime, timeLimit, isActive]);

	const completeTest = useCallback(() => {
		if (!startTime) return;

		const timeElapsed = (Date.now() - startTime) / 1000;
		const correctChars = currentIndex - errors.size;
		const incorrectChars = errors.size;
		const totalChars = currentIndex;

		// WPM calculation: (characters / 5) / minutes
		const minutes = timeElapsed / 60;
		const rawWpm = totalChars / 5 / minutes;
		const wpm = correctChars / 5 / minutes;
		const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0;

		onComplete({
			wpm: Math.round(wpm * 100) / 100,
			rawWpm: Math.round(rawWpm * 100) / 100,
			accuracy: Math.round(accuracy * 100) / 100,
			correctChars,
			incorrectChars,
			totalChars,
			timeElapsed: Math.round(timeElapsed * 100) / 100,
			mode,
			limitValue: mode === "words" ? wordLimit : timeLimit,
		});
	}, [
		startTime,
		currentIndex,
		errors,
		mode,
		wordLimit,
		timeLimit,
		onComplete,
	]);

	useEffect(() => {
		if (
			mode === "words" &&
			currentIndex >= text.length &&
			text.length > 0 &&
			isActive
		) {
			completeTest();
		}
	}, [mode, currentIndex, text.length, isActive, completeTest]);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isActive) return;

			// Ignore modifier keys and special keys
			if (e.ctrlKey || e.altKey || e.metaKey) return;
			if (
				[
					"Tab",
					"Escape",
					"Enter",
					"Shift",
					"CapsLock",
					"Control",
					"Alt",
					"Meta",
				].includes(e.key)
			)
				return;

			e.preventDefault();

			// Start timer on first keypress
			if (!startTime) {
				setStartTime(Date.now());
				onStart();
			}

			if (e.key === "Backspace") {
				if (currentIndex > 0) {
					const newIndex = currentIndex - 1;
					setCurrentIndex(newIndex);
					setTyped(typed.slice(0, -1));
					// Remove error if backspacing over an error
					if (errors.has(newIndex)) {
						const newErrors = new Set(errors);
						newErrors.delete(newIndex);
						setErrors(newErrors);
					}
				}
				return;
			}

			// Only process single character keys
			if (e.key.length !== 1) return;

			const expectedChar = text[currentIndex];
			const isCorrect = e.key === expectedChar;

			if (!isCorrect) {
				setErrors(new Set(errors).add(currentIndex));
			}

			setTyped(typed + e.key);
			setCurrentIndex(currentIndex + 1);
		},
		[isActive, startTime, currentIndex, text, typed, errors, onStart]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const restart = () => {
		generateNewText();
		setTyped("");
		setCurrentIndex(0);
		setErrors(new Set());
		setStartTime(null);
		setTimeRemaining(timeLimit);
	};

	const renderCharacters = () => {
		return text.split("").map((char, index) => {
			let className = "char-upcoming";

			if (index < currentIndex) {
				className = errors.has(index)
					? "char-incorrect"
					: "char-correct";
			} else if (index === currentIndex) {
				className = "char-current animate-cursor-blink";
			}

			return (
				<span
					key={index}
					className={cn("font-mono text-2xl sm:text-3xl", className)}
				>
					{char}
				</span>
			);
		});
	};

	return (
		<div className="w-full max-w-4xl mx-auto">
			{mode === "time" && startTime && (
				<div className="text-center mb-6">
					<span className="font-mono text-4xl text-foreground">
						{Math.ceil(timeRemaining)}
					</span>
				</div>
			)}

			<div
				ref={containerRef}
				className="p-6 rounded-lg bg-card border border-border focus:outline-none cursor-text min-h-[200px] overflow-hidden"
				tabIndex={0}
				onClick={() => containerRef.current?.focus()}
			>
				<div className="leading-relaxed break-all">
					{renderCharacters()}
				</div>
			</div>

			<div className="flex justify-center mt-6">
				<button
					onClick={restart}
					className="p-3 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
					title="Restart (Tab + Enter)"
				>
					<RotateCcw className="h-5 w-5" />
				</button>
			</div>

			{!isActive && (
				<p className="text-center text-muted-foreground mt-4 text-sm">
					Click on the text area and start typing to begin
				</p>
			)}
		</div>
	);
}
