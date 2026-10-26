const { abrirBanco } = require('./index');
const { CatalogoService } = require('../services/catalogoService');
const db = abrirBanco(), s = new CatalogoService(db);
try {
  s.transacao(() => {
    if (s.linha('SELECT COUNT(*) AS n FROM jogos').n) throw Error('A demonstração só pode ser criada com o catálogo vazio.');
    for (const [t,nome] of [['plataformas','PlayStation 5'],['plataformas','Nintendo Switch'],['generos','Aventura'],['generos','RPG'],['distribuidoras','Nintendo'],['distribuidoras','Bandai Namco']]) s.executar(`INSERT OR IGNORE INTO ${t}(nome) VALUES(?)`,nome);
    const ref = (t,nome) => s.linha(`SELECT id FROM ${t} WHERE nome=?`,nome).id;
    for (const [titulo,plataforma,genero,distribuidora,preco,promocao,quantidade] of [
      ['The Legend of Zelda: Tears of the Kingdom','Nintendo Switch','Aventura','Nintendo',34990,29990,5],
      ['Elden Ring','PlayStation 5','RPG','Bandai Namco',29990,null,0]]) {
      const r = s.executar('INSERT INTO jogos(titulo,plataforma_id,genero_id,distribuidora_id,preco_centavos,promocao_centavos) VALUES(?,?,?,?,?,?)',titulo,ref('plataformas',plataforma),ref('generos',genero),ref('distribuidoras',distribuidora),preco,promocao);
      s.executar('INSERT INTO estoque(jogo_id,quantidade) VALUES(?,?)',Number(r.lastInsertRowid),quantidade);
    }
    for (const [nome,site] of [['IGN','https://www.ign.com'],['Metacritic','https://www.metacritic.com']]) s.executar('INSERT OR IGNORE INTO criticos(nome,site) VALUES(?,?)',nome,site);
  });
  console.log('Catálogo de demonstração criado. Preços/estoques ilustrativos; nenhuma nota de avaliação foi inventada.');
} catch(e) { console.error(e.message); process.exitCode = 1; }
finally { db.close(); }
