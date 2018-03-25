/* global resConf, $log, $app, module, require */

//'use strict';

var mylib = {
  messageSendToQueue: function (data, resource) {
    if (resource && $app.resources.exist(resource)) {
      $app.resources.get(resource).sendMessage(data, {}, function (err) {
        if (err) {
          $log.warn("error sending new message in " + resource + " because " + err.message, null, true);
        }
        else {
          $log.info("message is sended into " + resource);
        }
      }, true);
    }
    else {
      $log.warn("could not find resource " + resource, null, true);
    }
  },
  messageTransfertToQueue: function (data, resource) {
    if (resource && $app.resources.exist(resource)) {
      $app.resources.get(resource).sendMessage(data, {}, function (err) {
        if (err) {
          $log.warn("error transfering message in " + resource + " because " + err.message, null, true);
        }
        else {
          $log.info("message is transfered into " + resource);
        }
      }, true);
    }
    else {
      $log.warn("could not find resource " + resource, null, true);
    }
  },
  messageRemoveFromQueue: function (message, resource) {
    if (resource && $app.resources.exist(resource)) {
      $app.resources.get(resource).removeMessage({ReceiptHandle: message.ReceiptHandle}, function (err) {
        if (err) {
          $log.warn("error removing message " + message.MessageId + " from " + resource + " because " + err.message, null, true);
        }
        else {
          $log.info("message " + message.MessageId + " removed after processing");
        }
      }, true);
    }
    else {
      $log.info("message " + message.MessageId + " processed without being removed");
    }
  },
  cronIsAlive: function (config) {
    var data = require('merge').recursive({}, $app.config);
    delete data.resources;
    delete data.log;
    delete data.session;
    delete data.server;
    delete data.bot;
    var message = {
      event: config.event,
      data: data,
      time: Date.now(),
      server: $log.config.appsign
    };
    mylib.messageSendToQueue(message, config.resource);
  },
  readerMessageUnprocessed: function (data, message, config) {
    if (config.sendmail) {
      $app.resources.get(config.sendmail.resource).sendMail({
        to: config.sendmail.to || "dev@startx.fr",
        subject: "MISSING EVENT READER on " + (data.server || data.apptype),
        text: "server " + data.server + " sended a WARNING because we must implement a event reader for this event : \n\n" + JSON.serialize(data) + "\n\n" + JSON.serialize(message)
      });
    }
    mylib.messageRemoveFromQueue(message, config.resource);
  }
};

module.exports = mylib;