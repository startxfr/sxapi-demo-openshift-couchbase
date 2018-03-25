
var sxapi = require("sxapi-core");
var $app = sxapi.app;
$app.launch(function () {
  var conf = $app.config;
  var name = conf.name + ' v' + conf.version;
  $app.log.info("application " + name + " STARTED", $app.timer.time('app'));
});
