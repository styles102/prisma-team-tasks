import { faker } from "@faker-js/faker";
import { prisma } from "../lib/prisma";

export const organisationSeeder = async() => {
	const organisations = await prisma.organization.findMany();

	if(organisations.length > 0) return;

	const orgPromises = [];
	for(let i = 1; i < 5; i++) {
		orgPromises.push(
			prisma.organization.create({
				data: {
					name: faker.company.name(),
				}
			})
		);
	}

	await Promise.all(orgPromises);
}
