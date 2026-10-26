const { DatabaseSync } = require('node:sqlite');
const { mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

function abrirBanco(arquivo = process.env.LAMBARI_DB || resolve(__dirname, '../../data/lambari.sqlite')) {
  if (arquivo !== ':memory:') mkdirSync(dirname(resolve(arquivo)), { recursive: true });
  const db = new DatabaseSync(arquivo);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      senha TEXT NOT NULL, perfil TEXT NOT NULL CHECK(perfil IN ('cliente','admin')),
      preferencias TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS sessoes (
      token TEXT PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      expira INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS plataformas (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS generos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS distribuidoras (id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE COLLATE NOCASE);
    CREATE TABLE IF NOT EXISTS criticos (
      id INTEGER PRIMARY KEY, nome TEXT NOT NULL UNIQUE COLLATE NOCASE, site TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jogos (
      id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, descricao TEXT NOT NULL DEFAULT '',
      plataforma_id INTEGER NOT NULL REFERENCES plataformas(id),
      genero_id INTEGER NOT NULL REFERENCES generos(id),
      distribuidora_id INTEGER NOT NULL REFERENCES distribuidoras(id),
      preco_centavos INTEGER NOT NULL CHECK(preco_centavos >= 0),
      promocao_centavos INTEGER CHECK(promocao_centavos >= 0 AND promocao_centavos < preco_centavos),
      UNIQUE(titulo, plataforma_id)
    );
    CREATE TABLE IF NOT EXISTS estoque (
      id INTEGER PRIMARY KEY, jogo_id INTEGER NOT NULL UNIQUE REFERENCES jogos(id) ON DELETE CASCADE,
      quantidade INTEGER NOT NULL CHECK(quantidade >= 0)
    );
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY, jogo_id INTEGER NOT NULL REFERENCES jogos(id) ON DELETE CASCADE,
      critico_id INTEGER NOT NULL REFERENCES criticos(id), nota REAL NOT NULL CHECK(nota BETWEEN 0 AND 100),
      url TEXT NOT NULL, UNIQUE(jogo_id, critico_id)
    );
    CREATE TABLE IF NOT EXISTS desejos (
      id INTEGER PRIMARY KEY, usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      jogo_id INTEGER NOT NULL REFERENCES jogos(id) ON DELETE CASCADE,
      observacao TEXT NOT NULL DEFAULT '', UNIQUE(usuario_id, jogo_id)
    );
  `);
  return db;
}
module.exports = { abrirBanco };
