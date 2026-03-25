import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ProjectBoard } from "./ProjectBoard";

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) redirect("/");

	const project = await prisma.project.findFirst({
		where: { id, orgId: session.user.orgId },
	});
	if (!project) notFound();

	const tasks = await prisma.task.findMany({
		where: { projectId: id },
		include: {
			assignee: { select: { id: true, name: true, email: true } },
		},
		orderBy: { createdAt: "asc" },
	});

	return (
		<ProjectBoard
			project={project}
			initialTasks={tasks}
			userId={session.user.id}
		/>
	);
}
