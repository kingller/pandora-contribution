# pandora-contribution
用Nodejs执行Git命令生成今年和去年代码贡献值数据


## Install

```bash
npm i -D pandora-contribution
``` 


## Usage

```bash
node ./node_modules/.bin/contribution --outDir ./contribution
``` 

命令`--outDir`后为输出数据文件生成地址

### log

添加参数`--log`可打印日志

```bash
node ./node_modules/.bin/contribution --outDir ./contribution --log
``` 


## Output

生成今年和去年数据文件，按年生成文件`${year}.json`
