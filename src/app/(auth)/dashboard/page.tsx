import { SignOutButton } from "@/components/SignOutButton";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getProjects(orgId: string) {
	return prisma.project.findMany({
		where: { orgId },
	});
}

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/");
	}

	const projects = await getProjects(session.user.orgId);

	return (
		<div className="flex flex-1 flex-col gap-8 p-8 max-w-4xl mx-auto w-full">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome, {session.user.name ?? session.user.email}
					</p>
				</div>
				<SignOutButton />
			</div>

			<section>
				<h2 className="text-lg font-medium mb-4">Projects</h2>
				{projects.length === 0 ? (
					<p className="text-muted-foreground text-sm">No projects found.</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{projects.map((project) => (
							<Card key={project.id}>
								<Link href={`/projects/${project.id}`}>
									<CardHeader>
										<CardTitle className="text-base">{project.name}</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xs text-muted-foreground">
											Created {new Date(project.createdAt).toLocaleDateString()}
										</p>
									</CardContent>
								</Link>
							</Card>
						))}
					</div>
				)}
			</section>
		</div>
	);
}
