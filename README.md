#订单来了主站!
本项目为vue + jquery 多页+单页应用
##启动
npm start

## 模块
使用es6模块
###导出
```js
export foo;
export default bar;
```
###导入
```js
import { foo } from './foo';
import bar from './bar';
````

## ajax
```js
import http from 'http';
http.get(url, data, config)
    .then(res => {
        // do something 不需判断code是否为1
        /** res结构
        res = {
            data
            code
            msg
        } **/
    })
    .catch(res => {
        // do something 捕获code不为1的情况
    });
http.post(url, data, config)
    .then(res => {
        // do something
    });
```
```js
config: {
    notify: Boolean // 是否modal.error后端错误信息，默认为true
}
````
source: common\http.js

注意：

1.为了将this指向当前环境，使用箭头函数。

2.错误信息处理使用catch,不是必须。

3.数组作为参数时，需要先将数组序列化(JSON.stringify)。

## modal
```js
modal.alert(msg); // 常用
modal.error(msg); // 业务中不使用，专门处理后端错误信息
modal.confirm(dialogConfig, confirmCallback, cancelCallback);
默认值
dialogConfig = {
    title: '提醒';
    message '您确定要这么做吗';
    okText: '确认',
    cancelText: '取消',
    showTitle: true,
    hasOk: true,
    hasCancel: true
}
```
soucre: common\modal.js
##init
```js
init(option)
defaultOption = {
    header: true, // 顶部导航栏
    leftMenu: true, // 网络设置左侧菜单
    topMenu: false, // 业务设置顶部菜单
    id: undefined, // 模块id
    noAuthUrl: undefined,
    mainContainer: true,
    centerModals: true,
    clearModal: false
};
```
##auth
