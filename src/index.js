function isPromise(val) {
    return val !== null && typeof (val) === 'object' && typeof (val.then) === 'function'
}
class PreventBack {
    constructor(data) {
        this.resetState();
        this.behaviourTypeList = ['touchstart', 'keypress', 'focus', 'mousedown'];
        this.behaviourFuncObj = {};
        this.popStateListener = null;
        this.initWebviewBehaviour();
    }
    resetState() {
        this.queue = []
        // 回调函数是否正在执行中
        this.isCallbackExecuting = 0; // 0:初始化 1:执行中 2:执行完成
        // 是否需要强制返回
        // this.needForceBack = false;
        // 是否已经pushState
        this.isSubsribeAndPushState = false;
    }
    // 强制退出
    forceBack() {
        this.isCallbackExecuting = 2;
        window.history.go(-2);
        // this.needForceBack = true
    }
    // 注册popstate事件及初始化pushState
    initPopStateHandler() {
        this.listenEventHandler()
        window.history.pushState('', '', window.location.href);
        this.isSubsribeAndPushState = true;
    }
    // 增加观察者
    addObserver(observer) {
        const id = performance.now()
        const obj = {
            func: observer,
            id
        }
        if (this.queue.length === 0) {
            if (!this.isSubsribeAndPushState) {
                this.initPopStateHandler()
            }
        }
        this.queue.push(obj)
        return { id, length: this.queue.length }
    }
    // 删除观察者
    delObserver(id) {
        if (id) {
            const index = this.queue.findIndex((item) => item.id === id)
            console.log('delObserver', this.queue, index)
            if (index >= 0) {
                this.queue.splice(index, 1)
            }
            if (this.queue.length === 0) {
                window.removeEventListener('popstate', this.popStateListener, true)
                window.history.go(-1)
                this.isSubsribeAndPushState = false;
            }
            return this.queue.length
        }
    }
    // 执行回调函数
    async excuteCallBack(queue) {
        let isAllObserverAgreeBack = true
        let needForceBack = false
        // 返回true/resolve表示不同意返回
        for (let i = queue.lenth - 1; i >= 0; i--) {
            const item = queue[i];
            if (item.func) {
                let val = null
                try {
                    //捕捉同步错误
                    val = item.func({ isForceBack: this.needForceBack, forceBack: () => { needForceBack = true } });
                } catch (err) {
                    console.log("get sync err", err)
                }
                if (isPromise(val)) {
                    if (!needForceBack) {
                        try {
                            const data = await val
                            val = false
                        } catch (err) {
                            val = true
                        }
                    }
                }
                if (!needForceBack && val === true) {
                    break;
                }
                isAllObserverAgreeBack = val && isAllObserverAgreeBack
            }
            return [isAllObserverAgreeBack, needForceBack]
        }
    }
    // 注册popstate函数
    listenEventHandler() {
        const listener = async (event) => {
            // 回调函数全部执行协商退出
            if (this.isCallbackExecuting === 2) {
                this.resetState();
                return;
            }
            if (this.queue.length === 0) {
                this.isCallbackExecuting = 2
                window.history.go(-1);
                return;
            }
            window.history.pushState('', '', window.location.href);
            if (this.isCallbackExecuting !== 0) {
                const queue = [...this.queue];
                this.isCallbackExecuting = 1;
                const [isAllObserverAgreeBack, needForceBack] = await this.excuteCallBack(queue);
                this.isCallbackExecuting = 2
                // 回调函数执行完成，所有观察者同意或者任意一个观察者强制返回则back
                if (isAllObserverAgreeBack || needForceBack) {
                    window.history.go(-2)
                }
            }
        }
        this.popStateListener = listener;
        window.addEventListener('popstate', listener, true)
    }
    initWebviewBehaviour() {
        this.behaviourTypeList.forEach((behaviourType) => {
            const behaviourFunc = () => {
                console.log('behaviourFunc', behaviourType, this.isSubsribeAndPushState)
                // 防止多次pushState
                if (!this.isSubsribeAndPushState && this.queue.length > 0) {
                    this.listenEventHandler()
                    window.history.pushState('', '', window.location.href);
                    console.log("pushState")
                    this.isSubsribeAndPushState = true;
                }
                document.removeEventListener(behaviourType, behaviourFunc, true)
            }
            document.addEventListener(behaviourType, behaviourFunc, true);
        })
    }
}
let ProxyCreatePreventBack = (function () {
    let instance;
    return function (data) {
        if (instance) {
            return instance;
        }
        instance = new PreventBack(data);
        return instance;
    }
})();

export default ProxyCreatePreventBack;

window.PreventBack = ProxyCreatePreventBack;
