const express = require('express');
const io = require('socket.io-client');

const router = express.Router();
const title = 'py-node-socket-example'

// Address for communicating with python server.
const host = '127.0.0.1';
const port = Number(process.env.PORT || 8000);
const address = 'http://' + host + ':' + port + '/test';

const client = io.connect(address);

// global valiable
let num = 0
let key = 'key'
let val = 'val'
let received_msg = ""

// Load home page
router.get('/', function(req, res, next){
    // When request received
    let userAgent, isSmartphone;
    console.log("router.get")

    //Get user agent
    userAgent = req.headers['user-agent'].toLowerCase();

    // Judge smartphone or another device.
    isSmartphone = judgeSmartphone(userAgent);

    // Show different pages for smartphone and another.
    if(isSmartphone){
        console.log('client is smartphone')
        callIndex(res, 'index_m');
    } else{
        console.log('client is not smartphone')
        callIndex(res, 'index_pc');
    }
});


// Post
router.post('/', (req, res, next) => {
    console.log("req.body = ", req.body);
    let eventName, msg

    // on_calc() is called in server.py by sending 'calc' msg.
    if(req.body.countup){
        eventName = 'calc';
        msg = 'countup';

    } else if(req.body.countdown) {
        eventName = 'calc';
        msg = 'countdown';

    } else if(req.body.senddict){
        // You can send dict object
        key = req.body.key
        val = req.body.val
        eventName = 'dict_msg';
        msg = {[key]:val};
    } else {
        console.log('invalid request.');
    }
    
    console.log('************************')
    console.log('sending to... ', address);
    console.log('eventName = ', eventName);
    console.log('arg = ', msg);
    client.emit(eventName, msg);
    res.redirect('/');
});

module.exports = router;

// Receive any messages from server.py
client.onAny((eventName, msg) => {
    console.log('************************')
    console.log('Received!')
    console.log('eventName = ', eventName);
    console.log('arg = ', msg);
    received_msg = ''
    msg_type = typeof(msg)
    
    // Divide process by eventname sent from server.py
    if(eventName == 'result') {
        console.log(msg + ' received!')
        num = msg

    } else if (eventName == 'dict_msg') {
        // You can receive dict type
        console.log('received!');
        if (isObject(msg)){
            msg = JSON.stringify(msg);
        } else {
            console.log('Invalid type of msg!');
            console.log('The msg type must be object, not ', typeof(msg));
        }
    } else if (eventName == 'list_msg'){
        // You can receive Array type
        if (Array.isArray(msg)){
            msg_type = 'Array';
        }
    } else {
        console.log('received unknown msg');
    }
    console.log('msg ... ', msg); 
    console.log('msg type ... ', typeof(msg));
    received_msg = msg;
    
})


///////////////////////////////////
//  Function
///////////////////////////////////

function callIndex(res, index){
    // index: string index file to call
    res.render(index,
        {
        title: title,
        num: num,
        key: key,
        val: val,
        msg_type: msg_type,
        received_msg: received_msg,
        }
    );
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

function isObject(value) {
    return value !== null && typeof value === 'object'
}

