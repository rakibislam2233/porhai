import { promises as fs } from "fs";
import path from "path";

export async function saveFileLocally(
  key: string,
  buffer: ArrayBuffer,
): Promise<string> {
  const absolutePath = path.join(process.cwd(), "public", key);
  const directory = path.dirname(absolutePath);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(absolutePath, Buffer.from(buffer));
  return `/${key}`;
}
