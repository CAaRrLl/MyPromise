function Promise(fn) {
    this.value;
    this.state = 'pending';
    this.onResolvedCallback = [];//规范:一个promise可以多次调用then,当promise被resolve后,按照其注册顺序依次执行
    this.onRejectedCallback = [];//规范:一个promise可以多次调用then,当promise被reject后,按照其注册顺序依次执行

    try {
        fn(Promise.resolve.bind(this), Promise.reject.bind(this));
    } catch (error) {
        Promise.reject.call(this, error);
    }
}

Promise.resolve = function(value) {
    var self = this;
    if(self instanceof Promise) {
        if(self.state === 'pending') {
            setTimeout(function() {
                self.state = 'resolved';
                self.value = value;
                self.onResolvedCallback.forEach(function(cb) {
                    cb(self.value);
                });
            }, 0);
        }
    }
}

Promise.reject = function(error) {
    var self = this;
    if(self instanceof Promise) {
        if(self.state === 'pending') {
            setTimeout(function() {
                self.state = 'rejected';
                self.value = error;
                self.onRejectedCallback.forEach(function(cb) {
                    cb(self.value);
                });
            }, 0);
        }
    }
}

Promise.prototype.then = function(onResolved, onRejected) {
    var self = this;

    /*规范:若onResolved、onRejected不是函数,其必须被忽略,但是如果链式中出现一个或者多个连续
    的空then,那么需要负责将上次resolve或reject的值传递下去,实现值的穿透,同时*/
    onResolved = typeof onResolved === 'function'? onResolved : function(v){ return v; };
    onRejected = typeof onRejected === 'function'? onRejected : function(e){ throw e; };

    //返回一个新的Promise
    return new Promise(function(resolve, reject) {
        function dealResolved(value) {
            try {
                var next = onResolved(value);
                if(next instanceof Promise) {
                    next.then(resolve, reject);
                } else {
                    resolve(next);
                }
            } catch (e){
                reject(e);
            }
        }

        function dealRejected(value) {
            try {
                var next = onRejected(value);
                if(next instanceof Promise) {
                    next.then(resolve, reject);
                }
            } catch (e){
                //当onRejected为空时, onRejected = function(e){ throw e; }, 对catch的实现至关重要
                reject(e);
            }
        }

        if(self.state === 'resolved') {
            dealResolved(self.value);
            return;
        } 
        if(self.state === 'rejected') {
            dealRejected(self.value);
            return;
        } 
        if(self.state === 'pending') {
            self.onResolvedCallback.push(dealResolved);
            self.onRejectedCallback.push(dealRejected);
            return;
        }
     });
}

Promise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
}

Promise.all = function(promises) {
    return new Promise(function(resolve, reject) {
        var data = [];
        var length = promises.length;
        var count = 0;
        promises.forEach(function(promise, index) {
            promise.then(function(value) {
                data[index] = value;
                count++;
                if(count === length) {
                    resolve(data);
                }
            }).catch(function(error) {
                reject(error);
            });
        });
    });
}

module.exports = Promise;