# 蚂蚁金融云官方 Node 技术栈脚本

根据[蚂蚁金融云文档](https://www.cloud.alipay.com/docs/2/61334)创建 Node 技术栈脚本，支持 Node 应用部署。

## 功能

### 部署

### 健康检查

### 自定义 node

## 扩展 Node 技术栈

## 配置

可以添加 `.nodestack` 配置来指定部署方式

```yml
install:
  enable: true
  cache: true

health_check:
  enable: true
  port: 7001
  path: /healthy
  body: healthy
```

## 开发指南

### 打包技术栈

执行下面的命令

```
$ make pack_stack
```

会生成文件到 `target/node.tgz`，上传这个包到技术栈即可

### 测试应用

测试应用可使用 [egg-boilerplate-alipay-tiny](https://github.com/eggjs/egg-boilerplate-alipay-tiny) 脚手架生成，执行下面命令会自动打包

```
$ make pack_egg
```
