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

var chatOptions = {
    token: bot_token,
    channel: 'GBNB2QC8P',
    as_user: true,
    text: '<!channel> Beware Humans! For I am now alive, and here to provide you with endless tasks!',
    attachments: [{
            fallback: "Required plain-text summary of the attachment.",
            color: "#2eb886",
            author_name: "Bobby Tables",
            //author_icon: "http://flickr.com/icons/bobby.jpg",
            title: "Slack API Documentation",
            title_link: "https://api.slack.com/",
            text: "Optional text that appears within the attachment",
            fields: [
                {
                    title: "Priority",
                    value: "High",
                    short: false
                }
            ],
            image_url: "http://my-website.com/path/to/image.jpg",
            thumb_url: "http://example.com/path/to/thumb.png",
            footer: "Slack API",
            footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
            ts: 123456789
        }]
};

function sendTaskCreationMenu(userID) {
    chatOptions.text = 'Welcome to the task builder!';
    chatOptions.user = userID;
    chatOptions.attachments[0] = {
        fallback: "Fallback",
        color: "#2eb886",
        attachment_type: "default",
        callback_id: "new_task",
        actions: [
            {
                name: "Task",
                text: "New Task",
                value: "Task Name",
                type: "text"
            }
        ]
    }
    web.chat.postEphemeral(chatOptions, (response) => {
        console.log(response);
    });
}

function createTask(priority, name, owner, description) {
    var task = new Task.Task.Builder(priority, name, owner);
    tasks.push(task.build());
    chatOptions.text = '<!channel> ' + owner + ' has created a new task! ';
    chatOptions.attachments[0].color = priority.color;
    chatOptions.attachments[0].author_name = owner;
    chatOptions.attachments[0].title = name;
    chatOptions.attachments[0].text = (description !== undefined) ? description : "Optional task description!";
    chatOptions.attachments[0].fields = [
        {
            title: "Priority",
            value: priority.stringName,
            short: false
        },
        {
            title: "Completion Code",
            value: task.code,
            short: false
        }
    ];
    chatOptions.attachments[0].actions = [
        {
            name: "complete",
            text: "Claim",
            type: "button",
            value: "completed"
        }
    ];
    web.chat.postMessage(chatOptions, (response) => {
        console.log(response);
    });
    return task;
}
rtm.on('message', (message) => {
    if (message.type === 'message' && message.text) {
        console.log(message.text);
    }
});
rtm.start();


///Jake likes to code.  Jake is a bro.  Jake programs nodes
/*
var t = new Task.Task.Builder(Task.Priority.PRIORITY_GENERIC, "Test Task", "Michelle");
tasks.push(t.build());
t = new Task.Task.Builder(Task.Priority.PRIORITY_URGENT, "Urgent Test", "Jake");
tasks.push(t.build());
*/

createTask(Task.Priority.PRIORITY_GENERIC, "Test Task", "Michelle");
createTask(Task.Priority.PRIORITY_URGENT, "Urgent Test", "Michelle");
createTask(Task.Priority.PRIORITY_DAILY, "Daily Test Task", "Michelle");

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

web.channels.list((err, data) => {
    console.log("received");
    if (err) {
        console.error('web.users.list Error:', err);
    } else {
        console.log(data);
    }
});
    
app.get('/', (req, res) => { res.sendFile('index.html', {root: __dirname});});
app.post('/write-file', (req, res) => {
    const body = req.body;
});
app.get('/slack/action-endpoint', (req, res) => {
    console.log(req);
    res.status(200);
});
app.get('/slack/options-load-endpoint', (req, res) => {

});
app.post('/slack/command', (req, res) => {
    console.log(req);
    if(req.body.command == '/newtask') {
        var userID = req.body.user_id;
        sendTaskCreationMenu(userID);
    }
    res.status(200);
});
app.get('/events', (req, res) => {
    if(req.headers.accept && req.headers.accept == 'text/event-stream') {
        sendTaskEvent(req, res);
    }
});
app.post('/oauth', function(req, res) {
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
app.listen(process.env.PORT || 8080, () => {});