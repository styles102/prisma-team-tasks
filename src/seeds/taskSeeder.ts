import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";

export const taskSeeder = async() => {
	const tasks = await prisma.task.findMany();

	if(tasks.length > 0) return;

	const projects = await prisma.project.findMany();

	const taskPromises = [];
	for(const proj of projects) {
		const users = await prisma.user.findMany({
			where: { orgId: { equals: proj.orgId }}
		})
		taskPromises.push(
			prisma.task.create({
				data: {
					title: faker.company.buzzNoun(),
					orgId: proj.orgId,
					projectId: proj.id
				}
			})
		);

		const user = users[Math.floor(Math.random() * 5)];
		if(user) {
			taskPromises.push(
				prisma.task.create({
					data: {
						title: faker.company.buzzNoun(),
						orgId: proj.orgId,
						projectId: proj.id,
						assigneeId: user.id
					}
				})
			);
		}
	}

	await Promise.all(taskPromises);
}
