/* global resConf, $log, $app, module, require, $timer, $ws */

//'use strict';

var mylib = {
  cronTestHandler: function (config) {
    var moment = require('moment');
    $log.info("cron task " + config.id + " executed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
//    if (mylib.socketLoaded !== true) {
//      $app.resources.get(config.socketResource).on("tweet:add", function (client, data) {
//        console.log("--------------------");
//        console.log(client, data);
//      });
//      mylib.socketLoaded = true;
//    }
  },
  websockets: {
    systemLogTraceEndpoint: function (client, config) {
      return function (data) {
        var logPrefix = "log browser trace for session " + client.id;
        var key = require('uuid').v4();
        data.socketSession = client.id;
        if (config.eventName !== false) {
          data.event = config.eventName;
        }
        if (typeof config.keyPrefix === "string") {
          key = config.keyPrefix + key;
        }
        client.broadcast.emit("log:trace", {x: data.x, y: data.y, value: 1});
        $app.resources.get(config.outputResource).insert(key, data, function (key) {
          return function (coucherr, doc) {
            var duration = $timer.timeStop('couchbase_insert_' + key);
            if (coucherr) {
              $log.warn(logPrefix + " can't record document '" + key + "' because " + coucherr.message, duration);
            }
            else {
              $log.debug(logPrefix + " recorded document '" + key + "'", 3, duration);
            }
          };
        });
      };
    },
    disconnectEndpoint: function (client, config) {
      return function (data, param) {
        $log.info("websocket client '" + client.id + "' disconnected");
        client.broadcast.emit("test", data);
        client.emit("test", data);
      };
    }
  }
};

module.exports = mylib;