const { Router } = require('express');
const authRoutes = require('./authRoutes');
const s = require('../services/authService');
const { Erro } = require('../services/catalogoService');
const router = Router();
router.use(authRoutes);
const id = req => {
  const valor = Number(req.params.id);
  if (!Number.isSafeInteger(valor) || valor < 1) throw new Erro('ID inválido.');
  return valor;
};
const autenticar = (req,res,next) => {
  const cabecalho = req.get('Authorization') || '';
  if (!cabecalho.startsWith('Bearer ')) throw new Erro('Informe o token Bearer.',401);
  req.token = cabecalho.slice(7); req.usuario = s.autenticarToken(req.token); next();
};
router.get('/jogos',(req,res) => {
  const f = {...req.query};
  for (const chave of ['plataforma_id','genero_id','distribuidora_id']) if (f[chave] !== undefined) f[chave] = Number(f[chave]);
  for (const chave of ['disponivel','promocao']) {
    if (f[chave] !== undefined && !['true','false'].includes(f[chave])) throw new Erro(`${chave}: use true ou false.`);
    f[chave] = f[chave] === 'true';
  }
  res.json(s.catalogo(f));
});
router.get('/jogos/:id',(req,res) => res.json(s.detalhe(id(req))));
for (const tipo of ['plataformas','generos','distribuidoras','criticos','estoque','avaliacoes']) router.get('/'+tipo,(req,res) => res.json(s.listar(tipo)));
router.post('/logout',autenticar,(req,res) => { s.logout(req.token); res.sendStatus(204); });
router.get('/conta',autenticar,(req,res) => res.json(s.usuario(req.usuario.id)));
router.patch('/conta',autenticar,(req,res) => res.json(s.atualizarConta(req.usuario.id,req.body)));
router.delete('/conta',autenticar,(req,res) => { s.excluirUsuario(req.usuario.id,req.usuario.id); res.sendStatus(204); });
router.get('/desejos',autenticar,(req,res) => res.json(s.desejos(req.usuario.id)));
router.post('/desejos',autenticar,(req,res) => res.status(201).json(s.salvarDesejo(req.usuario.id,req.body)));
router.patch('/desejos/:id',autenticar,(req,res) => res.json(s.salvarDesejo(req.usuario.id,req.body,id(req))));
router.delete('/desejos/:id',autenticar,(req,res) => { s.excluirDesejo(req.usuario.id,id(req)); res.sendStatus(204); });
router.use('/admin',autenticar,(req,res,next) => { s.exigir(req.usuario.id,true); next(); });
router.get('/admin/usuarios',(req,res) => res.json(s.listarUsuarios(req.usuario.id)));
router.post('/admin/usuarios',(req,res) => res.status(201).json(s.cadastrar(req.body,req.usuario.id)));
router.patch('/admin/usuarios/:id',(req,res) => res.json(s.atualizarUsuario(req.usuario.id,id(req),req.body)));
router.delete('/admin/usuarios/:id',(req,res) => { s.excluirUsuario(req.usuario.id,id(req)); res.sendStatus(204); });
for (const tipo of ['plataformas','generos','distribuidoras','criticos','jogos','estoque','avaliacoes']) {
  router.get('/admin/'+tipo,(req,res) => res.json(s.listar(tipo)));
  router.post('/admin/'+tipo,(req,res) => res.status(201).json(s.salvar(req.usuario.id,tipo,req.body)));
  router.patch('/admin/'+tipo+'/:id',(req,res) => res.json(s.salvar(req.usuario.id,tipo,req.body,id(req))));
  router.delete('/admin/'+tipo+'/:id',(req,res) => { s.excluir(req.usuario.id,tipo,id(req)); res.sendStatus(204); });
}
module.exports = router;
