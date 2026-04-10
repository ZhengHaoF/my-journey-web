# My Journey Web

一个基于uniapp的行程管理应用。

## 项目简介

My Journey Web 是一款跨平台的行程管理应用，支持App端和微信小程序端。用户可以通过该应用管理自己的行程，包括创建、查看、编辑和删除行程等功能。

## 技术栈

- **框架**: uniapp + Vue3
- **UI组件库**: uview-plus
- **地图服务**: 腾讯地图SDK
- **网络请求**: 自定义封装

## 项目结构

```
my-journey-web/
├── api/                  # API接口定义
│   └── api.js           # 接口方法
├── components/           # 公共组件
│   └── page-container/  # 页面容器组件
├── pages/               # 页面文件
│   ├── Home/           # 首页
│   ├── index/          # 登录页
│   ├── maptest/        # 地图演示页
│   ├── Mine/           # 个人中心
│   ├── Trip/           # 行程列表页
│   └── TripDetails/    # 行程详情页
├── static/             # 静态资源
│   ├── tabbar/         # TabBar图标
│   └── images/         # 其他图片资源
├── uni_modules/        # uni-app插件
│   ├── uview-plus/    # uview-plus组件库
│   └── lime-dayuts/    # 日期处理插件
├── App.vue             # 应用入口
├── main.js             # 主入口文件
├── pages.json          # 页面路由配置
├── manifest.json       # 应用配置
└── uni.scss           # 全局样式变量
```

## 功能模块

### 1. 用户模块
- 用户登录
- 用户注册

### 2. 行程模块
- 查看行程列表
- 查看行程详情
- 创建新行程
- 编辑行程信息
- 删除行程

### 3. 地图功能
- 地图展示
- 位置定位
- 导航功能

### 4. 个人中心
- 用户信息展示
- 账户设置

## API接口

所有接口定义在 `api/api.js` 文件中：

### 用户接口
- `loginAPP(params)` - 用户登录
- `registerAPP(params)` - 用户注册

### 行程接口
- `getTripList()` - 获取行程列表
- `getTripDetail(uuid)` - 获取行程详情
- `createTrip(params)` - 创建行程
- `updateTrip(uuid, params)` - 修改行程
- `deleteTrip(uuid)` - 删除行程

## 页面说明

### 首页 (Home)
应用的主页面，展示行程概览信息。

### 登录页 (index)
用户登录入口，支持新用户注册。

### 行程页 (Trip)
展示用户的行程列表，支持行程的增删改查操作。

### 行程详情页 (TripDetails)
展示单个行程的详细信息，包括时间、地点、描述等。

### 个人中心 (Mine)
用户个人信息和设置页面。

### 地图演示页 (maptest)
地图功能演示页面，集成腾讯地图SDK。

## 运行项目

### 开发环境
```bash
# 使用HBuilderX
# 打开项目，选择运行到对应的平台
```

### 编译项目
```bash
# 使用HBuilderX
# 点击运行即可编译
```

## 注意事项

1. **页面结构**: 所有页面必须包含 `page-container` 和 `page-content` 组件
2. **组件命名**: 使用uview-plus组件时，前缀为 `up-`
3. **接口调用**: 所有接口统一在 `api/api.js` 中管理
4. **编译验证**: 项目修改后需手动运行验证

## 许可证

本项目仅供学习交流使用。
