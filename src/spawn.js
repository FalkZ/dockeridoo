import { spawn } from "child_process";

function splitCommand(command) {
	const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
	const args = [];
	let match;
	while ((match = regex.exec(command))) {
		args.push(match[1] ? match[1] : match[2] ? match[2] : match[0]);
	}
	return args;
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ showStdout?: boolean, hideStderr?: boolean }} options
 * @returns {Promise<void>}
 */
export const spawnBase = (
	command,
	args,
	{ showStdout = false, hideStderr = false } = {}
) => {
	return new Promise((resolve, reject) => {
		const childProcess = spawn(command, args);

		if (showStdout) {
			childProcess.stdout.pipe(process.stdout);
		}

		if (!hideStderr) {
			childProcess.stderr.pipe(process.stderr);
		}

		childProcess.on("close", (code) => {
			if (code !== 0) {
				reject(
					new Error(`${command} ${args.join(" ")} exited with code ${code}`)
				);
			} else {
				resolve();
			}
		});
	});
};

/**
 *
 * @param {string} command
 * @param {{ showStdout?: boolean, hideStderr?: boolean }} showStdout
 * @returns
 */
export const spawnSimple = (
	command,
	{ showStdout = false, hideStderr = false } = {}
) => {
	const [commandName, ...args] = splitCommand(command).filter((arg) => arg);
	return spawnBase(commandName, args, { showStdout, hideStderr });
};
