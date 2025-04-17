import { Octokit } from '@octokit/rest';
import { AxiosError } from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';

const errorStyle = chalk.bold.red;
const vaporStyle = chalk.bgMagenta.bold.cyan;

dotenv.config({
  path: '.env.local',
});
const owner = process.env.GH_OWNER || 'woophi';
const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

const config = {
  nameStarts: 'ghk_4893_',
  min: 1,
  max: 2,
  copyFrom: '../ghk_5010_1',
  replaceInFile: 'ghk_5010_1',
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

for (let index = config.min; index <= config.max; index++) {
  const repoName = `${config.nameStarts}${index}`;
  console.debug(vaporStyle('create pages for'), repoName);
  await updatePagesSettings(repoName);
}

for (let index = config.min; index <= config.max; index++) {
  const repoName = `${config.nameStarts}${index}`;
  console.debug(errorStyle('url'), `https://woophi.github.io/${repoName}`);
}
