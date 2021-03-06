var irc    = require("irc");
var conf   = require("./config.js");
var files  = require("./files.js");
var mailer = require("./mailer.js");

// Init

files.init();
mailer.init();

// Connection

console.log("-- Connecting to: " + conf.server)

var client = new irc.Client(conf.server, conf.nick, {
  channels: conf.channels,
  userName: 'ircReporter',
  realName: 'nodejs irc reporter',
  autoRejoin: true
});

// Events

function isCommand(s) {
  if(s.length < 2) {
    return false;
  }
  return s[0] === "_" && s[1] === "_";
}

client.on("registered", function() {
  console.log("-- Connected, waiting for messages.");
});

client.on("error", function(err) {
  console.log("!! " + err);
  logout();
});

client.on("pm", function(nick, text) {
  if(!isCommand(text)) {
    client.say(nick, "Type '__help' for more information.");
  }
});

client.on("message", function(nick, to, text) {
  if(text !== "__help") {
    return;
  }

  client.say(nick, "IRC-REPORT v" + require("./package.json").version + " ~ https://github.com/Lesterpig/irc-report");
  client.say(nick, "I'm logging messages and send it daily to registered emails addresses.");
  client.say(nick, "Available commands:");
  // TODO : client.say(nick, "__register <mail>  . . . . . . . . . : register your email address for this channel");
  // TODO : client.say(nick, "__unregister <mail> <token>  . . . . : unsubscribe for this channel, providing token given in your mails");
  client.say(nick, "__help  . . . . . . . . . . . . . . : display this text");

});

client.on("message#", function(nick, to, text) {
  if(!isCommand(text)) {
    files.append(to, nick, text);
  }
});

// Disconnection

function logout() {
  client.disconnect("Goodbye!", function() {
    process.exit();
  });
}

process.on("SIGINT", logout);