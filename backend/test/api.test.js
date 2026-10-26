const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const pasta = mkdtempSync(join(tmpdir(),'lambari-api-'));
process.env.LAMBARI_DB = join(pasta,'api.sqlite');
const app = require('../src/app');
const s = require('../src/services/authService');
test('API HTTP: catálogo público, autenticação, CRUD e isolamento de desejos',async t => {
  const servidor = app.listen(0,'127.0.0.1');
  await new Promise((resolve,reject)=>{servidor.once('listening',resolve);servidor.once('error',reject);});
  t.after(async()=>{await new Promise(resolve=>servidor.close(resolve));s.db.close();rmSync(pasta,{recursive:true});});
  const base = `http://127.0.0.1:${servidor.address().port}`;
  async function chamar(rota,method='GET',body,token) {
    const r = await fetch(base+rota,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});
    return {status:r.status,body:r.status===204?null:await r.json()};
  }
  s.cadastrar({nome:'Admin',email:'admin@loja.com',senha:'segredo123',perfil:'admin'},null,true);
  assert.equal((await chamar('/jogos')).status,200);
  assert.equal((await chamar('/admin/jogos','POST',{})).status,401);
  assert.equal((await chamar('/login','POST',{email:'admin@loja.com',senha:'errada'})).status,401);
  const token = (await chamar('/login','POST',{email:'admin@loja.com',senha:'segredo123'})).body.token;
  const cadastro = await chamar('/cadastro','POST',{nome:'Cliente',email:'cliente@loja.com',senha:'segredo123',perfil:'admin'});
  assert.equal(cadastro.status,201); assert.equal(cadastro.body.perfil,'cliente');
  const cliente = (await chamar('/login','POST',{email:'cliente@loja.com',senha:'segredo123'})).body.token;
  assert.equal((await chamar('/admin/jogos','POST',{},cliente)).status,403);
  const refs = {};
  for (const tipo of ['plataformas','generos','distribuidoras']) {
    const r = await chamar('/admin/'+tipo,'POST',{nome:tipo},token);
    assert.equal(r.status,201); refs[tipo] = r.body.id;
  }
  const jogo = await chamar('/admin/jogos','POST',{titulo:'Teste HTTP',plataforma_id:refs.plataformas,genero_id:refs.generos,distribuidora_id:refs.distribuidoras,preco_centavos:10000},token);
  assert.equal(jogo.status,201);
  assert.equal((await chamar('/admin/jogos/'+jogo.body.id,'PATCH',{promocao_centavos:9000},token)).status,200);
  assert.equal((await chamar('/jogos?promocao=true')).body.length,1);
  assert.equal((await chamar('/jogos?disponivel=false')).body.length,1);
  assert.equal((await chamar('/jogos?disponivel=invalido')).status,400);
  assert.equal((await chamar('/jogos/9999')).status,404);
  assert.equal((await chamar('/admin/plataformas','POST',{nome:'plataformas'},token)).status,400);
  const desejo = await chamar('/desejos','POST',{jogo_id:jogo.body.id},cliente);
  assert.equal(desejo.status,201);
  assert.equal((await chamar('/desejos/'+desejo.body.id,'DELETE',undefined,token)).status,403);
  assert.equal((await chamar('/desejos','GET',undefined,cliente)).body[0].jogo.promocao_centavos,9000);
  assert.equal((await chamar('/admin/jogos/'+jogo.body.id,'DELETE',undefined,token)).status,204);
  assert.equal((await chamar('/desejos','GET',undefined,cliente)).body.length,0);
  assert.equal((await chamar('/logout','POST',{},cliente)).status,204);
  assert.equal((await chamar('/conta','GET',undefined,cliente)).status,401);
});
