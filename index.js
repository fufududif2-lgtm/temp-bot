const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// ضع ID الروم الصوتية الرئيسية هنا
const CREATE_CHANNEL_ID = '1234567890123456789'; 

const tempChannels = new Set();

client.on('ready', () => {
    console.log(`Bot Online! Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // 1. عند دخول الروم الرئيسية -> إنشاء روم جديدة
    if (newState.channelId === CREATE_CHANNEL_ID) {
        const guild = newState.guild;
        const user = newState.member.user;

        try {
            const createdChannel = await guild.channels.create({
                name: `🔊 ${user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel.parentId,
            });

            tempChannels.add(createdChannel.id);
            await newState.setChannel(createdChannel);
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    }

    // 2. عند خروج عضو وتفريغ الروم -> حذف الروم المؤقتة
    if (oldState.channel) {
        const oldChannel = oldState.channel;
        if (tempChannels.has(oldChannel.id) && oldChannel.members.size === 0) {
            tempChannels.delete(oldChannel.id);
            await oldChannel.delete().catch(err => console.error('Error deleting channel:', err));
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
