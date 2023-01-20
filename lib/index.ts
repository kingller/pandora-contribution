#!/usr/bin/env node

import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as _ from 'lodash';
const exec = util.promisify(require('child_process').exec);

const PROCESS_PATH = process.cwd();
const argv = require('yargs').argv;
const OUTPUT_PATH = argv.outDir;
const IS_LOG = argv.log;
const SEARCH_PATH = (argv._ as string[]).map((p) => `'${p}'`).join(' ');

const success = (msg) => console.warn(`\u001b[32mSUCCESS: ${msg}\u001b[39m`);
const error = (msg) => console.error(`\u001b[31mERROR: ${msg}\u001b[39m`);

const contributionCommand = `git log --since='<%= startDate %>' --until='<%= endDate %>' --format='%aN' | sort -u | while read name; do echo "$name"; git log --since='<%= startDate %>' --until='<%= endDate %>' --author="$name" --numstat --pretty=tformat: --no-merges ${
    SEARCH_PATH ? '-- ' + SEARCH_PATH : ''
} | awk '{ add += $1; subs += $2; loc += $1 + $2 } END { printf "added: %s, removed: %s, total: %s\\n", add, subs, loc }' -; done`;

interface IUserContribution {
    name: string;
    added: number;
    removed: number;
    total: number;
}

interface IData {
    createDate: string;
    data: IUserContribution[];
}

function isExits(path: string) {
    return fs.existsSync(path);
}

function getOutputPath() {
    return OUTPUT_PATH || PROCESS_PATH;
}

function getOutputFilePath(year: number) {
    return path.join(getOutputPath(), `${year}.json`);
}

function getContributionValue(contributionStr: string, propertyName: string): number {
    let matches = contributionStr.match(new RegExp(`${propertyName}:\\s*(\\d+)`, 'i'));
    if (matches) {
        return parseInt(matches[1]);
    }
    return 0;
}

async function writeContributionFile(source: string, year: number) {
    const outputPath = getOutputPath();
    if (!isExits(outputPath)) {
        fs.mkdirSync(outputPath);
    }
    await util.promisify(fs.writeFile)(getOutputFilePath(year), source);
    console.log(`生成贡献值文件：${year}.json`);
}

async function generateYearContribution(year: number) {
    const command = _.template(contributionCommand)({
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31 23:59:59`,
    });
    if (IS_LOG) {
        console.log(command);
    }
    const pandoraContributionInfo = await exec(command);
    let contributions: IUserContribution[] = [];
    if (pandoraContributionInfo.stdout) {
        if (IS_LOG) {
            console.log(pandoraContributionInfo.stdout);
        }
        let { stdout } = pandoraContributionInfo;
        let outputArray = stdout.split('\n');
        for (let i = 0; i < outputArray.length; i = i + 2) {
            if (i + 1 >= outputArray.length) {
                break;
            }
            const contributionStr = outputArray[i + 1];
            const personContribution: IUserContribution = {
                name: outputArray[i],
                added: getContributionValue(contributionStr, 'added'),
                removed: getContributionValue(contributionStr, 'removed'),
                total: getContributionValue(contributionStr, 'total'),
            };
            if (personContribution.added || personContribution.removed || personContribution.total) {
                contributions.push(personContribution);
            }
        }
    }
    const now = new Date();
    const createDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const data: IData = {
        createDate,
        data: contributions,
    };
    const source = JSON.stringify(data, null, 2);
    await writeContributionFile(source, year);
}

async function isNeedGenerate(year: number): Promise<boolean> {
    const filePath = getOutputFilePath(year);
    if (!isExits(filePath)) {
        return true;
    }
    const fileContent = await util.promisify(fs.readFile)(filePath);
    if (fileContent) {
        const fileContentStr = fileContent.toString();
        if (fileContentStr) {
            let data = JSON.parse(fileContentStr) as IData;
            // 判断创建日期，创建日期晚于该年时说明创建时已是历史数据，无需再次生成
            if (data.createDate) {
                const yearMatches = data.createDate.match(/^\d+/);
                if (yearMatches) {
                    const createYear = parseInt(yearMatches[0]);
                    if (createYear > year) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

async function generateContribution() {
    const today = new Date();
    const year = today.getFullYear();
    await generateYearContribution(year);

    const lastYear = year - 1;
    const needGenerate = await isNeedGenerate(lastYear);
    if (needGenerate) {
        await generateYearContribution(lastYear);
    }
}

async function contribute() {
    try {
        console.time('Total time');

        await generateContribution();

        success('生成贡献值成功');
        console.timeEnd('Total time');
    } catch (e) {
        error(`生成贡献值失败\n${e}`);
    }
}

contribute();
