'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.taskGET = function taskGET (req, res, next) {
  var taskGUID = req.swagger.params['taskGUID'].value;
  Default.taskGET(taskGUID)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.taskPOST = function taskPOST (req, res, next) {
  Default.taskPOST()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
