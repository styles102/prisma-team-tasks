"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError("");
		setLoading(true);

		const { error } = await authClient.signIn.email({ email, password });

		if (error) {
			setError(error.message ?? "Invalid email or password.");
			setLoading(false);
			return;
		}

		router.push("/dashboard");
	}

	return (
		<div className="flex flex-1 items-center justify-center">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Sign in</CardTitle>
					<CardDescription>Enter your credentials to continue.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && (
							<p className="text-sm text-destructive">{error}</p>
						)}
						<Button type="submit" disabled={loading} className="w-full">
							{loading ? "Signing in…" : "Sign in"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
