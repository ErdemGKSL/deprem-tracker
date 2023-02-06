// use .env file for environment variables
const config = require("./config.json");
const { createDBI } = require('@mostfeatured/dbi');

module.exports = createDBI("dbi", {
  discord: {
    token: config.DISCORD_TOKEN,
    options: {
      intents: ["Guilds", "GuildMessages"],
    }
  },
  defaults: {
    locale: "tr",
    directMessages: false,
    defaultMemberPermissions: ["ViewChannel", "SendMessages"],
  }
});
