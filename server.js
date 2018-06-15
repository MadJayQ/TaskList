'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');

const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');

var swaggerOptions = {
    controllers: path.join(__dirname, './controllers'),
    useStubs: process.env.NODE_ENV === 'development'
};

var spec = fs.readFileSync(path.join(__dirname, 'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

swaggerTools.initializeMiddleware(swaggerDoc, (middleware) => {
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());
  
    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(swaggerOptions));
  
    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());
});


function handleInboundSMS(request, response) {
    const params = Object.assign(request.query, request.body);
    console.log(params);
    response.status(204).send()
}

function sendTask(res, id, data) {
    res.wrtie('id: ' + id + '\n');
    res.write("data: " + data + '\n\n');
}
function sendTaskEvent(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    var id = (new Date()).toLocaleTimeString();

    setInterval(() => {
        sendTask(res, id, (new Date()).toLocaleTimeString());
    }, 5000);

    sendTask(res, id, (new Date()).toLocaleDateString());
}

///Jake likes to code.  Jake is a bro.  Jake programs nodes

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