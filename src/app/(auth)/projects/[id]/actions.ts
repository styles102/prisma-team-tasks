"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function updateTaskStatus(taskId: string, status: string) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error("Unauthorized");

	await prisma.task.update({
		where: { id: taskId },
		data: { status: status as "TODO" | "IN_PROGRESS" | "DONE" },
	});
}

export async function createTask(data: {
	title: string;
	description: string;
	dueDate: string;
	status: string;
	projectId: string;
	orgId: string;
	assignToMe: boolean;
}) {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) throw new Error("Unauthorized");

	await prisma.task.create({
		data: {
			title: data.title,
			description: data.description || null,
			dueDate: data.dueDate ? new Date(data.dueDate) : null,
			status: data.status as "TODO" | "IN_PROGRESS" | "DONE",
			projectId: data.projectId,
			orgId: data.orgId,
			assigneeId: data.assignToMe ? session.user.id : null,
		},
	});

	revalidatePath(`/dashboard/projects/${data.projectId}`);
}
