const express = require('express');
const router = express.Router();

const io = require('socket.io-client');

const title = 'py-node-socket-test'


// Address for communicating with python server.
// const host = 'localhost';
const host = '127.0.0.1';
const port = Number(process.env.PORT || 8000);
const address = 'http://' + host + ':' + port + '/test';
const socket = io.connect(address);


// Load home page
router.get('/', function(req, res, next){
    //Get user agent
    let userAgent = req.headers['user-agent'].toLowerCase();
    console.log("userAgent = ", userAgent);

    // 接続元がスマホかそれ以外か判定
    let isSmartphone = false;
    if(userAgent.indexOf("android") != -1
        || userAgent.indexOf("iphone") != -1
        || userAgent.indexOf("ipod") != -1
    ){
        isSmartphone = true;
        console.log('client is smartphone')
    }

    // 表示するページ出し分け
    if(isSmartphone){
        callIndex(res, 'index_m');
    } else{
        callIndex(res, 'index');
    }
});


// Post
router.post('/', (req, res, next) => {
    console.log("req.body = ", req.body);
    var event, arg

    if(req.body.countup){
        event = 'calc';
        arg = 'countup';

    } else if(req.body.countdown) {
        event = 'calc';
        arg = 'countdown';

    } else if(req.body.senddict){
        // dictでも送信できる
        event = 'dict_msg';
        arg = {'1':1, '2':2};
    } else {
        console.log('invalid request.')
    }
    console.log('sending to... ', address)
    console.log('event = ', event);
    console.log('arg = ', arg);
    socket.emit(event, arg);
    res.redirect('/');
    console.log('done!')
});

module.exports = router;

// global valiable
let num = 0

// なんでも受け取る
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

function callIndex(res, index){
    // index: string index file to call
    res.render(index,{
      title: title,
      num: num,
    });
}


