const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { abrirBanco } = require('../src/database');
test('terminal interativo: administrador, CRUD, cliente, login e conta', {timeout:15000}, async t => {
  const pasta = mkdtempSync(join(tmpdir(),'lambari-cli-')), arquivo = join(pasta,'teste.sqlite');
  const filho = spawn(process.execPath,[join(__dirname,'../src/cli/index.js')],{env:{...process.env,LAMBARI_DB:arquivo}});
  let saida = '', cursor = 0;
  filho.stdout.on('data',b => { saida += b; });
  filho.stderr.on('data',b => { saida += b; });
  t.after(()=>{filho.kill();rmSync(pasta,{recursive:true,force:true});});
  async function responder(prompt,valor) {
    const limite = Date.now()+4000;
    while (true) {
      const posicao = saida.indexOf(prompt,cursor);
      if (posicao !== -1) { cursor = posicao+prompt.length; filho.stdin.write(valor+'\n'); return; }
      if (Date.now()>limite) throw Error('Prompt ausente: '+prompt+'\n'+saida);
      await new Promise(resolve=>setTimeout(resolve,10));
    }
  }
  for (const [prompt,valor] of [
    ['Opção: ','9'],['Nome: ','Admin CLI'],['Email: ','admin@cli.com'],['Senha (8–128 caracteres; visível neste terminal): ','senha1234'],
    ['Opção: ','4'],['Email: ','admin@cli.com'],['Senha (visível neste terminal): ','senha1234'],
    ['Opção: ','7'],['Cadastro: ','1'],['Opção: ','2'],['Nome: ','Console CLI'],
    ['Opção: ','1'],['Opção: ','3'],['ID a editar: ','1'],['Enter mantém]: ','Console editado'],
    ['Opção: ','4'],['ID a excluir: ','1'],['Digite SIM para confirmar: ','SIM'],['Opção: ','0'],
    ['Opção: ','3'],['Nome: ','Cliente CLI'],['Email: ','cliente@cli.com'],['Senha (8–128 caracteres; visível neste terminal): ','senha1234'],
    ['Opção: ','8'],['Opção: ','5'],['Opção: ','4'],['Email: ','cliente@cli.com'],['Senha (visível neste terminal): ','senha1234'],
    ['Opção: ','6'],['Opção: ','1'],['Nome (Enter mantém): ','Cliente editado'],['Email (Enter mantém): ',''],['Opção: ','0']
  ]) await responder(prompt,valor);
  const codigo = await new Promise(resolve=>filho.on('close',resolve));
  assert.equal(codigo,0); assert.match(saida,/Registro excluído/); assert.match(saida,/Faça login para continuar/);
  const db = abrirBanco(arquivo);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM plataformas').get().n,0);
  assert.equal(db.prepare('SELECT nome FROM usuarios WHERE email=?').get('cliente@cli.com').nome,'Cliente editado'); db.close();
});
