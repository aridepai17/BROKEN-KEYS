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

interface WordState {
	typed: string;
}

export function TypingTest({
	mode,
	wordLimit,
	timeLimit,
	onStart,
	onComplete,
	isActive,
}: TypingTestProps) {
	const [words, setWords] = useState<string[]>([]);
	const [wordStates, setWordStates] = useState<WordState[]>([]);
	const [currentWordIndex, setCurrentWordIndex] = useState(0);
	const [currentCharIndex, setCurrentCharIndex] = useState(0);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [timeRemaining, setTimeRemaining] = useState<number>(timeLimit);
	const [liveWpm, setLiveWpm] = useState(0);
	const [liveAccuracy, setLiveAccuracy] = useState(100);
	const [isTyping, setIsTyping] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const caretRef = useRef<HTMLSpanElement>(null);

	const getCorrectCharsForWord = useCallback((typed: string, target: string): number => {
		return typed.split('').reduce((count, char, index) => {
			if (index < target.length && char === target[index]) {
				return count + 1;
			}
			return count;
		}, 0);
	}, []);

	const generateNewText = useCallback(() => {
		let newText = "";
		if (mode === "words") {
			newText = generateCharacters(wordLimit);
		} else {
			// Generate enough characters for time mode
			newText = generateCharactersForTime(timeLimit * 8);
		}
		const wordArray = newText.split(" ").filter(word => word.length > 0);
		setWords(wordArray);
		setWordStates(wordArray.map(() => ({ typed: "" })));
	}, [mode, wordLimit, timeLimit]);

	useEffect(() => {
		generateNewText();
		resetTest();
	}, [mode, wordLimit, timeLimit, generateNewText]);

	useEffect(() => {
		if (!isActive) {
			resetTest();
			generateNewText();
		}
	}, [isActive, timeLimit, generateNewText]);

	const resetTest = () => {
		setCurrentWordIndex(0);
		setCurrentCharIndex(0);
		setStartTime(null);
		setTimeRemaining(timeLimit);
		setLiveWpm(0);
		setLiveAccuracy(100);
		setIsTyping(false);
		if (words.length > 0) {
			setWordStates(words.map(() => ({ typed: "" })));
		}
	};

	useEffect(() => {
		if (mode === "time" && startTime && isActive) {
			const interval = setInterval(() => {
				const elapsed = (Date.now() - startTime) / 1000;
				const remaining = Math.max(0, timeLimit - elapsed);
				setTimeRemaining(remaining);

				// Update live stats
				if (elapsed > 0) {
					const correctTyped = wordStates.reduce((acc, state, idx) => {
						const word = words[idx];
						return acc + getCorrectCharsForWord(state.typed, word);
					}, 0);
					const minutes = elapsed / 60;
					const wpm = correctTyped / 5 / minutes;
					setLiveWpm(Math.max(0, Math.round(wpm)));
				}

				if (remaining <= 0) {
					clearInterval(interval);
					completeTest();
				}
			}, 100);

			return () => clearInterval(interval);
		}
	}, [mode, startTime, timeLimit, isActive, wordStates, words, getCorrectCharsForWord]);

	const completeTest = useCallback(() => {
		if (!startTime) return;

		const timeElapsed = (Date.now() - startTime) / 1000;
		const totalChars = wordStates.reduce((acc, state) => acc + state.typed.length, 0);
		const correctChars = wordStates.reduce((acc, state, idx) => {
			const word = words[idx];
			return acc + getCorrectCharsForWord(state.typed, word);
		}, 0);
		const incorrectChars = totalChars - correctChars;

		// WPM calculation: (correct characters) / 5 / minutes
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
		wordStates,
		words,
		mode,
		wordLimit,
		timeLimit,
		onComplete,
		getCorrectCharsForWord,
	]);

	useEffect(() => {
		if (
			mode === "words" &&
			currentWordIndex >= words.length &&
			words.length > 0 &&
			isActive
		) {
			completeTest();
		}
	}, [mode, currentWordIndex, words.length, isActive, completeTest]);

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
				setIsTyping(true);
			}

			if (e.key === "Backspace") {
				// Only allow backspace within current word
				if (currentCharIndex > 0) {
					const newWordStates = [...wordStates];
					const oldTyped = newWordStates[currentWordIndex].typed;
					newWordStates[currentWordIndex].typed = oldTyped.slice(0, -1);
					setWordStates(newWordStates);
					setCurrentCharIndex(currentCharIndex - 1);

					// Update live stats on backspace
					const totalTyped = wordStates.reduce((acc, state, idx) => {
						return idx === currentWordIndex ? acc + (state.typed.length - 1) : acc + state.typed.length;
					}, 0);
					const correctTyped = wordStates.reduce((acc, state, idx) => {
						const word = words[idx];
						const thisTyped = idx === currentWordIndex ? state.typed.slice(0, -1) : state.typed;
						return acc + getCorrectCharsForWord(thisTyped, word);
					}, 0);
					setLiveAccuracy(totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100);

					if (startTime) {
						const elapsed = (Date.now() - startTime) / 1000;
						const minutes = elapsed / 60;
						if (minutes > 0) {
							const wpm = correctTyped / 5 / minutes;
							setLiveWpm(Math.max(0, Math.round(wpm)));
						}
					}
				}
				return;
			}

			// Only process single character keys
			if (e.key.length !== 1) return;

			const currentWord = words[currentWordIndex];
			if (!currentWord) return;

			// Handle space - move to next word
			if (e.key === " ") {
				if (currentCharIndex > 0) {
					setCurrentWordIndex(currentWordIndex + 1);
					setCurrentCharIndex(0);
				}
				return;
			}

			// Type character
			const newWordStates = [...wordStates];
			newWordStates[currentWordIndex].typed += e.key;
			setWordStates(newWordStates);
			setCurrentCharIndex(currentCharIndex + 1);

			// Update live accuracy and WPM
			const totalTyped = wordStates.reduce((acc, state) => acc + state.typed.length, 0) + 1;
			const correctTyped = wordStates.reduce((acc, state, idx) => {
				const word = words[idx];
				const thisTyped = idx === currentWordIndex ? newWordStates[currentWordIndex].typed : state.typed;
				return acc + getCorrectCharsForWord(thisTyped, word);
			}, 0);
			setLiveAccuracy(totalTyped > 0 ? Math.round((correctTyped / totalTyped) * 100) : 100);

			if (startTime) {
				const elapsed = (Date.now() - startTime) / 1000;
				const minutes = elapsed / 60;
				if (minutes > 0) {
					const wpm = correctTyped / 5 / minutes;
					setLiveWpm(Math.max(0, Math.round(wpm)));
				}
			}
		},
		[isActive, startTime, currentWordIndex, currentCharIndex, words, wordStates, onStart, getCorrectCharsForWord]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const restart = () => {
		resetTest();
		generateNewText();
	};

	const renderWords = () => {
		return words.map((word, wordIndex) => {
			const wordState = wordStates[wordIndex] || { typed: "" };
			const typed = wordState.typed;
			const typedLen = typed.length;
			const wordLen = word.length;
			const isCurrent = wordIndex === currentWordIndex;
			const displayLen = Math.max(typedLen, wordLen);
			const chars: React.ReactNode[] = [];

			for (let pos = 0; pos < displayLen; pos++) {
				const targetChar = pos < wordLen ? word[pos] : undefined;
				const typedChar = pos < typedLen ? typed[pos] : undefined;
				let displayChar: string;
				let className: string;

				const isPast = !isCurrent || pos < currentCharIndex;
				const isCurrPos = isCurrent && pos === currentCharIndex;

				if (typedChar !== undefined) {
					displayChar = typedChar;
					if (isPast) {
						className = typedChar === targetChar 
							? "text-success" 
							: "text-destructive";
					} else {
						className = "text-foreground";
					}
				} else {
					displayChar = targetChar || " ";
					if (isCurrPos) {
						className = "text-foreground border-b-2 border-primary";
					} else {
						className = "text-muted-foreground/60";
					}
				}

				chars.push(
					<span key={pos} className={cn("font-mono text-2xl md:text-3xl", className)}>
						{displayChar}
					</span>
				);
			}

			let wordContent = chars;
			if (isCurrent) {
				const caretElement = (
					<span
						key="caret"
						ref={caretRef}
						className="inline-block w-0.5 h-8 bg-gradient-to-b from-primary to-primary/60 ml-0.5 animate-caret shadow-sm"
						style={{ verticalAlign: "text-bottom" }}
					/>
				);
				wordContent = [
					...chars.slice(0, currentCharIndex),
					caretElement,
					...chars.slice(currentCharIndex),
				];
			}

			return <span key={wordIndex} className="inline-block mr-4">{...wordContent}</span>;
		});
	};

	const progress =
		mode === "words"
			? (currentWordIndex / Math.max(1, words.length)) * 100
			: startTime
			? ((Date.now() - startTime) / 1000 / timeLimit) * 100
			: 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header with Live Stats */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
						Typing Test
					</h1>
					<p className="text-lg text-muted-foreground mb-8">
						Test your typing speed and accuracy
					</p>

					{/* Live Stats Bar - Always reserve space to prevent layout shift */}
					<div className="h-20 flex items-center justify-center">
						{(isTyping || (mode === "time" && startTime)) && (
							<div className="inline-flex items-center gap-8 px-8 py-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
								<div className="flex items-center gap-3">
									<div className="w-3 h-3 rounded-full bg-success animate-pulse" />
									<div className="text-center">
										<div className="text-3xl font-bold text-foreground tabular-nums">{liveWpm}</div>
										<div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">WPM</div>
									</div>
								</div>

								<div className="w-px h-8 bg-border/30" />

								<div className="flex items-center gap-3">
									<div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
									<div className="text-center">
										<div className="text-3xl font-bold text-foreground tabular-nums">{liveAccuracy}%</div>
										<div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Accuracy</div>
									</div>
								</div>

								{mode === "time" && (
									<>
										<div className="w-px h-8 bg-border/30" />
										<div className="flex items-center gap-3">
											<div className={`w-3 h-3 rounded-full ${timeRemaining <= 10 ? 'bg-destructive animate-pulse' : 'bg-muted-foreground'}`} />
											<div className="text-center">
												<div className={`text-3xl font-bold tabular-nums ${timeRemaining <= 10 ? 'text-destructive' : 'text-foreground'}`}>
													{Math.ceil(timeRemaining)}
												</div>
												<div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Time</div>
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Main Typing Area */}
				<div className="relative">
					{/* Progress Bar */}
					<div className="top-0 left-0 right-0 h-2 bg-muted/50 rounded-full overflow-hidden shadow-inner">
						<div 
							className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out shadow-lg"
							style={{ width: `${Math.min(100, progress)}%` }}
						/>
					</div>

					{/* Typing Container */}
					<div
						ref={containerRef}
						className="relative p-10 md:p-16 mt-6 rounded-3xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border border-border/30 shadow-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:ring-offset-2 cursor-text transition-all duration-300 hover:shadow-3xl hover:border-border/50"
						tabIndex={0}
						onClick={() => containerRef.current?.focus()}
					>
						{/* Word Display */}
						<div className="leading-relaxed select-none text-2xl md:text-3xl font-mono tracking-wide">
							{renderWords()}
						</div>

						{/* Start Screen Overlay */}
						{!isActive && (
							<div className="absolute inset-0 bg-background/95 backdrop-blur-md rounded-3xl flex items-center justify-center border border-border/30">
								<div className="text-center space-y-6 max-w-md">
									<div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
										<svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
									</div>
									<div>
										<h2 className="text-2xl font-bold text-foreground mb-2">Ready to test your speed?</h2>
										<p className="text-muted-foreground">Click anywhere and start typing to begin the test</p>
									</div>
									<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
										<div className="flex items-center gap-2">
											<kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Space</kbd>
											<span>next word</span>
										</div>
										<div className="flex items-center gap-2">
											<kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Backspace</kbd>
											<span>undo</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center justify-center gap-4 mt-8">
					<button
						onClick={restart}
						className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
						title="Restart test"
					>
						<RotateCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
						<span className="font-medium">Restart Test</span>
					</button>
				</div>

				{/* Instructions */}
				{isActive && !isTyping && (
					<div className="text-center mt-6">
						<div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full text-sm text-muted-foreground">
							<div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
							Type the words as they appear • Press space to move to next word
						</div>
					</div>
				)}
			</div>
		</div>
	);
}