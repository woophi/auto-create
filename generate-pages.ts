import { Octokit } from '@octokit/rest';
import { AxiosError } from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { configs, RepoConfig } from './data.js';

const errorStyle = chalk.bold.red;
const vaporStyle = chalk.bgMagenta.bold.cyan;

dotenv.config({
  path: '.env.local',
});
const owner = process.env.GH_OWNER || 'woophi';
const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

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

const runPageCmd = async (cfg: RepoConfig) => {
  for (let index = cfg.min; index <= cfg.max; index++) {
    const repoName = `${cfg.nameStarts}${index}`;
    console.debug(vaporStyle('create pages for'), repoName);
    await updatePagesSettings(repoName);
  }

  for (let index = cfg.min; index <= cfg.max; index++) {
    const repoName = `${cfg.nameStarts}${index}`;
    console.debug(errorStyle('url'), `https://${owner}.github.io/${repoName}`);
  }
};

const run = async () => {
  for (const cfg of configs) {
    await runPageCmd(cfg);
  }
};

await run();
