#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var util = require("util");
var path = require("path");
var _ = require("lodash");
var exec = util.promisify(require("child_process").exec);
var PROCESS_PATH = process.cwd();
var argv = require('yargs').argv;
var OUTPUT_PATH = argv.outDir;
var IS_LOG = argv.log;
var success = function (msg) { return console.warn("\u001B[32mSUCCESS: " + msg + "\u001B[39m"); };
var error = function (msg) { return console.error("\u001B[31mERROR: " + msg + "\u001B[39m"); };
var contributionCommand = "git log --since='<%= startDate %>' --until='<%= endDate %>' --format='%aN' | sort -u | while read name; do echo \"$name\"; git log --since='<%= startDate %>' --until='<%= endDate %>' --author=\"$name\" --numstat --pretty=tformat: --no-merges | awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf \"added: %s, removed: %s, total: %s\\n\", add, subs, loc }' -; done";
function isExits(path) {
    return fs.existsSync(path);
}
function getOutputPath() {
    return OUTPUT_PATH || PROCESS_PATH;
}
function getOutputFilePath(year) {
    return path.join(getOutputPath(), year + ".json");
}
function getContributionValue(contributionStr, propertyName) {
    var matches = contributionStr.match(new RegExp(propertyName + ":\\s*(\\d+)", "i"));
    if (matches) {
        return parseInt(matches[1]);
    }
    return 0;
}
function writeContributionFile(source, year) {
    return __awaiter(this, void 0, void 0, function () {
        var outputPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    outputPath = getOutputPath();
                    if (!isExits(outputPath)) {
                        fs.mkdirSync(outputPath);
                    }
                    return [4 /*yield*/, util.promisify(fs.writeFile)(getOutputFilePath(year), source)];
                case 1:
                    _a.sent();
                    console.log("\u751F\u6210\u8D21\u732E\u503C\u6587\u4EF6\uFF1A" + year + ".json");
                    return [2 /*return*/];
            }
        });
    });
}
function generateYearContribution(year) {
    return __awaiter(this, void 0, void 0, function () {
        var command, pandoraContributionInfo, contributions, stdout, outputArray, i, contributionStr, personContribution, now, createDate, data, source;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    command = _.template(contributionCommand)({
                        startDate: year + "-01-01",
                        endDate: year + "-12-31"
                    });
                    if (IS_LOG) {
                        console.log(command);
                    }
                    return [4 /*yield*/, exec(command)];
                case 1:
                    pandoraContributionInfo = _a.sent();
                    contributions = [];
                    if (pandoraContributionInfo.stdout) {
                        if (IS_LOG) {
                            console.log(pandoraContributionInfo.stdout);
                        }
                        stdout = pandoraContributionInfo.stdout;
                        outputArray = stdout.split("\n");
                        for (i = 0; i < outputArray.length; i = i + 2) {
                            if (i + 1 >= outputArray.length) {
                                break;
                            }
                            contributionStr = outputArray[i + 1];
                            personContribution = {
                                name: outputArray[i],
                                added: getContributionValue(contributionStr, "added"),
                                removed: getContributionValue(contributionStr, "removed"),
                                total: getContributionValue(contributionStr, "total")
                            };
                            if (personContribution.added ||
                                personContribution.removed ||
                                personContribution.total) {
                                contributions.push(personContribution);
                            }
                        }
                    }
                    now = new Date();
                    createDate = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
                    data = {
                        createDate: createDate,
                        data: contributions
                    };
                    source = JSON.stringify(data, null, 2);
                    return [4 /*yield*/, writeContributionFile(source, year)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function isNeedGenerate(year) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, fileContent, fileContentStr, data, yearMatches, createYear;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePath = getOutputFilePath(year);
                    if (!isExits(filePath)) {
                        return [2 /*return*/, true];
                    }
                    return [4 /*yield*/, util.promisify(fs.readFile)(filePath)];
                case 1:
                    fileContent = _a.sent();
                    if (fileContent) {
                        fileContentStr = fileContent.toString();
                        if (fileContentStr) {
                            data = JSON.parse(fileContentStr);
                            // 判断创建日期，创建日期晚于该年时说明创建时已是历史数据，无需再次生成
                            if (data.createDate) {
                                yearMatches = data.createDate.match(/^\d+/);
                                if (yearMatches) {
                                    createYear = parseInt(yearMatches[0]);
                                    if (createYear > year) {
                                        return [2 /*return*/, false];
                                    }
                                }
                            }
                        }
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
function generateContribution() {
    return __awaiter(this, void 0, void 0, function () {
        var today, year, lastYear, needGenerate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    today = new Date();
                    year = today.getFullYear();
                    return [4 /*yield*/, generateYearContribution(year)];
                case 1:
                    _a.sent();
                    lastYear = year - 1;
                    return [4 /*yield*/, isNeedGenerate(lastYear)];
                case 2:
                    needGenerate = _a.sent();
                    if (!needGenerate) return [3 /*break*/, 4];
                    return [4 /*yield*/, generateYearContribution(lastYear)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function contribute() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.time("Total time");
                    return [4 /*yield*/, generateContribution()];
                case 1:
                    _a.sent();
                    success("生成贡献值成功");
                    console.timeEnd("Total time");
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    error("\u751F\u6210\u8D21\u732E\u503C\u5931\u8D25\n" + e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
contribute();
