/* global resConf, $log, $app, module, require, $timer */

//'use strict';

var mylib = {
  myCronFunction: function (config) {
    var moment = require('moment');
    $log.info("cron task " + config.id + " executed at " + moment().format('YYYY-MM-DD HH:mm:ss'));
  },
  myTwitterFunction: function (data, message, config) {
    var logPrefix = "twitter reader " + config.id;
    $log.info(logPrefix + " received tweet " + data.id_str);
    var tweetKey = (config.tweetKeyPrefix || '') + data.id_str;
    var twittosKey = (config.userKeyPrefix || '') + data.user.id_str;
    var tweet = require('merge').recursive({}, data);
    tweet.user = data.user.id_str;
    var user = require('merge').recursive({}, data.user);
    $timer.start('couchbase_insert_' + tweetKey);
    $timer.start('couchbase_insert_' + twittosKey);
    $app.resources.get(config.outputResource).insert(tweetKey, tweet, function (key) {
      return function (coucherr, doc) {
        var duration = $timer.timeStop('couchbase_insert_' + key);
        if (coucherr) {
          $log.warn(logPrefix + " can't record document '" + key + "' because " + coucherr.message, duration);
        }
        else {
          $log.debug(logPrefix + " recorded document '" + key + "'", 3, duration);
          $app.ws.io.emit("tweet:add", tweet);
        }
      };
    });
    $app.resources.get(config.outputResource).insert(twittosKey, user, function (key) {
      return function (coucherr, doc) {
        var duration = $timer.timeStop('couchbase_insert_' + key);
        if (coucherr) {
          $log.warn("error adding new document '" + key + "' because " + coucherr.message, duration);
        }
        else {
          $log.debug("new document '" + key + "' added ", 3, duration);
        }
      };
    });
  },
  mySocketEventTest: function (client, config) {
    return function (data,param) {
      console.log(data,param);
      console.log("------mySocketEventTest bot");
      console.log(client.id, config, data);
      client.broadcast.emit("test", data);
      client.emit("test", data);
    };
  },
  mySocketEventDisconnect: function (client, config) {
    return function (data,param) {
      console.log(data,param);
      $log.debug("websocket client " + client.id + " is disconnected", 3);
      $app.ws.io.emit("disconnected", {id: client.id});
    };
  }
};

module.exports = mylib;