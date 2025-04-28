import fs from 'fs/promises';

const data = await fs.readFile(`config.json`, 'utf8');

export type RepoConfig = {
  nameStarts: string;
  min: number;
  max: number;
  copyFrom: string;
  replaceInFile: string;
};
export const configs = JSON.parse(data) as RepoConfig[];
