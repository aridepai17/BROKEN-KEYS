import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TestMode, WordLimit, TimeLimit } from "./ModeSelector";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, User, Globe } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
	id: string;
	user_id: string;
	wpm: number;
	accuracy: number;
	created_at: string;
	display_name: string | null;
}

interface LeaderboardProps {
	mode: TestMode;
	wordLimit: WordLimit;
	timeLimit: TimeLimit;
}

export function Leaderboard({ mode, wordLimit, timeLimit }: LeaderboardProps) {
	const { user } = useAuth();
	const [globalEntries, setGlobalEntries] = useState<LeaderboardEntry[]>([]);
	const [personalEntries, setPersonalEntries] = useState<LeaderboardEntry[]>(
		[]
	);
	const [loading, setLoading] = useState(true);
	const limitValue = mode === "words" ? wordLimit : timeLimit;

	useEffect(() => {
		const fetchLeaderboards = async () => {
			setLoading(true);

			// Fetch global leaderboard
			const { data: globalData, error: globalError } = await supabase
				.from("highscores")
				.select(
					`
          id,
          user_id,
          wpm,
          accuracy,
          created_at,
          profiles!highscores_user_id_fkey (display_name)
        `
				)
				.eq("mode", mode)
				.eq("limit_value", limitValue)
				.order("wpm", { ascending: false })
				.limit(10);

			if (globalError) {
				console.error(
					"Failed to fetch global leaderboard:",
					globalError
				);
			} else {
				const transformedGlobal =
					globalData?.map((entry: any) => ({
						id: entry.id,
						user_id: entry.user_id,
						wpm: entry.wpm,
						accuracy: entry.accuracy,
						created_at: entry.created_at,
						display_name:
							entry.profiles?.display_name || "Anonymous",
					})) || [];
				setGlobalEntries(transformedGlobal);
			}

			// Fetch personal leaderboard if user is logged in
			if (user) {
				const { data: personalData, error: personalError } =
					await supabase
						.from("highscores")
						.select(
							`
            id,
            user_id,
            wpm,
            accuracy,
            created_at,
            profiles!highscores_user_id_fkey (display_name)
          `
						)
						.eq("mode", mode)
						.eq("limit_value", limitValue)
						.eq("user_id", user.id)
						.order("wpm", { ascending: false })
						.limit(10);

				if (personalError) {
					console.error(
						"Failed to fetch personal leaderboard:",
						personalError
					);
				} else {
					const transformedPersonal =
						personalData?.map((entry: any) => ({
							id: entry.id,
							user_id: entry.user_id,
							wpm: entry.wpm,
							accuracy: entry.accuracy,
							created_at: entry.created_at,
							display_name:
								entry.profiles?.display_name || "Anonymous",
						})) || [];
					setPersonalEntries(transformedPersonal);
				}
			}

			setLoading(false);
		};

		fetchLeaderboards();
	}, [mode, limitValue, user]);

	const getRankIcon = (rank: number) => {
		if (rank === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
		if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
		if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
		return (
			<span className="w-4 text-center text-muted-foreground">
				{rank}
			</span>
		);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
		});
	};

	const renderEntries = (
		entries: LeaderboardEntry[],
		isPersonal: boolean = false
	) => {
		if (entries.length === 0) {
			return (
				<p className="text-center text-muted-foreground py-8">
					{isPersonal
						? "You haven't set any scores yet. Start typing!"
						: "No scores yet. Be the first!"}
				</p>
			);
		}

		return (
			<div className="space-y-2">
				{entries.map((entry, index) => (
					<div
						key={entry.id}
						className={cn(
							"flex items-center gap-4 p-3 rounded-lg border border-border",
							entry.user_id === user?.id
								? "bg-primary/5"
								: "bg-card"
						)}
					>
						<div className="flex items-center justify-center w-6">
							{getRankIcon(index + 1)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-medium truncate">
								{isPersonal
									? formatDate(entry.created_at)
									: entry.display_name}
								{!isPersonal && entry.user_id === user?.id && (
									<span className="text-xs text-muted-foreground ml-2">
										(you)
									</span>
								)}
							</p>
						</div>
						<div className="text-right">
							<p className="font-mono font-bold">
								{Math.round(entry.wpm)} wpm
							</p>
							<p className="text-xs text-muted-foreground">
								{entry.accuracy.toFixed(1)}% acc
							</p>
						</div>
					</div>
				))}
			</div>
		);
	};

	const LoadingSkeleton = () => (
		<div className="space-y-2">
			{[...Array(5)].map((_, i) => (
				<div
					key={i}
					className="h-12 bg-secondary animate-pulse rounded-lg"
				/>
			))}
		</div>
	);

	return (
		<div className="w-full max-w-md mx-auto">
			<h3 className="text-lg font-semibold mb-4 text-center">
				Leaderboard -{" "}
				{mode === "words" ? `${limitValue} words` : `${limitValue}s`}
			</h3>

			<Tabs defaultValue="global" className="w-full">
				<TabsList className="w-full mb-4">
					<TabsTrigger value="global" className="flex-1 gap-2">
						<Globe className="h-4 w-4" />
						Global
					</TabsTrigger>
					<TabsTrigger value="personal" className="flex-1 gap-2">
						<User className="h-4 w-4" />
						Personal
					</TabsTrigger>
				</TabsList>

				<TabsContent value="global">
					{loading ? (
						<LoadingSkeleton />
					) : (
						renderEntries(globalEntries)
					)}
				</TabsContent>

				<TabsContent value="personal">
					{!user ? (
						<p className="text-center text-muted-foreground py-8">
							Sign in to see your personal best scores
						</p>
					) : loading ? (
						<LoadingSkeleton />
					) : (
						renderEntries(personalEntries, true)
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
