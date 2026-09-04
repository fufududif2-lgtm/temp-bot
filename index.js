const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// ID روم Create الخاصة بسيرفرك
const CREATE_CHANNEL_ID = '1280053913072210002'; 

const tempChannels = new Set();

client.on('ready', () => {
    console.log(`Bot Online! Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // 1. عند دخول العضو روم Create ينشئ له روم جديدة وينقله فوراً
    if (newState.channelId === CREATE_CHANNEL_ID) {
        const guild = newState.guild;
        const user = newState.member.user;

        try {
            const createdChannel = await guild.channels.create({
                name: `🔊 ${user.username}`,
                type: ChannelType.GuildVoice,
                parent: newState.channel ? newState.channel.parentId : null,
            });

            tempChannels.add(createdChannel.id);
            await newState.setChannel(createdChannel);
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    }

    // 2. عند خروج العضو وتصبح الروم المؤقتة 0 أعضاء يتم حذفها فوراً
    if (oldState.channel) {
        const oldChannel = oldState.channel;
        if (tempChannels.has(oldChannel.id) && oldChannel.members.size === 0) {
            tempChannels.delete(oldChannel.id);
            await oldChannel.delete().catch(err => console.error('Error deleting channel:', err));
        }
    }
});

// تسجيل الدخول باستخدام التوكن المحفوظ في متغيرات البيئة بـ Render
client.login(process.env.DISCORD_TOKEN);
