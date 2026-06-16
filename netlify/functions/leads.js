const { sendLeadNotification } = require('./lib/telegram');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Невалидный JSON' }) };
  }

  const { name, phone, email, tariff, _honeypot } = body;

  if (_honeypot) {
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }

  if (!name || !name.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Заполните имя' }) };
  }

  if (!phone && !email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Заполните телефон или email' }) };
  }

  if (name.length > 100 || (phone && phone.length > 30) || (email && email.length > 100)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Некорректные данные' }) };
  }

  const lead = {
    name: name.trim(),
    phone: phone ? phone.trim() : '',
    email: email ? email.trim() : '',
    tariff: tariff ? tariff.trim() : '',
    date: new Date().toISOString(),
  };

  await sendLeadNotification(lead);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, message: 'Заявка принята!' }),
  };
};
