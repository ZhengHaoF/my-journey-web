## 工作流程

1. 每个问题都列出TODO，再按列出的TODO执行
2. 用中文回答问题
3. 修改后，不用自动运行，我会手动运行
4. 后端接口改动要同步到.md文档和Swagger文档中

## 项目规则

1. 这是uniapp项目，请使用uniapp的语法规范
2. ui用的是uView-plus组件库,请使用uView-plus的语法规范,注意uview-plus的组件前缀是`<up-`
3. 接口都放在`api\api.js`里
4. 所有页面都必须有`page-container`组件,并放在`page-content`组件里
5. 这个项目改好后不用编译验证
6. onLoad和onShow要导入，参考：`import { onReady } from '@dcloudio/uni-app'`

## 项目结构

- `pages/` - 页面文件
- `api/api.js` - API接口定义
- `components/` - 公共组件
- `接口文档/` - 接口文档（后端接口改动需同步更新）
- `uni_modules/` - uni-app插件（uview-plus、lime-dayuts日期插件）

## 技术栈

- uniapp + Vue3
- uview-plus UI组件库
- 腾讯地图SDK
- lodash（`import _ from 'lodash'`）
