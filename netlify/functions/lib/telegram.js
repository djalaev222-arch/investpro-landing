const https = require('https');

const TELEGRAM_API = 'api.telegram.org';

function sendLeadNotification(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const lines = [
    '📩 <b>Новая заявка!</b>',
    '',
    `👤 <b>Имя:</b> ${escapeHtml(lead.name)}`,
    lead.phone ? `📱 <b>Телефон:</b> ${escapeHtml(lead.phone)}` : null,
    lead.email ? `✉️ <b>Email:</b> ${escapeHtml(lead.email)}` : null,
    lead.tariff ? `💼 <b>Тариф:</b> ${escapeHtml(lead.tariff)}` : null,
    `🕐 <b>Время:</b> ${new Date(lead.date).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
  ].filter(Boolean).join('\n');

  const body = JSON.stringify({
    chat_id: chatId,
    text: lines,
    parse_mode: 'HTML',
  });

  const options = {
    hostname: TELEGRAM_API,
    path: `/bot${token}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      res.resume();
      if (res.statusCode !== 200) {
        console.error(`[Telegram] Ошибка: HTTP ${res.statusCode}`);
      }
      resolve();
    });

    req.on('error', (err) => {
      console.error('[Telegram] Не удалось отправить уведомление:', err.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

module.exports = { sendLeadNotification };
