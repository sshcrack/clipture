/*
* Straight up yeeted from https://www.npmjs.com/package/move-file
*/

import path from 'node:path';
import fs, {Mode, promises as fsP} from 'node:fs';
import { existsProm } from '@backend/tools/fs';

export interface MoveFileOptions {
    overwrite?: boolean,
    directoryMode?: Mode
}

export async function moveFile(sourcePath: string, destinationPath: string, {overwrite = true, directoryMode} = {} as MoveFileOptions) {
	if (!sourcePath || !destinationPath) {
		throw new TypeError('`sourcePath` and `destinationPath` required');
	}

	if (!overwrite && await existsProm(destinationPath)) {
		throw new Error(`The destination file exists: ${destinationPath}`);
	}

	await fsP.mkdir(path.dirname(destinationPath), {
		recursive: true,
		mode: directoryMode,
	});

	try {
		await fsP.rename(sourcePath, destinationPath);
	} catch (error) {
		if (error.code === 'EXDEV') {
			await fsP.copyFile(sourcePath, destinationPath);
			await fsP.unlink(sourcePath);
		} else {
			throw error;
		}
	}
}

export function moveFileSync(sourcePath: string, destinationPath: string, {overwrite = true, directoryMode} = {} as MoveFileOptions) {
	if (!sourcePath || !destinationPath) {
		throw new TypeError('`sourcePath` and `destinationPath` required');
	}

	if (!overwrite && fs.existsSync(destinationPath)) {
		throw new Error(`The destination file exists: ${destinationPath}`);
	}

	fs.mkdirSync(path.dirname(destinationPath), {
		recursive: true,
		mode: directoryMode,
	});

	try {
		fs.renameSync(sourcePath, destinationPath);
	} catch (error) {
		if (error.code === 'EXDEV') {
			fs.copyFileSync(sourcePath, destinationPath);
			fs.unlinkSync(sourcePath);
		} else {
			throw error;
		}
	}
}
