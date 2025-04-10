const express = require('express');
const path = require('path');
const app = express();

// Налаштування статичних файлів
app.use(express.static(path.join(__dirname)));

// Маршрут для головної сторінки
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});