import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
	console.error(
		"Missing Supabase environment variables. Check your .env file."
	);
}

export const supabase = createClient<Database>(
	SUPABASE_URL as string,
	SUPABASE_ANON_KEY as string,
	{
		auth: {
			storage: localStorage,
			persistSession: true,
			autoRefreshToken: true,
		},
	}
);
