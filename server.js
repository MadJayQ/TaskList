'use strict';

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');

const Task = require('./public/js/task.js');

const  { IncomingWebhook, WebClient, RTMClient } = require('@slack/client');
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter("jImOVPigASxy97KcyeGvgAfd");

var clientID = "364919894661.391353179684";
var clientSecret = "c85482eb42586455aa4855c3afeec313";
var signingSecret = "f664e91319dbccd903d51b3cc3abc170";

const bot_token = 'xoxb-364919894661-391040359297-IssuraxrgQSZH0a7EFGCxXne';
const rtm = new RTMClient(bot_token);
const web = new WebClient(bot_token);

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
app.use('/slack/events', slackEvents.expressMiddleware());

/*
// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event)=> {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});
*/

rtm.on('message', (message) => {
    if (message.type === 'message' && message.text) {
        console.log(message.text);
    }
});
rtm.start();
    
// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);
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
app.get('/oauth', function(req, res) {
    // When a user authorizes an app, a code query parameter is passed on the oAuth endpoint. If that code is not there, we respond with an error message
    if (!req.query.code) {
        res.status(500);
        res.send({"Error": "Looks like we're not getting code."});
        console.log("Looks like we're not getting code.");
    } else {
        // If it's there...

        // We'll do a GET call to Slack's `oauth.access` endpoint, passing our app's client ID, client secret, and the code we just got as query parameters.
        request({
            url: 'https://slack.com/api/oauth.access', //URL to hit
            qs: {code: req.query.code, client_id: clientId, client_secret: clientSecret}, //Query string data
            method: 'GET', //Specify the method

        }, function (error, response, body) {
            if (error) {
                console.log(error);
            } else {
                res.json(body);

            }
        })
    }
});
app.listen(process.env.PORT || 3000, () => {});