module.exports = {

  server: "",
  nick: "__reporter__",
  channels: ["#example"],
  mail: {
    "from": "IRC REPORT <noreply@example.com>",
    "to": "me@example.com",
    "port": 465,
    "secure": true,
    "ignoreTLS": true,
    "host": "example.com",
    "auth": {
      "user": "username",
      "pass": "********"
    }
  }

};