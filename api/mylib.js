/* global resConf, $log, $app, module, require, $timer */

//'use strict';

var mylib = {
  myCronFunction: function (config) {
    var moment = require('moment');
    $log.info("cron task " + config.id + " executed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
  },
  mySocketEndpointFunction: function (client, config) {
    return function (data) {
      console.log("------mySocketEndpointFunction");
      console.log(client.id, config, data);
      client.broadcast.emit("test", data);
      client.emit("test", data);
    };
  }
};

module.exports = mylib;