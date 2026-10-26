const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { mensagemErro } = require('./services/catalogoService');
const app = express();
app.use(cors());
app.use(express.json({limit:'64kb'}));
app.use((req,res,next) => { req.body ??= {}; next(); });
app.use(routes);
app.use((req,res) => res.status(404).json({mensagem:'Rota não encontrada.'}));
app.use((erro,req,res,next) => {
  if (erro.type === 'entity.parse.failed') return res.status(400).json({mensagem:'JSON inválido.'});
  const status = erro.status || (erro.code?.startsWith('ERR_SQLITE') ? 400 : 500);
  res.status(status).json({mensagem:mensagemErro(erro)});
});
module.exports = app;
