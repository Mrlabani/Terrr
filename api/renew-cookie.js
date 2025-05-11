import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const users = [
  {
    id: '7442532306',  // Replace with actual Telegram user IDs
    email: process.env.EMAIL,
    password: process.env.PASSWORD,
  }
];

export default async function handler(req, res) {
  for (const user of users) {
    try {
      const response = await fetch('https://1024terabox.com/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
        }),
      });

      const data = await response.json();

      if (data?.code === 0) {
        const cookie = response.headers.get('set-cookie');
        const cookiesJson = { cookie };

        // Save cookies as JSON
        const filePath = path.join('/tmp', `${user.id}_cookies.json`);
        fs.writeFileSync(filePath, JSON.stringify(cookiesJson, null, 2));

        console.log(`Cookies refreshed for ${user.email}`);
      } else {
        console.log(`Login failed for ${user.email}`);
      }
    } catch (err) {
      console.error('Auto refresh failed for', user.email, err);
    }
  }

  res.status(200).send('Cookie auto-renew complete');
}
