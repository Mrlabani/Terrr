import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const bot = new Telegraf(process.env.BOT_TOKEN); // Replace with your bot token

// Command to log in and extract cookie
bot.command('login', async (ctx) => {
  const input = ctx.message.text.split(' ');
  const email = input[1];
  const password = input[2];

  if (!email || !password) {
    return ctx.reply('Usage: /login your_email your_password');
  }

  try {
    // Send login request to 1024terabox.com
    const response = await fetch('https://1024terabox.com/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data?.code !== 0) {
      return ctx.reply(`Login failed: ${data.message || 'Invalid credentials'}`);
    }

    const cookie = response.headers.get('set-cookie');
    const cookiesJson = { cookie };

    // Save cookies as JSON
    const filePath = path.join('/tmp', `${ctx.from.id}_cookies.json`);
    fs.writeFileSync(filePath, JSON.stringify(cookiesJson, null, 2));

    // Send cookies to the user
    await ctx.replyWithDocument({ source: filePath, filename: 'cookies.json' });

    console.log(`Cookies extracted and sent for ${email}`);
  } catch (error) {
    console.error(error);
    ctx.reply('Error during login.');
  }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await bot.handleUpdate(req.body);
    res.status(200).send('ok');
  } else {
    res.status(200).send('Bot is running...');
  }
}
