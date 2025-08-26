import { promises as fs } from "fs";

const FilesManager: {
  readFile: (path: string, encoding?: BufferEncoding) => Promise<string>;
  writeFile: (
    path: string,
    data: string | Buffer,
    encoding?: BufferEncoding
  ) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  deleteFile: (path: string) => Promise<void>;
  mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
  readdir: (path: string) => Promise<string[]>;
} = {
  async readFile(
    path: string,
    encoding: BufferEncoding = "utf8"
  ): Promise<string> {
    return await fs.readFile(path, { encoding });
  },

  async writeFile(
    path: string,
    data: string | Buffer,
    encoding: BufferEncoding = "utf8"
  ): Promise<void> {
    await fs.writeFile(path, data, { encoding });
  },

  async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  },

  async deleteFile(path: string): Promise<void> {
    await fs.unlink(path);
  },

  async mkdir(
    path: string,
    options: { recursive?: boolean } = { recursive: true }
  ): Promise<void> {
    await fs.mkdir(path, options);
  },

  async readdir(path: string): Promise<string[]> {
    return await fs.readdir(path);
  },
};

export default FilesManager;
