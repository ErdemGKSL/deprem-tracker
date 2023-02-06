const dbi = require("../dbi");
const path = require("path");
const fs = require("fs");
const fetchDeprems = require("../fetch-deprems");
const { makeSureFileExistsSync } = require("stuffs");
const channelsPath = path.join(process.cwd(), "./channels.json");
makeSureFileExistsSync(channelsPath, "{}")
const channels = require(channelsPath);
const postedDepremsPath = path.join(process.cwd(), "./posted-deprems.json");
makeSureFileExistsSync(postedDepremsPath, "[]")
const postedDeprems = require(postedDepremsPath);

dbi.register(({ ChatInput, Event, ChatInputOptions }) => {

  ChatInput({
    name: "kanal ekle",
    description: "Deprem takip kanalı ekler",
    defaultMemberPermissions: ["Administrator"],
    onExecute: async ({ interaction }) => {
      const channel = interaction.options.get("kanal")?.value;
      channels[channel] = interaction.guildId;
      fs.writeFileSync(channelsPath, JSON.stringify(channels));
      return `Deprem takip kanalı <#${channel}> olarak ayarlandı!`;
    },
    options: [
      ChatInputOptions.channel({
        name: "kanal",
        description: "Deprem takip kanalı",
        required: true,
      })
    ]
  });

  ChatInput({
    name: "kanal kaldır",
    description: "Deprem takip kanalı kaldırır",
    defaultMemberPermissions: ["Administrator"],
    onExecute: async ({ interaction }) => {
      const channel = interaction.options.get("kanal")?.value;
      if (interaction.guildId !== channels[channel]) return interaction.reply({
        content: "Kanal bulunamadı."
      });
      delete channels[channel];
      fs.writeFileSync(channelsPath, JSON.stringify(channels));
      return interaction.reply({
        content: `Deprem takip kanalı <#${channel}> kaldırıldı!`
      });
    },
    options: [
      ChatInputOptions.stringAutocomplete({
        name: "kanal",
        description: "Deprem takip kanalı",
        required: true,
        onComplete: async ({ interaction }) => {
          return Object.entries(channels).filter(([channelId, guildId]) => guildId === interaction.guildId).map(([channelId, guildId]) => {
            return {
              name: interaction.client.channels.cache.get(channelId)?.name ?? channelId,
              value: channelId,
            };
          });
        }
      })
    ]
  });

  Event({
    name: "ready",
    onExecute: async ({ client }) => {
      const config = require("../config.json");
      setInterval(async () => {
        const deprems = await fetchDeprems();
        const importantDeprems = deprems.filter(
          (deprem) => deprem.ML >= config.MINIMUM_MAGNITUDE
        );
        const newDeprems = importantDeprems.filter(
          (deprem) => !postedDeprems.includes(deprem.id)
        );
        if (newDeprems.length > 0) {
          const message = newDeprems
            .map(
              (deprem) =>
                `**${deprem.date} ${deprem.time}** - ${deprem.ML} Büyüklük - ${deprem.location} - ${deprem.city}`
            )
            .join("\n");
          for (const channelId of Object.keys(channels)) {
            const channel = client.channels.cache.get(channelId);
            if (channel) {
              await channel.send(message).catch(() => { })
            }
          }
          postedDeprems.push(...newDeprems.map((deprem) => deprem.id));
          fs.writeFileSync(
            postedDepremsPath,
            JSON.stringify(postedDeprems, null, 2)
          );
        }
      }, config.CONTROL_INTERVAL_SECONDS * 1000);
    },
  });

});

