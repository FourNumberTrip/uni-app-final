# 最终的uni-app仓库

## 安装pnpm

1. 在powershell中执行以下命令

``` powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

2. 使用pnpm安装node16

``` powershell
pnpm env use --global 16
```

3. 安装vue-cli

``` powershell
pnpm install -g @vue/cli
```

## 安装包
```
pnpm i
```

## 监控文件夹并动态编译小程序
```
pnpm dev:mp-weixin
```

---

最后使用小程序打开 dist/mp-weixin
