# GitHub Pages 部署

正式地址：**https://lab.xiaozhan.info/**。项目为纯静态网站，不需要服务器、数据库或运行时密钥。

## 首次上线

1. 将部署配置提交并推送到 GitHub 的 `main` 分支。
2. 打开 [仓库 Pages 设置](https://github.com/wangabing/science-teach/settings/pages)，在 **Build and deployment → Source** 选择 **GitHub Actions**。GitHub Free 账号需要仓库为公开仓库；私有仓库的 Pages 支持取决于账号套餐。
3. 在域名服务商的 `xiaozhan.info` DNS 管理后台添加下列记录。如果 `lab` 已有冲突的 A、AAAA 或 CNAME 记录，替换该记录。

   | 类型 | 主机记录 | 记录值 | TTL |
   | --- | --- | --- | --- |
   | CNAME | `lab` | `wangabing.github.io` | 默认 / 自动 |

   记录值不加 `https://`、路径或仓库名。若 DNS 在 Cloudflare，首次配置先使用 **DNS only（仅 DNS）**，便于 GitHub 检查域名和签发证书。

4. 在 Pages 设置的 **Custom domain** 填入 `lab.xiaozhan.info` 并保存。`public/CNAME` 会随每次构建发布，但使用 Actions 部署时仍需在仓库设置中配置自定义域名。
5. 打开 [Actions](https://github.com/wangabing/science-teach/actions/workflows/deploy.yml)，选择 **Deploy to GitHub Pages → Run workflow → main**。若推送已触发成功部署，无需重复运行。
6. 等待 DNS 检查和证书签发完成，在 Pages 设置勾选 **Enforce HTTPS**。DNS 和证书生效可能需要一段时间，以 GitHub 页面状态为准。
7. 访问正式地址，核查首页、实验目录和一个二维/三维实验；直接打开实验深层链接、刷新页面，检查手机访问。确认不依赖本地服务。

如 GitHub 提示需要验证域名所有权，在个人账号 **Settings → Pages → Add a domain** 按提示添加 TXT 记录；长期保留该验证记录。

## 后续更新

推送到 `main` 会自动安装锁定依赖，运行模型测试、Astro/TypeScript 检查、静态构建并发布 `dist/`。构建失败时不会进入发布任务，可在 Actions 查看失败步骤。工作流使用仓库自带的 `GITHUB_TOKEN`，不需要把个人 Token 添加为部署密钥。

自定义域名从根路径提供页面，因此 Astro 没有设置 `/science-teach` 的 `base`。直接使用 `wangabing.github.io/science-teach/` 不是本项目的目标访问方式；请先完成自定义域名配置。

## 回退

网站内容需要回退时，对有问题的代码提交执行 `git revert <提交号>` 并推送到 `main`，自动部署将发布回退后的版本。不要使用强制推送覆盖历史。

## 验收状态

部署构建检查不等同于 140 项实验的人工验收；`experiment-review-140.xlsx` 的逐项测试仍待后续完成。
