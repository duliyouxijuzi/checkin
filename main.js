import { createRequire } from 'module';
const process = {
  env: {
    GLADOS: "__stripe_mid=d67f0fa6-b4ec-4abe-8c77-f5f9bb60baa80e2481; koa:sess=eyJ1c2VySWQiOjUxMjY3MCwiX2V4cGlyZSI6MTc0NTQ5NzkwNTgyNiwiX21heEFnZSI6MjU5MjAwMDAwMDB9; koa:sess.sig=gVe9pfmGBWVEU5uG3GcuwlkjwFY; _gid=GA1.2.1825050085.1722653747; _ga_CZFVKMNT9J=GS1.1.1722653746.3.1.1722653751.0.0.0; _ga=GA1.2.872513011.1698495172",
    MAIL_SENDER: "1083849060@qq.com",
    MAIL_RECEIVER: "17771435561@163.com",
    MAIL_KEY: "ujwdmtjmtckhfgjb"
  }
};

const glados = async () => {
  const cookie = process.env.GLADOS
  if (!cookie) return
  try {
    const headers = {
      'cookie': cookie,
      'referer': 'https://glados.rocks/console/checkin',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    }
    const checkin = await fetch('https://glados.rocks/api/user/checkin', {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json' },
      body: '{"token": "glados.one"}',
    }).then((r) => r.json())
    const status = await fetch('https://glados.rocks/api/user/status', {
      method: 'GET',
      headers,
    }).then((r) => r.json())
    return [
      '今日签到成功',
      `${checkin.message}`,
      `本次签到获得点数:  ${checkin.points}`,
      `当前套餐是 Basic Plan, ${Number(status.data.leftDays)} 天后到期`,
    ]
  } catch (error) {
    return [
      '今日签到失败',
      `失败消息：${error}`,
      `<${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}>`,
      ''
    ]
  }
}
const mailnotify = async (contents) => {
  const sender = process.env.MAIL_SENDER
  const receiver = process.env.MAIL_RECEIVER
  const mail_key = process.env.MAIL_KEY
  if (!sender || !receiver || !mail_key || !contents) return
  const require = createRequire(import.meta.url);
  const nodemailer = require('nodemailer');
  const path = require('path');

  let transporter = nodemailer.createTransport({
    service: 'qq',
    secure: true,	//安全方式发送,建议都加上
    auth: {
      user: sender,
      pass: mail_key
    }
  });

  const day = Math.floor((new Date() - new Date("2024-8-1")) / (1000 * 60 * 60 * 24));

  let mailOptions = {
    from: ' "GLaDOS签到机器人" <1083849060@qq.com>',
    to: receiver,
    subject: contents[0],
    text: 'hello nodemailer',
    html: `<!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>GlaDOS每日签到</title>
      </head>
      <body>
        <div style="width:100%; margin: 40px auto;font-size:20px; color:#5f5e5e;text-align:center">
          <span>今天是GLaDOS自动签到的第</span>
          <span style="font-size:24px;color:rgb(221, 73, 73)">
            ${day}
          </span>
          <span>天</span>
        </div>
        <div style="width:100%; margin: 0 auto;color:#5f5e5e;text-align:center">
          <img style="background: #0097e0" src="https://glados.rocks/images/logo-new.png" alt="GLaDOS图标" />
          <b style="display:block;color:#333;font-size:24px;margin:15px 0;">${contents[0]}</b>
          <span style="display:block;color:#333;font-size:22px;margin:15px 0;">${contents[1]}</span>
          <span style="display:block;color:#676767;font-size:20px">${contents[2]}</span>
          <span style="display:block;color:#676767;font-size:20px">${contents[3]}</span>
        </div>
        <div style="text-align:center;margin:35px 0;">
        <img src="http://image.wufazhuce.com/FhACc4YBWRGpOGfiIUrpPz4BmcVB" style="width:100%;margin-top:10px;"
          alt="ONE配图" />
        <div style="margin:10px auto;width:85%;color:#5f5e5e;">
          若深情不能对等，愿爱得更多的人是我。
        </div>
      </div>
      </body>
    </html>`,
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error(error);
    }
    console.log('response: %s', info.response);
    // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
  });
}

const main = async () => {
  await mailnotify(await glados())
}

main()
