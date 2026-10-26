const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { abrirBanco } = require('../src/database');
const { CatalogoService } = require('../src/services/catalogoService');
function contexto(t) {
  const db = abrirBanco(':memory:'); t.after(() => db.close());
  const s = new CatalogoService(db);
  const admin = s.cadastrar({nome:'Admin',email:'admin@loja.com',senha:'segredo123',perfil:'admin'},null,true).id;
  const cliente = s.cadastrar({nome:'Cliente',email:'cliente@loja.com',senha:'segredo123'}).id;
  const ref = {};
  for (const tipo of ['plataformas','generos','distribuidoras']) ref[tipo] = s.salvar(admin,tipo,{nome:tipo}).id;
  const jogo = s.salvar(admin,'jogos',{titulo:'Jogo Teste',plataforma_id:ref.plataformas,genero_id:ref.generos,distribuidora_id:ref.distribuidoras,preco_centavos:20000});
  return {s,admin,cliente,jogo,ref};
}
test('CRUD dos cadastros auxiliares e proteção dos vínculos',t => {
  const {s,admin,ref} = contexto(t);
  for (const tipo of ['plataformas','generos','distribuidoras','criticos']) {
    const r = s.salvar(admin,tipo,{nome:'Novo',site:'https://exemplo.com'});
    assert.equal(s.salvar(admin,tipo,{nome:'Editado'},r.id).nome,'Editado');
    assert.ok(s.listar(tipo).some(x=>x.id===r.id));
    s.excluir(admin,tipo,r.id); assert.throws(()=>s.existe(tipo,r.id));
  }
  assert.throws(()=>s.excluir(admin,'plataformas',ref.plataformas),/FOREIGN KEY/);
});
test('acesso público, filtros combinados, promoção e estoque',t => {
  const {s,admin,jogo,ref} = contexto(t);
  assert.equal(s.catalogo().length,1); assert.equal(s.catalogo({disponivel:true}).length,0);
  const e = s.salvar(admin,'estoque',{jogo_id:jogo.id,quantidade:5});
  s.salvar(admin,'jogos',{promocao_centavos:15000},jogo.id);
  assert.equal(s.catalogo({busca:'Teste',plataforma_id:ref.plataformas,genero_id:ref.generos,distribuidora_id:ref.distribuidoras,disponivel:true,promocao:true})[0].preco_atual_centavos,15000);
  assert.equal(s.catalogo({busca:'%'}).length,0);
  assert.throws(()=>s.salvar(admin,'estoque',{quantidade:-1},e.id));
  assert.throws(()=>s.salvar(admin,'estoque',{quantidade:1.5},e.id));
  assert.throws(()=>s.salvar(admin,'jogos',{promocao_centavos:20000},jogo.id));
  s.salvar(admin,'estoque',{quantidade:0},e.id);
  assert.equal(s.catalogo({disponivel:true}).length,0);
  s.excluir(admin,'estoque',e.id); assert.equal(s.detalhe(jogo.id).quantidade,0);
});
test('avaliações reais informadas pelo administrador e escala normalizada',t => {
  const {s,admin,jogo} = contexto(t);
  const c = s.salvar(admin,'criticos',{nome:'Fonte',site:'https://exemplo.com'});
  const a = s.salvar(admin,'avaliacoes',{jogo_id:jogo.id,critico_id:c.id,nota:90,url:'https://exemplo.com/review'});
  assert.equal(s.detalhe(jogo.id).avaliacoes[0].critico,'Fonte');
  assert.throws(()=>s.salvar(admin,'avaliacoes',{nota:101},a.id));
  assert.throws(()=>s.salvar(admin,'avaliacoes',{url:'javascript:alert(1)'},a.id));
  assert.equal(s.salvar(admin,'avaliacoes',{nota:85},a.id).nota,85);
  s.excluir(admin,'avaliacoes',a.id); assert.equal(s.detalhe(jogo.id).avaliacoes.length,0);
});
test('autenticação, expiração, logout e acesso administrativo',t => {
  const {s,cliente} = contexto(t);
  assert.throws(()=>s.login('cliente@loja.com','errada'));
  const login = s.login('CLIENTE@LOJA.COM','segredo123');
  assert.equal(s.autenticarToken(login.token).id,cliente); assert.equal(login.usuario.senha,undefined);
  assert.notEqual(s.linha('SELECT senha FROM usuarios WHERE id=?',cliente).senha,'segredo123');
  assert.throws(()=>s.salvar(cliente,'generos',{nome:'X'}),e=>e.status===403);
  assert.throws(()=>s.salvar(null,'generos',{nome:'X'}),e=>e.status===401);
  assert.throws(()=>s.cadastrar({nome:'X',email:'x@y.com',senha:'12345678',perfil:'admin'}));
  s.logout(login.token); assert.throws(()=>s.autenticarToken(login.token));
  const outro = s.login('cliente@loja.com','segredo123');
  s.executar('UPDATE sessoes SET expira=0'); assert.throws(()=>s.autenticarToken(outro.token));
});
test('lista de desejos privada, CRUD e remoção em cascata',t => {
  const {s,admin,cliente,jogo} = contexto(t);
  assert.throws(()=>s.desejos(null));
  const d = s.salvarDesejo(cliente,{jogo_id:jogo.id,observacao:'Quero promoção'});
  assert.equal(s.desejos(cliente).length,1); assert.equal(s.desejos(admin).length,0);
  assert.throws(()=>s.salvarDesejo(cliente,{jogo_id:jogo.id}));
  assert.throws(()=>s.salvarDesejo(admin,{observacao:'Invadir'},d.id));
  assert.throws(()=>s.excluirDesejo(admin,d.id));
  assert.equal(s.salvarDesejo(cliente,{observacao:'Atualizado'},d.id).observacao,'Atualizado');
  s.excluirDesejo(cliente,d.id); assert.equal(s.desejos(cliente).length,0);
  s.salvarDesejo(cliente,{jogo_id:jogo.id});
  s.excluir(admin,'jogos',jogo.id); assert.equal(s.desejos(cliente).length,0);
});
test('conta, senha, preferências e último administrador',t => {
  const {s,admin,cliente} = contexto(t);
  const token = s.login('cliente@loja.com','segredo123').token;
  s.atualizarConta(cliente,{nome:'Novo',preferencias:{tema:'escuro',somente_disponiveis:true}});
  assert.equal(s.usuario(cliente).preferencias.tema,'escuro');
  assert.throws(()=>s.atualizarConta(cliente,{senha:'nova12345',senha_atual:'errada'}));
  s.atualizarConta(cliente,{senha:'nova12345',senha_atual:'segredo123'});
  assert.throws(()=>s.autenticarToken(token)); assert.ok(s.login('cliente@loja.com','nova12345'));
  assert.throws(()=>s.excluirUsuario(admin,admin));
  assert.throws(()=>s.atualizarUsuario(admin,admin,{perfil:'cliente'}));
  assert.throws(()=>s.excluirUsuario(cliente,admin));
  assert.equal(s.atualizarUsuario(admin,cliente,{nome:'Editado pelo admin'}).nome,'Editado pelo admin');
  s.excluirUsuario(cliente,cliente); assert.throws(()=>s.usuario(cliente));
});
test('persistência após fechar e reabrir o banco',t => {
  const pasta = mkdtempSync(join(tmpdir(),'lambari-')); t.after(()=>rmSync(pasta,{recursive:true}));
  const arquivo = join(pasta,'teste.sqlite');
  let db = abrirBanco(arquivo), s = new CatalogoService(db);
  s.cadastrar({nome:'Persistente',email:'teste@loja.com',senha:'senha1234'}); db.close();
  db = abrirBanco(arquivo); s = new CatalogoService(db);
  assert.equal(s.login('teste@loja.com','senha1234').usuario.nome,'Persistente'); db.close();
});
