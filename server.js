const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./server/routes/auth');
const appointmentRoutes = require('./server/routes/appointments');
const reportRoutes = require('./server/routes/reports');
const jwt = require('jsonwebtoken');
const app = express(); // Inicializa o Express
const secret = process.env.JWT_SECRET; // Token secreto para autenticação
const tokenExpiration = '1h'; // Duração do token JWT

const http = require('http');
const httpPort = process.env.HTTP_PORT || 4000; // Porta para o servidor HTTP

dotenv.config(); // Serve Para Carregar Variaveis de Ambiente
require('dotenv').config();  //carregar variaveis de ambiente

// Carregar o certificado e a chave privada gerado pelo openSSl em meu nome
const options = {
  key: Buffer.from(process.env.SSL_KEY, 'utf-8'),
  cert: Buffer.from(process.env.SSL_CERT, 'utf-8')
};

// Configuração do CORS (politica de acesso)
app.use(cors({
  origin: '*', // Permite acesso de qualquer origem
  methods: '*', // Permite todas as métodos HTTP
  credentials: true, // Permite cookies e autenticação
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', ))); // Serve para Carregar Paginas estáticas

// Definindo as rotas da API de autenticação do cliente e Agendamentos

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', appointmentRoutes); 

function generateToken(username, user) { 
  return jwt.sign({ username, id: user._id }, secret, { expiresIn: tokenExpiration }); // Gerar token JWT
    
}
// renovação de token 30 minutos após a criação
app.post('/api/token/refresh', (req, res) => {
  const token = req.body.token;
  if (!token) return res.sendStatus(403); // Proibido

  jwt.verify(token, secret, (err, username) => {
      if (err) return res.sendStatus(403); // Proibido
      const newToken = generateToken(username);
      res.json({ token: newToken });
  });
});


// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Banco de Dados MongoDB-Cloud connectado com Sucesso'))
    .catch(err => console.log(err));

// Iniciar o servidor HTTP
http.createServer(app).listen(httpPort, () => {
  console.log(`Servidor HTTP rodando em http://localhost:${httpPort}`);
});
