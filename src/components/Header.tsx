import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut, User, Trophy } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
	const { user, signOut } = useAuth();

	return (
		<header className="border-b border-border">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<Link to="/" className="flex items-center gap-2">
						<span className="font-mono text-2xl font-bold">Broken</span>
						<span className="font-mono text-2xl font-bold text-muted-foreground">
							Keys
						</span>
					</Link>
					
					<nav className="flex items-center gap-4">
						<Button asChild variant="ghost" size="sm">
							<Link to="/" className="gap-2">
								Test
							</Link>
						</Button>
						<Button asChild variant="ghost" size="sm">
							<Link to="/leaderboard" className="gap-2">
								<Trophy className="h-4 w-4" />
								Leaderboard
							</Link>
						</Button>
					</nav>
				</div>

				<div className="flex items-center gap-2">
					<ThemeToggle />

					{user ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9"
								>
									<User className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									disabled
									className="text-muted-foreground"
								>
									{user.email}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={signOut}
									className="gap-2"
								>
									<LogOut className="h-4 w-4" />
									Sign Out
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild variant="default" size="sm">
							<Link to="/auth">Sign In</Link>
						</Button>
					)}
				</div>
			</div>
		</header>
	);
}
