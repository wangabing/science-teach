# 重启后恢复执行（2026-10-22）

归档状态：已于2026-10-28补入原变更的[收尾记录](../openspec/changes/archive/2026-10-22-extend-product-learning-coverage/closeout-2026-10-28.md)。下列结果为2026-10-22实际运行证据；外部TODO不随归档关闭。

本次从磁盘上的全目录交付继续执行。原变更已归档，本次未新增实验功能；补充既有专项回归的CI门禁，复查可用本地环境，将外部工作继续列入[后续TODO](product-followup-todo.md)。

## 本次改动

- GitHub工作流在全目录覆盖后增加 `npm run test:browser:coverage-regression`，覆盖电路、电学、几何原有行为；任一步失败会阻止后续部署。
- README补充专项回归命令。
- 后续TODO补充PR验收、发布回退、设备记录、学生观察、教材核对和学科审阅的具体启动步骤。

## 环境与验收

本次使用已有Homebrew Node `v24.19.0`（`/usr/local/opt/node@24/bin`），通过命令PATH选择；系统默认Node仍为`v23.4.0`。浏览器使用本机Chrome，静态站点为本次重新构建的`dist`。与上一轮隔离Node `v24.22.1`的历史结果分开记录。

| 项目 | 本次结果 | 证据 |
| --- | --- | --- |
| 单元测试 | 303通过，0失败 | [unit.txt](assets/product-resume-2026-10-22/unit.txt) |
| 类型检查与生产构建 | 0错误/警告/提示；147页成功 | [build.txt](assets/product-resume-2026-10-22/build.txt) |
| OpenSpec主规格严格校验 | 34通过，0失败 | [specs.txt](assets/product-resume-2026-10-22/specs.txt) |
| 全目录浏览器验收 | 145通过，0失败，覆盖140项实验及5项专项 | [coverage-report.json](assets/product-resume-2026-10-22/coverage-report.json) |
| 关键产品旅程 | 13通过，0失败 | [product-report.json](assets/product-resume-2026-10-22/product-report.json) |
| 电路、电学、几何专项回归 | 33通过，0失败 | [regression-report.json](assets/product-resume-2026-10-22/regression-report.json) |

构建仍有大于500kB的压缩分块提示，与类型检查结果分别记录。首次浏览器启动被沙箱禁止监听本机端口（`listen EPERM 127.0.0.1:4371`），该次未执行产品断言；获准使用本地服务和Chrome后重跑，见[环境记录](assets/product-resume-2026-10-22/initial-browser-environment.txt)。

本次最终汇总见[validation.json](assets/product-resume-2026-10-22/validation.json)。三套浏览器检查均无跳过、重试后通过或失败用例。

## 后续安排

EXT01托管CI先通过PR验收，EXT02再发布；EXT03实机与EXT06科学审阅可分批并行，EXT04学生试用与EXT05教材核对需实际参与安排。本机未发现`gh`命令，未验证远程写权限。本次本地结果不代表GitHub Actions执行结果，也不代替真实设备、学生、教师或专家验证。

可按项目`.nvmrc`准备Node24后执行：

```sh
npm test
npm run build
openspec validate --specs --strict
PLAYWRIGHT_CHANNEL=chrome npm run test:browser:coverage
PLAYWRIGHT_CHANNEL=chrome npm run test:browser:product
PLAYWRIGHT_CHANNEL=chrome npm run test:browser:coverage-regression
```

本地Chrome测试命令会自动临时启动生产静态服务；托管CI使用安装的Chromium，无需设置`PLAYWRIGHT_CHANNEL`。具体未满足条件、验收标准与估算见TODO。
