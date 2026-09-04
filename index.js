const { Client, GatewayIntentBits, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = "MTU0NTE4MDg4NTUzODg0MDY0Ng.GYmXOV.Cu8Q3WpMrk8z73p-IbGJFsNQww_KP6KXPXyx3Y";
const JOIN_TO_CREATE_ID = "1545198832856473660";
const tempChannels = new Map();

client.on("ready", () => {
    console.log("Bot Online!");
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    if (newState.channelId === JOIN_TO_CREATE_ID) {
        const guild = newState.guild;
        const user = newState.member.user;

        try {
            const createdChannel = await guild.channels.create({
                name: "Temp | " + user.username,
                type: ChannelType.GuildVoice,
                parent: newState.channel.parentId,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionsBitField.Flags.ManageChannels,
                            PermissionsBitField.Flags.MoveMembers,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.Connect
                        ]
                    }
                ]
            });

            await newState.setChannel(createdChannel);
            tempChannels.set(createdChannel.id, user.id);

            const embed = new EmbedBuilder()
                .setColor(0x2b2d31)
                .setTitle("للتحكم في الروم الخاص بك الصوتي المؤقت")
                .setDescription("المزيد من الخيارات متاحة من خلال هذه الأزرار");

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("lock_channel").setLabel("قفل").setEmoji("🔒").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("unlock_channel").setLabel("فتح").setEmoji("🔓").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("hide_channel").setLabel("إخفاء").setEmoji("👁️").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("unhide_channel").setLabel("إظهار").setEmoji("👀").setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("kick_user").setLabel("طرد").setEmoji("🚫").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("ban_user").setLabel("حظر").setEmoji("🔨").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("unban_user").setLabel("إلغاء الحظر").setEmoji("✅").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("invite_user").setLabel("دعوة").setEmoji("📩").setStyle(ButtonStyle.Secondary)
            );

            const row3 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("rename_channel").setLabel("الاسم").setEmoji("✏️").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("user_limit").setLabel("حد الأعضاء").setEmoji("👥").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("claim_ownership").setLabel("ريجن الروم").setEmoji("🌐").setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("bitrate").setLabel("بِرت أعلى").setEmoji("🔊").setStyle(ButtonStyle.Secondary)
            );

            const row4 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("allow_user").setLabel("سماح").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("deny_user").setLabel("إلغاء السماح").setStyle(ButtonStyle.Danger)
            );

            await createdChannel.send({
                content: `${user}`,
                embeds: [embed],
                components: [row1, row2, row3, row4]
            }).catch(() => {});
        } catch (e) {
            console.error(e);
        }
    }

    if (oldState.channel) {
        if (oldState.channel.name.startsWith("Temp |") && oldState.channel.members.size === 0) {
            await oldState.channel.delete().catch(() => {});
        }
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;

    const channel = interaction.channel;
    const ownerId = tempChannels.get(channel.id);

    if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: "عذراً، أنت لست صاحب هذا الروم!", ephemeral: true });
    }

    if (interaction.customId === "lock_channel") {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { Connect: false });
        await interaction.reply({ content: "🔒 تم قفل الروم ومنع الدخول.", ephemeral: true });
    } else if (interaction.customId === "unlock_channel") {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { Connect: true });
        await interaction.reply({ content: "🔓 تم فتح الروم للجميع.", ephemeral: true });
    } else if (interaction.customId === "hide_channel") {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: false });
        await interaction.reply({ content: "👁️ تم إخفاء الروم.", ephemeral: true });
    } else if (interaction.customId === "unhide_channel") {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: true });
        await interaction.reply({ content: "👀 تم إظهار الروم.", ephemeral: true });
    } else {
        await interaction.reply({ content: "⚙️ هذه الميزة قيد الإعداد.", ephemeral: true });
    }
});

client.login(TOKEN);