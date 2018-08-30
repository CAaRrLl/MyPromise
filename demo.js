const fs = require('fs');
const _Promise_ = require('./promise');

function readFile(path) {
    return new _Promise_(function(resolve, reject) {
        fs.readFile(path, function(err, data) {
            if(err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

//example1
readFile('./promise.js')
.then(
    data => {
        console.log(String(data));
        return './demo.js';
    },
    err => console.log(err)
)
.then(
    data => {
        return new _Promise_((resolve, reject) => {
            fs.readFile(data, (err, chunk) => {
                if(err) {
                    reject(err);
                    return;
                }
                resolve(String(chunk));
            });
        });
    }
)
.then(
    data => console.log(data),
    err => console.log(err)
);


//example2
readFile('./inde.js')
.then(data => console.log(data))
.catch(err => console.log(err));

//example3 获取的数据会被保存起来，一段时间过后通过then仍能取得
var getNumber = new _Promise_((resolve, reject) => {
    setTimeout(() => {
        resolve(100);
    }, 1000);
});
getNumber
.then(num => console.log(num))
.catch(err => console.log('err',err));

//example 值的穿透
var num = 100;
new _Promise_((resolve) => resolve(--num))
.then(num => --num)
.then(num => --num)
.then()
.then()
.then()
.then(num => --num)
.then(num => console.log(num));