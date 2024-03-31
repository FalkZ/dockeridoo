import { spawnSimple } from "./spawn.js";

const pnpmExec = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

export const updatePackage = async () => {
	const packageName = "dockeridoo";

	try {
		await spawnSimple(`${pnpmExec} outdated ${packageName}`);

		console.log(`${packageName} is up to date.`);
	} catch (error) {
		console.log(`${packageName} is outdated. Updating...`);

		try {
			await spawnSimple(`${pnpmExec} install ${packageName}@latest`);
		} catch (error) {
			console.error(`Failed to update ${packageName}.`);
		}
	}
};
