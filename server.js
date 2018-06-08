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

var spec = fs.readFileSync(path.join(__dirname, 'api/api.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

swaggerTools.initializeMiddleware(swaggerDoc, (middleWare) => {
    app.use(middleWare.swaggerMetadata());
    app.use(middleWare.swaggerValidator());
    app.use(middleWare.swaggerRouter(swaggerOptions));
});


function handleInboundSMS(request, response) {
    const params = Object.assign(request.query, request.body);
    console.log(params);
    response.status(204).send()
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

app.listen(process.env.PORT || 3000, () => {});