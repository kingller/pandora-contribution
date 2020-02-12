#!/usr/bin/env node

import * as fs from "fs";
import * as util from "util";
import * as path from "path";
import * as _ from "lodash";
const exec = util.promisify(require("child_process").exec);

const PROCESS_PATH = process.cwd();
const OUTPUT_PATH = process.argv[2];

const success = msg => console.warn(`\u001b[32mSUCCESS: ${msg}\u001b[39m`);
const error = msg => console.error(`\u001b[31mERROR: ${msg}\u001b[39m`);

const contributionCommand = `git log --since='<%= startDate %>' --until='<%= endDate %>' --format='%aN' | sort -u | while read name; do echo "$name"; git log --since='<%= startDate %>' --until='<%= endDate %>' --author="$name" --numstat --pretty=tformat: --no-merges | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added: %s, removed: %s, total: %s\\n", add, subs, loc }' -; done`;

function getContributionValue(
  contributionStr: string,
  propertyName: string
): number {
  let matches = contributionStr.match(
    new RegExp(`${propertyName}:\\s*(\\d+)`, "i")
  );
  if (matches) {
    return parseInt(matches[1]);
  }
  return 0;
}

async function getYearContribution(year: number) {
  const pandoraContributionInfo = await exec(
    _.template(contributionCommand)({
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    })
  );
  let contributions = [];
  if (pandoraContributionInfo.stdout) {
    let { stdout } = pandoraContributionInfo;
    let outputArray = stdout.split("\n");
    for (let i = 0; i < outputArray.length; i = i + 2) {
      if (i + 1 >= outputArray.length) {
        break;
      }
      const contributionStr = outputArray[i + 1];
      const personContribution = {
        name: outputArray[i],
        added: getContributionValue(contributionStr, "added"),
        removed: getContributionValue(contributionStr, "removed"),
        total: getContributionValue(contributionStr, "total")
      };
      if (
        personContribution.added ||
        personContribution.removed ||
        personContribution.total
      ) {
        contributions.push(personContribution);
      }
    }
  }
  return contributions;
}

async function getContribution() {
  const today = new Date();
  const year = today.getFullYear();
  const pandoraContributionInfo = await getYearContribution(year);
  const pandoraLastYearContributionInfo = await getYearContribution(year - 1);
  return {
    [year.toString()]: pandoraContributionInfo,
    [(year - 1).toString()]: pandoraLastYearContributionInfo
  };
}

async function writeContributionFile(outputPath, source) {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
  }
  await util.promisify(fs.writeFile)(
    path.join(outputPath, "contribution.js"),
    source
  );
}

async function contribute() {
  try {
    console.time("Total time");

    const contributionInfo = await getContribution();
    await writeContributionFile(
      OUTPUT_PATH || PROCESS_PATH,
      "module.exports = " + JSON.stringify(contributionInfo, null, 4)
    );

    success("生成贡献值成功");
    console.timeEnd("Total time");
  } catch (e) {
    error(`生成贡献值失败\n${e}`);
  }
}

contribute();
