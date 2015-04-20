var fs     = require("fs")
var path   = require("path");
var moment = require("moment");
var conf   = require("./config.js");
var mailer = require("./mailer.js");

var tmp  = path.join(__dirname, "tmp");
var cron = path.join(tmp, ".cron");


module.exports = {

  currentDomain: undefined,

  /**
   * Sync.
   * Init local variables and internal files.
   */
  init: function() {
    if(!fs.existsSync(tmp)) {
      fs.mkdirSync(tmp);
    }

    if(!fs.existsSync(cron)) {
      this.saveDomain();
    } else {
      this.currentDomain = fs.readFileSync(cron, {encoding: "utf8"});
    }

    this.checkDomain();
    setInterval(this.checkDomain.bind(this), 1000*60); // check every minute.
  },

  /**
   * Async.
   * Save an IRC message into a file.
   */
  append: function(channel, from, msg) {
    var row = "[" + moment().format("HH:mm") + "]" + " <" + from + "> " + msg + "\n";
    fs.appendFile(getFilename(channel), row);
  },

  getDomain: function() {
    return moment().format("YYYYMMDD");
  },

  /**
   * Async.
   * Save new domain to filesystem.
   */
  saveDomain: function() {
    this.currentDomain = this.getDomain();
    fs.writeFile(cron, this.currentDomain, {encoding: "utf8"});
  },

  // TODO error handling
  checkDomain: function() {
    if(this.currentDomain === this.getDomain()) {
      return; // TODO add hour configuration
    }

    var oldDomain = this.currentDomain;
    this.saveDomain();

    conf.channels.forEach(function(channel) {
      var filename = getFilename(channel);
      (function(filename, channel) {
        fs.exists(filename, function(exists) {
          if(!exists) {
            return;
          }
          fs.rename(filename, filename + ".bak", function(err) {
            fs.readFile(filename + ".bak", {encoding: "utf8"}, function(err, data) {
              fs.unlink(filename + ".bak");
              mailer.send(channel, moment(oldDomain, "YYYYMMDD").format("ll"), data, conf.mail.to);
            });
          });
        });
      })(filename, channel);
    });


  },

}

function getFilename(channel) {
  channel = channel.replace(/\#/, "");
  return path.join(tmp, channel + ".log");
}