"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
	const router = useRouter();
	const handleSignOut = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push("/");
				}
			}
		})
	} 

	return (
		<Button variant="outline" onClick={handleSignOut}>
			Sign out
		</Button>
	)
}
