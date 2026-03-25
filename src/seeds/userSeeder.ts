import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";

export const userSeeder = async() => {
	const users = await prisma.user.findMany();

	if(users.length > 0) return;

	const organisations = await prisma.organization.findMany();

	const userPromises = [];
	for(const org of organisations) {
		for(let i = 1; i < 5; i++) {
			userPromises.push(
				prisma.user.create({
					data: {
						email: faker.internet.email(),
						name: faker.person.fullName(),
						orgId: org.id
					}
				})
			);
		}
	}

	await Promise.all(userPromises);
}
