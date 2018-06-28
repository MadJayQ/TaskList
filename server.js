'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');

const Task = require('./public/js/task.js');

var tasks = [];

function handleInboundSMS(request, response) {
    const params = Object.assign(request.query, request.body);
    console.log(params);
    response.status(204).send()
}

function sendTask(res, id, data) {
    res.write('id: ' + id + '\n');
    res.write("data: " + data + '\n\n');
}

function sendTasks(res, id) {
    res.write('id: ' + id + '\n');
    var data = {}
    for(var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        data[i] = task.serialize();
    }
    var serializedData = JSON.stringify(data);
    console.log(serializedData);
    res.write('data: ' + serializedData + '\n\n');
}
function sendTaskEvent(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    var id = (new Date()).toLocaleTimeString();

    setInterval(() => {
        sendTasks(res, id);
    }, 1000);

    /*
    setInterval(() => {
        sendTask(res, id, (new Date()).toLocaleTimeString());
    }, 5000);

    sendTask(res, id, (new Date()).toLocaleDateString());
    */ 

}

///Jake likes to code.  Jake is a bro.  Jake programs nodes

var t = new Task.Task.Builder(Task.Priority.PRIORITY_GENERIC, "Test Task", "Michelle");
tasks.push(t.build());
t = new Task.Task.Builder(Task.Priority.PRIORITY_URGENT, "Urgent Test", "Jake");
tasks.push(t.build());

for(var i = 0; i < tasks.length; i++) {
    console.log(tasks[i].serialize());
}

app.use(express.static('public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.route('/webhooks/inbound-sms').get(handleInboundSMS).post(handleInboundSMS);
app.get('/', (req, res) => { res.sendFile('index.html', {root: __dirname});});
app.post('/write-file', (req, res) => {
    const body = req.body;
});
app.get('/events', (req, res) => {
    if(req.headers.accept && req.headers.accept == 'text/event-stream') {
        sendTaskEvent(req, res);
    }
});

app.listen(process.env.PORT || 3000, () => {});