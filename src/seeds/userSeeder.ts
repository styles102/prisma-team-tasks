import { faker } from "@faker-js/faker";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../lib/prisma";

export const userSeeder = async() => {
	const users = await prisma.user.findMany();

	if(users.length > 0) return;

	const organisations = await prisma.organization.findMany();
	const hashedPassword = await hashPassword("Test123!");

	const userPromises = [];
	for(const org of organisations) {
		for(let i = 1; i < 5; i++) {
			userPromises.push(
				prisma.user.create({
					data: {
						email: faker.internet.email().toLowerCase(),
						name: faker.person.fullName(),
						emailVerified: true,
						orgId: org.id,
						accounts: {
							create: {
								id: faker.string.uuid(),
								accountId: faker.string.uuid(),
								providerId: "credential",
								password: hashedPassword,
							}
						}
					}
				})
			);
		}
	}

	await Promise.all(userPromises);
}
