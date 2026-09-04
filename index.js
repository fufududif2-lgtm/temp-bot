const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// ضع هنا ID الروم الصوتية الرئيسية التي يدخلها الأعضاء لإنشاء روم جديدة
const CREATE_CHANNEL_ID = 'ضع_هنا_ID_الروم_الرئيسية'; 

// مصفوفة لحفظ أرقام الرومات المؤقتة التي تم إنشاؤها
const tempChannels = new Set();

client.on('voiceStateUpdate', async (oldState, newState) => {
    // 1. عند دخول العضو للروم الرئيسية
    if (newState.channelId === CREATE_CHANNEL_ID) {
        const guild = newState.guild;
        const user = newState.member.user;

        // إنشاء روم جديدة باسم الشخص
        const createdChannel = await guild.channels.create({
            name: `🔊 ${user.username}'s Room`,
            type: ChannelType.GuildVoice,
            parent: newState.channel.parentId, // إنشاؤها في نفس القسم (Category)
        });

        // إضافة الروم للمصفوفة لنعرف أنها روم مؤقتة
        tempChannels.add(createdChannel.id);

        // نقل العضو للروم الجديدة
        await newState.setChannel(createdChannel);
    }

    // 2. عند خروج العضو من أي روم
    if (oldState.channel) {
        const oldChannel = oldState.channel;

        // التأكد أن الروم من ضمن الرومات المؤقتة وأنها أصبحت فارغة (0 أعضاء)
        if (tempChannels.has(oldChannel.id) && oldChannel.members.size === 0) {
            tempChannels.delete(oldChannel.id);
            await oldChannel.delete().catch(() => null);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
