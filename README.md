# [蚂蚁金融云](https://tech.antfin.com)官方 Node 技术栈脚本

根据[蚂蚁金融云技术栈文档](https://tech.antfin.com/docs/2/61282)创建 Node 技术栈脚本，支持 Node 应用部署。

内置 Node10 和 Nginx 1.15，也可基于开源版本定制自己的脚本。

## 接入流程

此技术栈已经成为金融云的系统技术栈，所以在创建应用的时候选择即可。创建应用时根据文档选择 NodeJS 技术栈即可。

## 如何使用

使用此脚本时需要符合规范才能运行，下面有两个示例

- [egg](https://github.com/alipay/antcloud-node-stack/tree/master/example/egg)
- [koa](https://github.com/alipay/antcloud-node-stack/tree/master/example/koa)

### 应用启停

应用的启动和停止使用 npm script 的方式，以 egg 为例配置 `pacakge.json`

```json
{
  "scripts": {
    "start": "egg-scripts start --daemon --title=egg-server-egg",
    "stop": "egg-scripts stop --title=egg-server-egg"
  }
}
```

egg-scripts 提供了启停脚本，所以可以直接调用，如果没有提供脚本可以使用 [pm2]。

**注意：此脚本必须是后台运行，否则部署会超时无法继续运行。**

### Nginx


## 自定义 Node 技术栈

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

## 提问


## 协议

MIT

[pm2]: http://pm2.keymetrics.io
