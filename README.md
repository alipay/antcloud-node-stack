# [蚂蚁金融科技](https://tech.antfin.com)官方 Node 技术栈脚本

根据[蚂蚁金融科技技术栈文档](https://tech.antfin.com/docs/2/61282)创建 Node 技术栈脚本，支持 Node 应用部署。

内置 Node10 和 Nginx 1.15，也可基于开源版本定制自己的脚本。

## 接入流程

此技术栈是系统技术栈，所以在创建应用的时候选择即可。创建应用时[根据文档](https://tech.antfin.com/docs/2/59050#h2-u521Bu5EFAu5E94u752844)选择 NodeJS 技术栈即可，如 Node.js 1.0.0-system

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

### 配置文件

提供配置文件增加可选项，配置文件放在根目录的 `.nodestack` 下。

#### Nginx

此技术栈内置了 Nginx 1.5，可以直接根据配置来部署，一般建议在 Node 应用前面放一个 Nginx 来反向代理。

```yaml
nginx:
  enable: true
  bin_path: 'nginx'
  conf_path: 'conf/nginx.conf'
```

- `bin_path` 是指用于启动的 nginx，如果使用其他版本可以自行在 ecs 安装
- `conf_path` 是指相对于应用目录的配置文件路径。

如果不想使用 nginx 可以关闭

```yaml
nginx:
  enable: false
```

#### 健康检查

应用部署完成后会通过健康检查来判断应用是否真正可用

```yaml
health_check:
  enable: true
  port: 7001
  path: /healthy
  status: 200
  body: healthy
```

需要提供一下配置

- port 是指应用启动的端口
- path 是指需要健康检查的路径
- status 和 body 是期望的响应状态，body 只需要包含即可

## 自定义 Node 技术栈

如果官方技术栈无法满足需求，你可以 fork 一份自己发布一个技术栈

修改完代码后运行 `make pack_stack`，将 target/node.tgz 上传即可，具体操作可查看「[管理技术栈](https://tech.antfin.com/docs/2/68034)」文档。

## 开发指南

### 打包技术栈

执行下面的命令

```
$ make pack_stack
```

会生成文件到 `target/node.tgz`，上传这个包到技术栈即可

### 打包测试应用

可以将 example 下面的示例打包，然后通过「[发布包管理](https://tech.antfin.com/docs/2/61376)」上传应用来测试技术栈脚本。

```
$ make pack_example
```

## 提问

https://github.com/alipay/antcloud-node-stack/issues

## 协议

[MIT](https://github.com/alipay/antcloud-node-stack/tree/master/LICENSE)

[pm2]: http://pm2.keymetrics.io
