import { prisma } from "../lib/prisma";
import { organisationSeeder } from "./organisationSeeder";
import { projectSeeder } from "./projectSeeder";
import { taskSeeder } from "./taskSeeder";
import { userSeeder } from "./userSeeder";

async function main() {
	await organisationSeeder();
	await userSeeder();
	await projectSeeder();
	await taskSeeder();
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
