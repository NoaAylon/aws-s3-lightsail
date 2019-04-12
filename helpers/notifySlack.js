const slack_webhook = require("slack-webhook");

function notifySlack(webhookUri) {
  slack = new slack_webhook(webhookUri);
  slack.send(
    {
      channel: "#cloud-2019-group-19",
      username: "webhookbot",
      text: "ALERT: Invalid file was found!"
    },
    function(err, response) {
      console.log(response);
    }
  );
}

module.exports = notifySlack;
