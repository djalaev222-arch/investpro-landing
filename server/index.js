const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const LEADS_FILE = path.join(__dirname, '../data/leads.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

if (!fs.existsSync(LEADS_FILE)) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf8');
}
let leadsCache = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8'));

app.post('/api/leads', (req, res) => {
  const { name, phone, email, tariff } = req.body;

  if (!name || (!phone && !email)) {
    return res.status(400).json({ error: 'Заполните имя и контакт' });
  }

  leadsCache.push({ name, phone, email, tariff: tariff || '', date: new Date().toISOString() });
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leadsCache, null, 2), 'utf8');

  res.json({ success: true, message: 'Заявка принята!' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Лендинг запущен: http://localhost:${PORT}`);
});
