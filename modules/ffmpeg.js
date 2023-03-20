/*
 * ffmpeg.js - simple FFMPEG wrapper for producing thumbnails
 * Lance Crisang - 2023
 *
 * Requires an installation of FFMPEG.
 */
import { promisify } from "util";
import { exec } from "child_process";

const execP = promisify(exec);

export async function getFFMPEGVersion() {
  const { stdout } = await execP("ffmpeg -version");
  const lines = stdout.split(" ");
  return lines[2];
}

export async function generateThumbnail(sourceFile, destinationFile, width) {
  const result = await execP(
    `ffmpeg -i "${sourceFile}" -ss 00:00:00.000 -vframes 1 -vf scale=${width}:-2 "${destinationFile}"`
  );
  if (result.code != undefined && result.code !== 0) {
    throw new Error(`FFMPEG exited with code ${result.code}`);
  }
}