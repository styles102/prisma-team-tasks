import { SignOutButton } from "@/components/SignOutButton";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const CARD_ACCENTS = [
	"from-violet-500 to-purple-500",
	"from-blue-500 to-cyan-500",
	"from-emerald-500 to-teal-500",
	"from-orange-500 to-amber-500",
	"from-rose-500 to-pink-500",
	"from-indigo-500 to-blue-500",
];

async function getProjects(orgId: string) {
	return prisma.project.findMany({
		where: { orgId },
		include: { _count: { select: { tasks: true } } },
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
		<div className="flex flex-1 flex-col gap-8 p-8 max-w-5xl mx-auto w-full">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-muted-foreground text-sm mt-0.5">
						Welcome back, {session.user.name ?? session.user.email}
					</p>
				</div>
				<SignOutButton />
			</div>

			{/* Projects */}
			<section>
				<div className="flex items-center justify-between mb-5">
					<h2 className="text-base font-semibold">Projects</h2>
					<span className="text-xs text-muted-foreground">{projects.length} total</span>
				</div>

				{projects.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
						<p className="text-muted-foreground text-sm">No projects yet.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{projects.map((project, i) => {
							const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
							const todoCount = project._count.tasks;
							return (
								<Link
									key={project.id}
									href={`/dashboard/projects/${project.id}`}
									className="group block rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
								>
									{/* Gradient accent bar */}
									<div className={`h-1.5 w-full bg-linear-to-r ${accent}`} />

									<div className="p-5 flex flex-col gap-4">
										<div className="flex items-start justify-between gap-2">
											<h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
												{project.name}
											</h3>
											<span className="text-muted-foreground group-hover:text-foreground transition-colors text-base">
												→
											</span>
										</div>

										<div className="flex items-center justify-between">
											<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
												<span className={`w-1.5 h-1.5 rounded-full bg-linear-to-br ${accent}`} />
												{todoCount} {todoCount === 1 ? "task" : "tasks"}
											</span>
											<span className="text-xs text-muted-foreground">
												{new Date(project.createdAt).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</span>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</section>
		</div>
	);
}
