const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // Escolha uma porta para o seu servidor

// Configurar o Express para servir arquivos estáticos na pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Definir uma rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor está rodando em http://localhost:${port}`);
});
