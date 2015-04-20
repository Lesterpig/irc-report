var fs       = require("fs")
var path     = require("path");
var moment   = require("moment");
var mailer   = require("nodemailer");
var pool     = require("nodemailer-smtp-pool");
var mustache = require("mustache");
var conf     = require("./config.js");

module.exports = {

  transport: undefined,
  template:  undefined,

  /**
   * Sync
   * Init SMTP Pool and template
   */
  init: function() {
    this.transport = mailer.createTransport(pool(conf.mail));
    this.template  = fs.readFileSync(path.join(__dirname, "views", "default"), {encoding: "utf8"});
    mustache.parse(this.template);
  },

  send: function(channel, domain, data, mail) {
    this.transport.sendMail({
      from: conf.mail.from,
      to: mail,
      subject: "[IRC LOG] " + channel,
      text: mustache.render(this.template, {
        channel: channel,
        date: domain,
        data: data,
        server: conf.server
      })
    });

    console.log("-- Sent mail to " + mail + " for channel " + channel);
  }
}