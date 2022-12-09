# prevent-back
prevent user back

## **Install**

```
yarn add prevent-user-back
```

## Usage

```js
  import preventBack from prevent-user-back

  let preventBackInstance = new preventBack()
```

## API

new preventBack()返回一个阻止返回实例，全局共用一个实例

| 方法名      | 说明                 | 参数       | 返回值                         |
| :---------- | :------------------- | :--------- | :----------------------------- |
| addObserver | 注册观察者函数       | observer   | {id,length:已注册的观察者数量} |
| delObserver | 删除已注册观察者函数 | observerId | length：已注册的观察者数量     |
| forceBack   | 页面强制退出         | 无         | 无                             |

observer：注册函数，返回true或者promise，promise resolve表示不同意返回。
