const express = require('express');
const io = require('socket.io-client');

const router = express.Router();
const title = 'py-node-socket-test'

// Address for communicating with python server.
const host = '127.0.0.1';
const port = Number(process.env.PORT || 8000);
const address = 'http://' + host + ':' + port + '/test';

const socket = io.connect(address);

// global valiable
let num = 0

// Load home page
router.get('/', function(req, res, next){
    // When request received
    let userAgent, isSmartphone;

    //Get user agent
    userAgent = req.headers['user-agent'].toLowerCase();

    // 接続元がスマホかそれ以外か判定
    isSmartphone = judgeSmartphone(userAgent);

    // 表示するページ出し分け
    if(isSmartphone){
        console.log('client is smartphone')
        callIndex(res, 'index_m');
    } else{
        console.log('client is not smartphone')
        callIndex(res, 'index');
    }
});


// Post
router.post('/', (req, res, next) => {
    console.log("req.body = ", req.body);
    let eventName, arg

    if(req.body.countup){
        eventName = 'calc';
        arg = 'countup';

    } else if(req.body.countdown) {
        eventName = 'calc';
        arg = 'countdown';

    } else if(req.body.senddict){
        // dictでも送信できる
        eventName = 'dict_msg';
        arg = {'1':1, '2':2};
    } else {
        console.log('invalid request.')
    }
    console.log('sending to... ', address)
    console.log('eventName = ', eventName);
    console.log('arg = ', arg);
    socket.emit(eventName, arg);
    res.redirect('/');
    console.log('done!')
});

module.exports = router;

// なんでも受け付ける
socket.onAny((eventName, arg) => {
    console.log('eventName = ', eventName);
    console.log('arg = ', arg);

    // pythonから送信されたeventnameで処理を分類
    if(eventName == 'result') {
        console.log(arg + ' received!')
        num = Number(arg)

    } else if (eventName == 'test') {
        console.log('test')
    }
})


///////////////////////////////////
//  Function
///////////////////////////////////

function callIndex(res, index){
    // index: string index file to call
    res.render(index,{
      title: title,
      num: num,
    });
}


function judgeSmartphone(userAgent){
    let isSmartphone = false;
    if(userAgent.indexOf("android") != -1
        || userAgent.indexOf("iphone") != -1
        || userAgent.indexOf("ipod") != -1
    ){
        isSmartphone = true;
    }
    return isSmartphone;
}