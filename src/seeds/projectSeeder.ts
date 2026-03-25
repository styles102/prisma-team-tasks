import { prisma } from "../lib/prisma";

export const projectSeeder = async() => {
	const projects = await prisma.project.findMany();

	if(projects.length > 0) return;

	const organisations = await prisma.organization.findMany();

	const projPromises = [];
	for(const org of organisations) {
		projPromises.push(
			prisma.project.create({
				data: {
					name: "Website Rebuild",
					orgId: org.id
				}
			})
		);
	}

	await Promise.all(projPromises);
}
