const s = require('../services/authService');
function login(req,res) { res.json(s.login(req.body.email,req.body.senha)); }
function cadastro(req,res) { res.status(201).json(s.cadastrar({...req.body,perfil:'cliente'})); }
module.exports = {login,cadastro};
