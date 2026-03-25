"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/");
	}

	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			{session?.user && (
				<p className="text-muted-foreground">
					Welcome, {session.user.name ?? session.user.email}
				</p>
			)}
			<Button variant="outline" onClick={handleSignOut}>
				Sign out
			</Button>
		</div>
	);
}
