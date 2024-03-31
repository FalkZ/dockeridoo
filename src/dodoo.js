#!/usr/bin/env node

import path from "path";
import { spawnBase, spawnSimple } from "./spawn.js";
import { updatePackage } from "./auto-update.js";

async function waitForDocker() {
	let attempts = 0;
	while (attempts < 30) {
		try {
			await spawnSimple("docker info", {
				hideStderr: true,
			});
			return;
		} catch (error) {
			attempts++;

			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}

	console.error("Docker failed to start.");
	process.exit(1);
}

const startIfNotRunning = async () => {
	try {
		await spawnSimple(
			process.platform === "win32" ? "where docker" : "which docker"
		);
		console.log("Docker is installed.");
	} catch (error) {
		console.log(
			"You have to first install docker: https://docs.docker.com/get-docker/"
		);

		process.exit(1);
	}

	try {
		await spawnSimple("docker info", {
			hideStderr: true,
		});
		console.log("Docker is already running.");
		await updatePackage();
	} catch (error) {
		console.log("Docker is not running. Attempting to start...");
		switch (process.platform) {
			case "win32":
				// For Windows
				await spawnSimple("net start com.docker.service");
				break;
			case "darwin":
				// For MacOS
				await spawnSimple("open --background -a Docker");
				break;
			default:
				// For Linux
				await spawnSimple("sudo service docker start");
				break;
		}

		console.log("Docker has started.");

		await updatePackage();

		await waitForDocker();
	}
};

async function runDockerCommand(image, args) {
	const cwd = process.cwd();
	const commandArgs = [
		"run",
		"--pull=always",
		"--rm",
		"-v",
		`${path.normalize(cwd)}:/workdir`,
		`${image}`,
		...args,
	];

	try {
		await spawnBase("docker", commandArgs, {
			showStdout: true,
		});
	} catch (error) {
		console.error("Failed to run Docker command:", "docker", ...commandArgs);
	}
}

const run = async () => {
	await startIfNotRunning();

	await runDockerCommand(process.argv[2], process.argv.slice(3));
};

run();
