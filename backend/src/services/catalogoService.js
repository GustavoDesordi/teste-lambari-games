const { scryptSync, randomBytes, timingSafeEqual, createHash } = require('node:crypto');

class Erro extends Error {
  constructor(mensagem, status = 400) { super(mensagem); this.status = status; }
}
const texto = (v, campo) => {
  if (typeof v !== 'string' || !v.trim() || v.trim().length > 2000) throw new Erro(`${campo}: informe um texto de 1 a 2000 caracteres.`);
  return v.trim();
};
const inteiro = (v, campo, minimo = 1) => {
  if (!Number.isSafeInteger(v) || v < minimo) throw new Erro(`${campo}: informe um inteiro maior ou igual a ${minimo}.`);
  return v;
};
const url = v => {
  const s = texto(v, 'URL');
  try { if (!['http:', 'https:'].includes(new URL(s).protocol)) throw Error(); }
  catch { throw new Erro('URL: informe um endereço http ou https válido.'); }
  return s;
};
const ocultar = u => { if (!u) return null; const { senha, ...publico } = u; return {...publico, preferencias: JSON.parse(publico.preferencias)}; };
const hashToken = token => createHash('sha256').update(token).digest('hex');
function hashSenha(senha) {
  if (typeof senha !== 'string' || senha.length < 8 || senha.length > 128) throw new Erro('A senha deve ter entre 8 e 128 caracteres.');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(senha, salt, 64).toString('hex')}`;
}
function conferir(senha, salvo) {
  if (typeof senha !== 'string' || senha.length > 128) return false;
  const [salt, hash] = salvo.split(':');
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(senha, salt, 64));
}
class CatalogoService {
  constructor(db) { this.db = db; }
  linha(sql, ...args) { return this.db.prepare(sql).get(...args); }
  linhas(sql, ...args) { return this.db.prepare(sql).all(...args); }
  executar(sql, ...args) { return this.db.prepare(sql).run(...args); }
  transacao(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try { const resultado = fn(); this.db.exec('COMMIT'); return resultado; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  existe(tabela, id) {
    const registro = this.linha(`SELECT * FROM ${tabela} WHERE id = ?`, inteiro(id, 'ID'));
    if (!registro) throw new Erro('Registro não encontrado.', 404);
    return registro;
  }
  usuario(id) { return ocultar(this.existe('usuarios', id)); }
  exigir(id, admin = false) {
    if (!id) throw new Erro('Faça login para continuar.', 401);
    const u = this.usuario(id);
    if (admin && u.perfil !== 'admin') throw new Erro('Acesso exclusivo do administrador.', 403);
    return u;
  }
  temAdmin() { return !!this.linha("SELECT id FROM usuarios WHERE perfil = 'admin'"); }
  cadastrar(dados, ator, inicial = false) {
    const nome = texto(dados.nome, 'Nome');
    const email = texto(dados.email, 'Email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Erro('Email inválido.');
    const perfil = dados.perfil || 'cliente';
    if (!['cliente', 'admin'].includes(perfil)) throw new Erro('Perfil inválido.');
    const senha = hashSenha(dados.senha);
    return this.transacao(() => {
      if (inicial) {
        if (this.temAdmin()) throw new Erro('O administrador inicial já foi criado.', 403);
        if (perfil !== 'admin') throw new Erro('O primeiro administrador deve ter perfil admin.');
      } else if (perfil === 'admin') this.exigir(ator, true);
      const r = this.executar('INSERT INTO usuarios(nome,email,senha,perfil) VALUES(?,?,?,?)', nome, email, senha, perfil);
      return this.usuario(Number(r.lastInsertRowid));
    });
  }
  login(email, senha) {
    const u = this.linha('SELECT * FROM usuarios WHERE email = ?', String(email || '').trim().toLowerCase());
    if (!u || !conferir(senha, u.senha)) throw new Erro('Email ou senha inválidos.', 401);
    const token = randomBytes(32).toString('hex');
    this.executar('DELETE FROM sessoes WHERE expira < ?', Date.now());
    this.executar('INSERT INTO sessoes VALUES(?,?,?)', hashToken(token), u.id, Date.now() + 86400000);
    return { autenticado: true, token, usuario: ocultar(u) };
  }
  autenticarToken(token) {
    if (typeof token !== 'string') throw new Erro('Sessão inválida.', 401);
    const s = this.linha('SELECT usuario_id FROM sessoes WHERE token = ? AND expira > ?', hashToken(token), Date.now());
    if (!s) throw new Erro('Sessão expirada ou inválida.', 401);
    return this.usuario(s.usuario_id);
  }
  logout(token) { this.executar('DELETE FROM sessoes WHERE token = ?', hashToken(token)); }
  atualizarConta(ator, dados) {
    const atual = this.exigir(ator);
    const nome = dados.nome === undefined ? atual.nome : texto(dados.nome, 'Nome');
    const email = dados.email === undefined ? atual.email : texto(dados.email, 'Email').toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Erro('Email inválido.');
    const preferencias = dados.preferencias === undefined ? atual.preferencias : dados.preferencias;
    if (!preferencias || typeof preferencias !== 'object' || Array.isArray(preferencias)) throw new Erro('Preferências inválidas.');
    if (Object.keys(preferencias).some(k => !['tema','plataforma_favorita','somente_disponiveis'].includes(k))) throw new Erro('Preferência desconhecida.');
    if (preferencias.tema !== undefined && !['claro','escuro'].includes(preferencias.tema)) throw new Erro('Tema inválido.');
    if (preferencias.somente_disponiveis !== undefined && typeof preferencias.somente_disponiveis !== 'boolean') throw new Erro('Disponibilidade deve ser booleana.');
    if (preferencias.plataforma_favorita != null) this.existe('plataformas', preferencias.plataforma_favorita);
    let senha = this.existe('usuarios', ator).senha;
    if (dados.senha !== undefined) {
      if (!conferir(dados.senha_atual, senha)) throw new Erro('Senha atual incorreta.', 403);
      senha = hashSenha(dados.senha);
    }
    return this.transacao(() => {
      this.executar('UPDATE usuarios SET nome=?,email=?,senha=?,preferencias=? WHERE id=?', nome,email,senha,JSON.stringify(preferencias),ator);
      if (dados.senha !== undefined) this.executar('DELETE FROM sessoes WHERE usuario_id=?', ator);
      return this.usuario(ator);
    });
  }
  atualizarUsuario(ator, id, dados) {
    this.exigir(ator,true);
    const antigo = this.usuario(id);
    const perfil = dados.perfil ?? antigo.perfil;
    if (!['cliente','admin'].includes(perfil)) throw new Erro('Perfil inválido.');
    if (antigo.perfil === 'admin' && perfil !== 'admin' && this.linha("SELECT COUNT(*) AS total FROM usuarios WHERE perfil='admin'").total === 1) throw new Erro('Não é possível remover o último administrador.');
    return this.transacao(() => {
      const nome = texto(dados.nome ?? antigo.nome,'Nome');
      const email = texto(dados.email ?? antigo.email,'Email').toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Erro('Email inválido.');
      this.executar('UPDATE usuarios SET nome=?,email=? WHERE id=?',nome,email,id);
      this.executar('UPDATE usuarios SET perfil=? WHERE id=?',perfil,id);
      return this.usuario(id);
    });
  }
  excluirUsuario(ator, id) {
    this.exigir(ator);
    if (ator !== id) this.exigir(ator, true);
    const u = this.existe('usuarios', id);
    if (u.perfil === 'admin' && this.linha("SELECT COUNT(*) AS total FROM usuarios WHERE perfil='admin'").total === 1) throw new Erro('Não é possível excluir o último administrador.');
    this.executar('DELETE FROM usuarios WHERE id=?', id);
  }
  listarUsuarios(ator) { this.exigir(ator, true); return this.linhas('SELECT * FROM usuarios ORDER BY nome').map(ocultar); }
  tabela(tipo) {
    if (!['plataformas','generos','distribuidoras','criticos','jogos','estoque','avaliacoes'].includes(tipo)) throw new Erro('Cadastro inválido.');
    return tipo;
  }
  listar(tipo) { return this.linhas(`SELECT * FROM ${this.tabela(tipo)} ORDER BY id`); }
  salvar(ator, tipo, dados, id) {
    this.exigir(ator, true); this.tabela(tipo);
    const antigo = id === undefined ? {} : this.existe(tipo, id);
    const d = {...antigo, ...dados};
    let campos;
    if (['plataformas','generos','distribuidoras','criticos'].includes(tipo)) {
      campos = {nome: texto(d.nome, 'Nome')};
      if (tipo === 'criticos') campos.site = url(d.site);
    } else if (tipo === 'jogos') {
      campos = {titulo: texto(d.titulo, 'Título'), descricao: d.descricao === undefined ? '' : String(d.descricao).trim(),
        plataforma_id: inteiro(d.plataforma_id, 'Plataforma'), genero_id: inteiro(d.genero_id, 'Gênero'),
        distribuidora_id: inteiro(d.distribuidora_id, 'Distribuidora'), preco_centavos: inteiro(d.preco_centavos, 'Preço em centavos', 0),
        promocao_centavos: d.promocao_centavos == null ? null : inteiro(d.promocao_centavos, 'Promoção em centavos', 0)};
      if (campos.promocao_centavos !== null && campos.promocao_centavos >= campos.preco_centavos) throw new Erro('A promoção deve ser menor que o preço normal.');
      this.existe('plataformas', campos.plataforma_id); this.existe('generos', campos.genero_id); this.existe('distribuidoras', campos.distribuidora_id);
    } else if (tipo === 'estoque') {
      campos = {jogo_id: inteiro(d.jogo_id, 'Jogo'), quantidade: inteiro(d.quantidade, 'Quantidade', 0)};
      this.existe('jogos', campos.jogo_id);
    } else {
      if (typeof d.nota !== 'number' || !Number.isFinite(d.nota) || d.nota < 0 || d.nota > 100) throw new Erro('Nota deve estar entre 0 e 100. Converta notas de 0–10 multiplicando por 10.');
      campos = {jogo_id: inteiro(d.jogo_id, 'Jogo'), critico_id: inteiro(d.critico_id, 'Crítico'), nota: d.nota, url: url(d.url)};
      this.existe('jogos', campos.jogo_id); this.existe('criticos', campos.critico_id);
    }
    const chaves = Object.keys(campos), valores = Object.values(campos);
    if (id === undefined) {
      const r = this.executar(`INSERT INTO ${tipo} (${chaves.join(',')}) VALUES (${chaves.map(() => '?').join(',')})`, ...valores);
      id = Number(r.lastInsertRowid);
    } else this.executar(`UPDATE ${tipo} SET ${chaves.map(c => `${c}=?`).join(',')} WHERE id=?`, ...valores,id);
    return this.existe(tipo,id);
  }
  excluir(ator, tipo, id) {
    this.exigir(ator,true); this.tabela(tipo); this.existe(tipo,id);
    this.executar(`DELETE FROM ${tipo} WHERE id=?`,id);
  }
  catalogo(filtros = {}) {
    const clausulas = [], args = [];
    for (const campo of ['plataforma_id','genero_id','distribuidora_id']) if (filtros[campo] !== undefined) {
      clausulas.push(`j.${campo}=?`); args.push(inteiro(filtros[campo], campo));
    }
    if (filtros.busca) { clausulas.push("j.titulo LIKE ? ESCAPE '\\'"); args.push(`%${String(filtros.busca).replace(/[\\%_]/g, '\\$&')}%`); }
    if (filtros.disponivel) clausulas.push('COALESCE(e.quantidade,0)>0');
    if (filtros.promocao) clausulas.push('j.promocao_centavos IS NOT NULL');
    return this.linhas(`SELECT j.*, p.nome AS plataforma, g.nome AS genero, d.nome AS distribuidora,
      COALESCE(e.quantidade,0) AS quantidade, COALESCE(j.promocao_centavos,j.preco_centavos) AS preco_atual_centavos
      FROM jogos j JOIN plataformas p ON p.id=j.plataforma_id JOIN generos g ON g.id=j.genero_id
      JOIN distribuidoras d ON d.id=j.distribuidora_id LEFT JOIN estoque e ON e.jogo_id=j.id
      ${clausulas.length ? 'WHERE '+clausulas.join(' AND ') : ''} ORDER BY j.titulo`, ...args);
  }
  detalhe(id) {
    this.existe('jogos',id);
    return {...this.catalogo().find(j => j.id === id), avaliacoes: this.linhas(`SELECT a.*,c.nome AS critico,c.site FROM avaliacoes a JOIN criticos c ON c.id=a.critico_id WHERE jogo_id=?`,id)};
  }
  desejos(ator) {
    this.exigir(ator);
    return this.linhas('SELECT * FROM desejos WHERE usuario_id=? ORDER BY id',ator).map(d => ({...d,jogo:this.detalhe(d.jogo_id)}));
  }
  salvarDesejo(ator, dados, id) {
    this.exigir(ator);
    if (id !== undefined) {
      const antigo = this.existe('desejos',id);
      if (antigo.usuario_id !== ator) throw new Erro('Este desejo pertence a outro usuário.',403);
      dados = {...antigo,...dados};
    }
    const jogo = inteiro(dados.jogo_id,'Jogo'); this.existe('jogos',jogo);
    const observacao = dados.observacao === undefined ? '' : String(dados.observacao).trim();
    if (observacao.length > 2000) throw new Erro('Observação muito longa.');
    if (id === undefined) id = Number(this.executar('INSERT INTO desejos(usuario_id,jogo_id,observacao) VALUES(?,?,?)',ator,jogo,observacao).lastInsertRowid);
    else this.executar('UPDATE desejos SET jogo_id=?,observacao=? WHERE id=?',jogo,observacao,id);
    return this.existe('desejos',id);
  }
  excluirDesejo(ator,id) {
    this.exigir(ator);
    if (this.existe('desejos',id).usuario_id !== ator) throw new Erro('Este desejo pertence a outro usuário.',403);
    this.executar('DELETE FROM desejos WHERE id=?',id);
  }
}
function mensagemErro(e) {
  if (e.message.includes('UNIQUE constraint')) return 'Já existe um registro com esses dados.';
  if (e.message.includes('FOREIGN KEY constraint')) return 'Registro vinculado a outros cadastros. Remova ou altere os vínculos primeiro.';
  return e instanceof Erro ? e.message : 'Não foi possível concluir a operação.';
}
module.exports = { CatalogoService, Erro, mensagemErro };
