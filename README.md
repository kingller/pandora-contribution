# pandora-contribution
用Nodejs执行Git命令生成今年和去年代码贡献值数据


## Install

```bash
npm i -D pandora-contribution
``` 


## Usage

```bash
node ./node_modules/.bin/contribution --outDir ./contribution -- ./
``` 

### --outDir

命令 `--outDir` 后为输出数据文件生成地址

### \[--\] \<path\>

命令 `[--] <path>` 匹配指定路径的文件生成的提交。当出现混淆时，路径可能需要加上前缀 `--` 以将它们区分。可选参数。

### --log

添加参数`--log`可打印日志。可选参数。

```bash
node ./node_modules/.bin/contribution --outDir ./contribution --log
``` 


## Output

生成今年和去年数据文件，按年生成文件`${year}.json`
