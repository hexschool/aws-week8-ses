require('dotenv').config({ quiet: true, override: true });
const { randomUUID } = require('node:crypto');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

async function main() {
  const required = [
    'AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY',
    'SES_FROM_EMAIL', 'SES_TO_EMAIL',
  ];
  for (const name of required) {
    if (!process.env[name]?.trim()) throw new Error(`請填寫 .env 的 ${name}`);
  }

  if (process.env.AWS_REGION !== 'ap-northeast-1') {
    throw new Error('本週使用東京，AWS_REGION 請填 ap-northeast-1');
  }
  if (process.env.SES_FROM_EMAIL !== process.env.SES_TO_EMAIL) {
    throw new Error('本週寄給自己，SES_FROM_EMAIL 與 SES_TO_EMAIL 請填同一個已驗證信箱');
  }

  const client = new SESClient({
    region: process.env.AWS_REGION,
    // 明確使用本次練習的 Key，避免借到電腦上其他 AWS 身分。
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    maxAttempts: 1,
  });
  const subject = `LiveFit W8 寄信測試 ${randomUUID().slice(0, 8)}`;
  const sentAt = new Date().toISOString();
  const result = await client.send(new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL,
    Destination: { ToAddresses: [process.env.SES_TO_EMAIL] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Text: { Data: `這封信是我用本機 Node.js 寄的。\n時間：${sentAt}`, Charset: 'UTF-8' },
      },
    },
  }));
  if (!result.MessageId) throw new Error('SES 沒有回傳 MessageId，請查寄送結果');
  console.log('SES 已接受寄送請求，請到信箱確認。');
  console.log('主旨：', subject);
  console.log('MessageId：', result.MessageId);
}

main().catch((error) => {
  console.error('寄信失敗：', error.name, error.message);
  process.exitCode = 1;
});
