import { Octokit } from '@octokit/rest';
import { AxiosError } from 'axios';
import chalk from 'chalk';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const errorStyle = chalk.bold.red;
const successStyle = chalk.bold.green;
const vaporStyle = chalk.bgMagenta.bold.cyan;

dotenv.config({
  path: '.env.local',
});
const owner = 'woophi';
const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

const config = {
  nameStarts: 'ghk_4289_',
  min: 2,
  max: 3,
  copyFrom: '../ghk_4289_1',
  analyticsVariant: 'var',
  replaceInFile: 'ghk_4289_1',
};

const createRepo = async (repoName: string) => {
  try {
    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
    });

    console.log(vaporStyle(`Repository created,`), response.data.ssh_url);
    return response.data.ssh_url;
  } catch (e) {
    const error = e as AxiosError;
    console.error('Error creating repository:', error.response ? error.response.data : error.message);
  }
};

const execCommand = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
};

const replaceInFile = (filePath: string, searchValue: string | RegExp, replaceValue: string): void => {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(searchValue, 'g');
  const updatedContent = fileContent.replace(regex, replaceValue);
  fs.writeFileSync(filePath, updatedContent, 'utf8');
};

const copyDirectoryRecursiveSync = (source: string, destination: string, omitDirs: string[]): void => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    // Skip the directory you want to omit
    if (entry.isDirectory() && omitDirs.includes(entry.name)) {
      console.log(vaporStyle('Omitting directory:'), srcPath);
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectoryRecursiveSync(srcPath, destPath, omitDirs);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const cloneRepo = async (sshLink: string) => {
  const commandToClone = `cd ../ && git clone ${sshLink}`;

  try {
    await execCommand(commandToClone);
  } catch (error) {
    console.error('unable to clone repository', sshLink, error);
  }
};

const commitChanges = async (directory: string) => {
  const command = `cd ../${directory} && git add . && git commit -m "init" && git push`;

  try {
    await execCommand(command);
  } catch (error) {
    console.error('unable to push chnages repository', directory, error);
  }
};

const updatePagesSettings = async (repo: string) => {
  try {
    await octokit.rest.repos.createPagesSite({
      owner,
      repo,
      source: {
        branch: 'gh-pages',
      },
    });

    console.log(vaporStyle('GitHub Pages branch updated to: gh-pages'));
  } catch (e) {
    const error = e as AxiosError;
    console.error('Error updating GitHub Pages settings:', error.response ? error.response.data : error.message);
  }
};

const wait = (ms: number) => new Promise<void>(res => setTimeout(() => res(), ms));

for (let index = config.min; index <= config.max; index++) {
  const repoName = `${config.nameStarts}${index}`;
  console.debug(successStyle('START with'), repoName);
  const sshLink = await createRepo(repoName);
  if (sshLink) {
    await cloneRepo(sshLink);
    copyDirectoryRecursiveSync(config.copyFrom, `../${repoName}`, ['node_modules', '.git']);
    replaceInFile(`../${repoName}/package.json`, config.replaceInFile, repoName);
    replaceInFile(`../${repoName}/src/ls/index.ts`, config.replaceInFile, repoName);
    replaceInFile(`../${repoName}/src/utils/events.ts`, 'var1', `var${index}`);
    replaceInFile(`../${repoName}/src/App.tsx`, '_var1', `_var${index}`);
    replaceInFile(`../${repoName}/src/thx/ThxLayout.tsx`, '_var1', `_var${index}`);

    await commitChanges(repoName);
  }
}

console.debug(vaporStyle('Waiting two minutes'));

for (let index = 0; index < 120; index++) {
  await wait(1000);
  const left = 120 - index;
  console.debug(vaporStyle('Time left is'), `${left > 60 ? 1 : 0}:${left > 60 ? left - 60 : left}`);
}

for (let index = config.min; index <= config.max; index++) {
  const repoName = `${config.nameStarts}${index}`;
  console.debug(vaporStyle('create pages for'), repoName);
  await updatePagesSettings(repoName);
}

for (let index = config.min; index <= config.max; index++) {
  const repoName = `${config.nameStarts}${index}`;
  console.debug(errorStyle('url'), `https://woophi.github.io/${repoName}`);
}
