# Lambari Games — manual de uso no terminal (Linux)

Catálogo digital de jogos de uma loja física, com acesso público às consultas e
login para lista de desejos, conta e administração. Não realiza compras ou reservas.

Este projeto continua o repositório [Sistema Lambari Games](https://github.com/EvertonBerlezi/Sistema-Lambari-Games),
partindo do commit `2c1625c235ea506c8762c02561142451bd3a3777`.
A interface de uso descrita aqui funciona pelo terminal. O frontend original foi preservado.

## 1. Localizar e iniciar no Linux

É necessário ter **Node.js 22.13 ou superior**. Confira a versão:

```bash
node --version
```

Depois de baixar o arquivo `Sistema_Lambari_Games_Terminal.zip`, extraia-o pelo
gerenciador de arquivos ou pelo terminal. O exemplo abaixo considera que ele está
na pasta Downloads:

```bash
cd ~/Downloads
unzip Sistema_Lambari_Games_Terminal.zip
cd Sistema-Lambari-Games-main
sh iniciar-terminal.sh
```

Caso seu sistema use outro nome de pasta ou você tenha extraído o ZIP em outro
local, use o caminho real. Para encontrar a pasta do programa dentro da sua pasta pessoal:

```bash
find "$HOME" -type f -name 'iniciar-terminal.sh' 2>/dev/null
```

Execute `sh` seguido do caminho retornado, entre aspas. Por exemplo, se o resultado
for `/home/joao/Downloads/Sistema-Lambari-Games-main/iniciar-terminal.sh`:

```bash
sh "/home/joao/Downloads/Sistema-Lambari-Games-main/iniciar-terminal.sh"
```

Esse caminho é apenas um exemplo: substitua pelo encontrado na sua máquina Linux.
O script entra na pasta correta automaticamente. Não é necessário instalar banco
de dados, iniciar o frontend ou executar `npm install` para usar o menu.

Outra forma, estando na raiz do projeto:

```bash
cd backend
npm run terminal
```

Os comandos de instalação, demonstração e testes deste manual são digitados no
terminal do Linux. As opções numéricas são digitadas **dentro do programa**, quando
aparecer `Opção:`. Digite uma resposta de cada vez e pressione Enter.

## 2. Primeiro acesso e ordem de cadastro

O banco começa vazio, sem usuário ou senha padrão.

1. No menu principal, escolha **9 — Criar administrador inicial**.
2. Informe nome, email e uma senha com 8 a 128 caracteres.
3. Escolha **4 — Entrar** e informe o email e a senha cadastrados.
4. Entre em **7 — Administração** e cadastre plataformas, gêneros e distribuidoras.
5. Cadastre os jogos usando os IDs desses registros.
6. Cadastre o estoque de cada jogo.
7. Cadastre as fontes de crítica e, depois, suas avaliações.
8. Saia da conta e consulte o catálogo como visitante para conferir o resultado.

O cadastro da opção 9 funciona somente enquanto não existir administrador.
Depois, outros administradores são criados pelo menu administrativo de usuários.
As senhas ficam visíveis durante a digitação no terminal; no banco são protegidas
com hash scrypt e salt aleatório.

## 3. Menu principal

| Opção | Função | Quem pode utilizar |
| --- | --- | --- |
| 1 | Catálogo e filtros | Visitante, cliente e administrador |
| 2 | Detalhes, estoque e avaliações | Visitante, cliente e administrador |
| 3 | Cadastrar cliente | Qualquer pessoa; sempre cria um cliente |
| 4 | Entrar | Usuário cadastrado |
| 5 | Minha lista de desejos | Usuário conectado |
| 6 | Minha conta e preferências | Usuário conectado |
| 7 | Administração | Administrador conectado |
| 8 | Sair da conta | Encerra a sessão e retorna ao modo visitante |
| 9 | Criar administrador inicial | Apenas antes de existir administrador |
| 0 | Encerrar | Fecha o programa |

### 3.1. Catálogo e filtros — opção 1

O programa mostra as plataformas, os gêneros e as distribuidoras cadastradas com
seus IDs. Em seguida, solicita:

| Pergunta | Como responder |
| --- | --- |
| Título contém | Parte do nome do jogo, como `Zelda`; Enter não filtra por título |
| ID Plataforma | ID da plataforma desejada; Enter aceita todas |
| ID Gênero | ID do gênero desejado; Enter aceita todos |
| ID Distribuidora | ID da distribuidora desejada; Enter aceita todas |
| Somente em estoque? | `s` para mostrar apenas jogos com quantidade maior que zero; `n` para todos |
| Somente promoções? | `s` para mostrar apenas jogos com promoção cadastrada; `n` para todos |

Use `s` e `n` em letras minúsculas. Os filtros são combinados: o jogo precisa
atender a todos os critérios informados.

**Exemplo:** digite `Zelda` no título, deixe os três IDs vazios, responda `s` para
estoque e `n` para promoções. O resultado mostrará os jogos com Zelda no título
que tenham unidades disponíveis.

Para mostrar todos os jogos, deixe o título e os IDs vazios e responda `n` às duas
últimas perguntas. Para mudar os filtros, entre novamente na opção 1.

Na listagem, `id` identifica o jogo, `quantidade` mostra o saldo e
`preco_atual_centavos` mostra o preço considerando a promoção, quando houver.
Os valores monetários são exibidos em centavos: `19990` corresponde a R$ 199,90.

### 3.2. Detalhes, estoque e avaliações — opção 2

1. Consulte o catálogo para descobrir o ID do jogo.
2. No menu principal, escolha **2**.
3. Informe o **ID do jogo** e pressione Enter.

O programa mostra título, descrição, plataforma, gênero, distribuidora, preços,
quantidade e avaliações, com a fonte e a URL cadastradas. Se não houver avaliação,
a lista `avaliacoes` estará vazia. Um jogo sem registro de estoque aparece com
quantidade zero. IDs inexistentes retornam uma mensagem de registro não encontrado.

### 3.3. Cadastrar cliente — opção 3

1. Escolha **3** no menu principal.
2. Informe nome, email e senha de 8 a 128 caracteres.
3. Aguarde a exibição dos dados da conta criada.
4. Use a opção **4** para entrar; o cadastro não conecta automaticamente.

O email precisa ser válido e não pode estar cadastrado em outra conta. Essa opção
sempre cria perfil `cliente`, mesmo quando utilizada por um administrador.

### 3.4. Entrar — opção 4

Informe o email e a senha da conta. Quando o login for aceito, aparecerá
`Login realizado` e o menu indicará o nome do usuário conectado.

A sessão tem duração de 24 horas. Se expirar, entre novamente. O programa não
retoma automaticamente a sessão quando é reaberto. Entrar em outra conta encerra
a sessão que estava sendo utilizada no terminal.

### 3.5. Minha lista de desejos — opção 5

Exige login. Cada usuário acessa somente os próprios desejos.

| Opção do submenu | Como usar |
| --- | --- |
| 1 — Listar | Mostra seus desejos, a observação e os dados atuais de cada jogo |
| 2 — Criar | Informe o ID do jogo e uma observação opcional, como `Aguardar promoção` |
| 3 — Editar | Informe o ID do desejo; altere o jogo ou a observação; Enter mantém o valor atual |
| 4 — Excluir | Informe o ID do desejo e confirme digitando `SIM` |
| 0 — Voltar | Retorna ao menu principal |

**Atenção aos IDs:** para criar um desejo, use o **ID do jogo**. Para editar ou
excluir um desejo existente, use o **ID do desejo**, exibido na listagem.

Um mesmo jogo não pode ser adicionado duas vezes à lista do mesmo usuário.
A lista consulta os preços, as promoções e o estoque atuais. Ela não reserva
unidades nem envia notificações automáticas. Na edição, Enter mantém a observação;
não existe um comando específico no menu para apagar uma observação já preenchida.

### 3.6. Minha conta e preferências — opção 6

Ao entrar, o programa mostra os dados da conta e as seguintes ações:

| Opção | Passo a passo |
| --- | --- |
| 1 — Alterar nome/email | Informe o novo nome e/ou email. Enter mantém o valor atual de cada campo |
| 2 — Alterar senha | Informe a senha atual e a nova senha. Depois, faça login novamente |
| 3 — Preferências | Informe tema, plataforma favorita e preferência por jogos em estoque |
| 4 — Excluir minha conta | Digite `SIM` para confirmar a exclusão da própria conta |
| 0 — Voltar | Retorna ao menu principal |

**Preferências:** o tema aceita `claro` ou `escuro`; Enter define `claro`.
Informe o ID de uma plataforma existente para defini-la como favorita; Enter remove
a favorita. Responda `s` ou `n` para a preferência de disponibilidade.
Cada salvamento substitui as três preferências pelos valores informados.

As preferências ficam salvas na conta, mas não são aplicadas automaticamente aos
filtros do catálogo. O tema também não muda a aparência deste terminal.

Alterar a senha invalida todas as sessões da conta. Excluir a conta também remove
seus desejos e suas sessões. O último administrador não pode excluir a própria
conta enquanto não existir outro administrador.

### 3.7. Administração — opção 7

Somente usuários com perfil `admin` podem entrar. O menu administrativo contém:

| Número | Cadastro |
| --- | --- |
| 1 | Plataformas |
| 2 | Gêneros |
| 3 | Distribuidoras |
| 4 | Críticos/fontes de avaliação |
| 5 | Jogos |
| 6 | Estoque |
| 7 | Avaliações |
| 8 | Usuários |
| 0 | Voltar ao menu principal |

O uso de cada cadastro está explicado na seção 4.

### 3.8. Sair da conta — opção 8

Invalida a sessão atual e volta ao modo visitante. O programa continua aberto e
permite consultar o catálogo. Os dados cadastrados permanecem salvos.

### 3.9. Criar administrador inicial — opção 9

Informe nome, email e senha para criar a primeira conta administrativa. Depois,
utilize a opção 4 para entrar. Se já existir um administrador, a operação será
recusada. Para criar os próximos, use **7 → 8 → 1**.

### 3.10. Encerrar — opção 0

No menu principal, fecha o programa. Em submenus, a opção 0 apenas retorna ao menu
anterior. Os dados já salvos permanecem no banco para o próximo uso.

## 4. Como usar cada cadastro administrativo

### 4.1. Operações comuns dos CRUDs

CRUD significa criar, consultar, atualizar e excluir registros. Todos os cadastros
administrativos, exceto o de usuários, têm este submenu:

| Opção | Procedimento |
| --- | --- |
| 1 — Listar | Exibe todos os registros daquele cadastro e seus IDs |
| 2 — Criar | Solicita os campos e salva o registro ao final, se os dados forem válidos |
| 3 — Editar | Solicita o ID do registro e mostra os campos atuais; Enter mantém cada valor |
| 4 — Excluir | Solicita o ID do registro e exige a confirmação `SIM` |
| 0 — Voltar | Sai do cadastro e retorna ao menu principal |

Os números de menu podem se repetir: **7 → 5 → 2**, por exemplo, significa
Administração, Jogos e Criar, nessa ordem. Digite cada número quando a pergunta
correspondente aparecer.

Não use a posição da linha na tabela como ID: utilize o valor da coluna `id`.
IDs de registros excluídos podem deixar intervalos na numeração.
Para cancelar uma exclusão, informe qualquer resposta diferente de `SIM`.

### 4.2. Plataformas — 7 → 1

Informe apenas o nome da plataforma, como `PlayStation 5`, `Nintendo Switch` ou `PC`.

- **Criar:** escolha 2 e digite o nome.
- **Listar:** escolha 1 e anote o ID para utilizar no cadastro dos jogos.
- **Editar:** escolha 3, informe o ID e altere o nome.
- **Excluir:** escolha 4, informe o ID e confirme com `SIM`.

Não é permitido repetir o nome. Uma plataforma vinculada a um jogo só pode ser
excluída depois de remover ou alterar esse vínculo.

### 4.3. Gêneros — 7 → 2

Informe o nome do gênero, como `RPG`, `Aventura` ou `Corrida`.
Use as opções 1, 2, 3 e 4 para listar, criar, editar e excluir, respectivamente.
Anote o ID para o cadastro dos jogos. Não é permitido repetir o nome nem excluir
um gênero que ainda esteja vinculado a um jogo.

### 4.4. Distribuidoras — 7 → 3

Informe o nome da distribuidora, como `Nintendo` ou `Bandai Namco`.
Use as opções 1, 2, 3 e 4 para listar, criar, editar e excluir.
O ID será utilizado no cadastro dos jogos. Não é permitido repetir o nome nem
excluir uma distribuidora ainda vinculada a um jogo.

### 4.5. Críticos/fontes — 7 → 4

Este cadastro identifica o veículo responsável por uma avaliação.

| Campo | Exemplo de preenchimento |
| --- | --- |
| Nome do veículo/crítico | `IGN` |
| Site da fonte | `https://www.ign.com` |

Para criar, escolha 2 e preencha os dois campos. Para consultar, editar ou excluir,
utilize 1, 3 ou 4. O site deve ser uma URL válida iniciada por `http://` ou `https://`.
Uma fonte com avaliações vinculadas não pode ser excluída antes desses vínculos.

O sistema não verifica certificações nem busca notas automaticamente. O
administrador deve conferir a fonte e cadastrar o link da avaliação original.

### 4.6. Jogos — 7 → 5

Antes de criar um jogo, cadastre sua plataforma, gênero e distribuidora.
Escolha **2 — Criar** e preencha:

| Campo | Como preencher |
| --- | --- |
| Título | Nome do jogo |
| Descrição | Texto descritivo; pode ficar vazio na criação |
| ID plataforma | ID obtido na listagem de plataformas |
| ID gênero | ID obtido na listagem de gêneros |
| ID distribuidora | ID obtido na listagem de distribuidoras |
| Preço em centavos | Inteiro não negativo, sem separador de milhar ou vírgula |
| Promoção em centavos | Valor menor que o preço normal; Enter ou `-` significa sem promoção na criação |

**Exemplo ilustrativo:** título `Jogo de aventura`, descrição `Edição física`,
IDs de cadastros existentes, preço `19990` e promoção `17990`. Isso representa
R$ 199,90 de preço normal e R$ 179,90 de preço promocional.

Para alterar preço ou promoção, escolha **3 — Editar**, informe o ID do jogo e
pressione Enter nos campos que deseja manter. Digite o novo valor no campo desejado.
Na edição, Enter **mantém** a promoção atual; digite `-` para removê-la.
Se reduzir o preço normal, confira se a promoção continua menor que o novo preço.

Cada jogo representa uma edição para uma plataforma, com um gênero e uma
distribuidora. O mesmo título pode existir em plataformas diferentes, mas não
pode se repetir na mesma plataforma.

Para excluir, escolha 4, informe o ID e confirme. **Excluir o jogo também remove
seu estoque, suas avaliações e os desejos vinculados a ele.**

### 4.7. Estoque — 7 → 6

O estoque guarda o saldo atual de cada jogo.

| Campo | Como preencher |
| --- | --- |
| ID jogo | ID do jogo que já está cadastrado |
| Quantidade disponível | Número inteiro maior ou igual a zero |

1. Escolha **2 — Criar** para registrar o estoque pela primeira vez.
2. Informe o ID do jogo e a quantidade, por exemplo `5`.
3. Para atualizar o saldo, liste os estoques, escolha **3 — Editar** e informe o
   **ID do registro de estoque**.
4. Pressione Enter para manter o jogo e informe a nova quantidade.

**Exemplo:** se o saldo passou de 5 para 3, digite `3`, e não `-2`.
O programa não registra entradas e saídas: você informa o saldo final.

Só existe um registro de estoque por jogo. Para zerar, edite a quantidade para `0`.
Para excluir o registro, escolha 4, informe o ID do estoque e confirme. O jogo
continua no catálogo, com disponibilidade zero.

### 4.8. Avaliações — 7 → 7

Antes, cadastre o jogo e a fonte da avaliação. Escolha **2 — Criar** e informe:

| Campo | Como preencher |
| --- | --- |
| ID jogo | Jogo avaliado |
| ID crítico | Fonte cadastrada em Críticos/fontes |
| Nota de 0 a 100 | Nota normalizada nessa escala |
| Link da avaliação original | URL da página específica que contém a avaliação |

Uma nota 9/10 deve ser informada como `90`. Uma nota 8,5/10 deve ser informada como
`85`. Para decimais já na escala de 0 a 100, use ponto, como `87.5`.
Não são aceitas notas menores que 0 ou maiores que 100.

Cada jogo aceita uma avaliação por fonte. Para corrigir uma nota existente, use
**3 — Editar** com o **ID da avaliação**, em vez de criar outra avaliação com o
mesmo jogo e a mesma fonte. Use 1 para listar e 4 para excluir.
A consulta pública pela opção 2 do menu principal exibirá as avaliações salvas.

### 4.9. Usuários — 7 → 8

Ao entrar, o administrador já recebe a listagem de usuários. Este submenu tem
numeração diferente dos demais CRUDs:

| Opção | Como utilizar |
| --- | --- |
| 1 — Criar usuário | Informe nome, email, senha e perfil `cliente` ou `admin`; Enter no perfil cria cliente |
| 2 — Editar usuário | Informe o ID e preencha nome, email e/ou perfil; Enter mantém o campo atual |
| 3 — Excluir usuário | Informe o ID e confirme com `SIM` |
| 0 — Voltar | Retorna ao menu principal |

Para listar novamente, entre outra vez em **7 → 8**.
A edição administrativa não redefine a senha de outra pessoa; cada usuário troca
a própria senha em **6 → 2**, informando a senha atual.

Excluir um usuário remove seus desejos e suas sessões. Não é possível excluir o
último administrador nem alterar seu perfil para cliente. Crie outro administrador
antes, caso precise realizar uma dessas operações.

## 5. Demonstração com dados prontos

Este comando é opcional e deve ser executado no terminal do Linux, com o programa
fechado. A partir da raiz do projeto:

```bash
cd backend
npm run demo
npm run terminal
```

Ele cadastra dois jogos, plataformas, gêneros, distribuidoras, estoques ilustrativos
e as fontes IGN e Metacritic. Não cria usuários e não preenche notas de avaliação.
Só funciona com o catálogo de jogos vazio e não apaga registros existentes.

## 6. Roteiro prático para testar todas as áreas

1. Crie o administrador pela opção 9 e faça login pela 4.
2. Em Administração, cadastre uma plataforma, um gênero e uma distribuidora.
3. Cadastre um jogo, anote seu ID e registre o estoque dele.
4. Cadastre uma fonte e uma avaliação com a URL original conferida.
5. Consulte o catálogo pela opção 1 e os detalhes pela opção 2.
6. Edite a promoção do jogo e consulte usando o filtro de promoções.
7. Crie um cliente pela opção 3 e entre nessa conta pela opção 4.
8. Adicione o jogo à lista de desejos; liste, edite a observação e exclua o desejo.
9. Altere nome/email e salve preferências em Minha conta.
10. Troque a senha e entre novamente com a nova senha.
11. Saia da conta pela opção 8 e confirme que o catálogo continua acessível.
12. Entre como administrador, revise os cadastros e teste as exclusões apenas em
    registros de demonstração que você possa remover.
13. Encerre pela opção 0, abra o programa novamente e confira que os dados continuam salvos.

## 7. Onde os dados são salvos e como fazer backup

O banco é criado automaticamente em `backend/data/lambari.sqlite`.
Não depende do diretório de onde você iniciou o script. Terminal e API utilizam
esse mesmo banco por padrão. Fechar o programa não apaga os cadastros.

Para fazer backup, feche o terminal e a API. Estando na raiz do projeto, execute:

```bash
cp backend/data/lambari.sqlite "backup-lambari-$(date +%Y%m%d-%H%M%S).sqlite"
```

Para restaurar, mantenha o programa e a API fechados, preserve uma cópia do banco
atual e copie o backup escolhido para `backend/data/lambari.sqlite`.
A restauração substitui os dados atuais pelos dados do backup.

Para usar um banco separado de testes, estando em `backend`:

```bash
LAMBARI_DB=/tmp/lambari-teste.sqlite npm run terminal
```

Esse comando usa outro banco, começando vazio se o arquivo não existir. Arquivos
em `/tmp` podem ser removidos pelo sistema; não use esse caminho para dados definitivos.
O banco local com contas e dados da loja não acompanha o ZIP de distribuição.

## 8. Problemas comuns

| Mensagem ou situação | Como resolver |
| --- | --- |
| `node: command not found` | Instale Node.js no Linux e abra novamente o terminal |
| Falha ao carregar `node:sqlite` | Confira `node --version`; é necessário Node.js 22.13 ou superior |
| Pasta não encontrada | Use o comando `find` da seção 1 e execute o script pelo caminho encontrado |
| Registro não encontrado | Liste o cadastro e confira o ID da coluna `id` |
| Já existe um registro com esses dados | Verifique email, nome, título/plataforma, jogo do estoque, fonte da avaliação ou jogo da lista de desejos |
| Registro vinculado a outros cadastros | Altere ou remova os vínculos antes de excluir o cadastro auxiliar |
| Faça login para continuar | Entre pela opção 4 |
| Acesso exclusivo do administrador | Entre com uma conta de perfil `admin` |
| Email ou senha inválidos | Confira as credenciais; não existe senha padrão |
| Administrador inicial já foi criado | Use uma conta administrativa existente ou peça a outro administrador para criar a sua |
| Nenhum registro encontrado no catálogo | Cadastre jogos ou refaça a busca sem filtros |
| Jogo cadastrado sem disponibilidade | Crie ou edite o estoque para uma quantidade maior que zero |
| Promoção rejeitada | Informe centavos inteiros e valor menor que o preço normal |
| Quantidade rejeitada | Informe o saldo final como inteiro maior ou igual a zero |
| Nota rejeitada | Use a escala de 0 a 100 e ponto para casas decimais |
| Preferências não mudam o catálogo | São apenas salvas na conta nesta versão; os filtros são escolhidos a cada consulta |

## API HTTP opcional

Para testar via curl/Postman sem telas:

```sh
cd backend
npm ci
npm start
```

Endereço padrão: `http://localhost:3000`. Configure `PORT` para alterar a porta.
O administrador inicial deve ser criado **no terminal**, antes de usar a API.

```sh
curl http://localhost:3000/jogos
curl 'http://localhost:3000/jogos?plataforma_id=1&disponivel=true&promocao=true'
curl -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"seu-email@exemplo.com","senha":"sua-senha"}'
```

Use o token retornado nas rotas protegidas:
`Authorization: Bearer TOKEN_RECEBIDO`.

| Método/rota | Uso |
| --- | --- |
| POST /cadastro | Cadastro público, sempre como cliente |
| POST /login | Retorna token e usuário sem hash de senha |
| POST /logout | Invalida a sessão autenticada |
| GET /jogos | Catálogo público com busca, plataforma_id, genero_id, distribuidora_id, disponivel e promocao |
| GET /jogos/:id | Jogo, estoque e avaliações com a fonte |
| GET /plataformas, /generos, /distribuidoras, /criticos, /estoque, /avaliacoes | Consultas públicas |
| GET, PATCH, DELETE /conta | Conta do usuário autenticado |
| GET, POST /desejos | Consultar/criar desejos próprios |
| PATCH, DELETE /desejos/:id | Editar/excluir desejo próprio |
| GET, POST /admin/:cadastro | Listar/criar como administrador |
| PATCH, DELETE /admin/:cadastro/:id | Editar/excluir como administrador |

Em `:cadastro`, use `jogos`, `plataformas`, `generos`, `distribuidoras`, `criticos`,
`estoque`, `avaliacoes` ou `usuarios`. Os campos seguem os formulários do terminal
e os nomes definidos no banco. PATCH altera somente os campos enviados.
Para remover promoção pela API, envie `{"promocao_centavos":null}`.
Preferências são enviadas em `preferencias` na rota PATCH /conta.
Troca de senha exige `senha_atual` e `senha` nessa mesma rota.

Exemplo de jogo:

```json
{
  "titulo": "Jogo exemplo",
  "descricao": "Edição física",
  "plataforma_id": 1,
  "genero_id": 1,
  "distribuidora_id": 1,
  "preco_centavos": 19990,
  "promocao_centavos": 17990
}
```

Exemplo de estoque: `{"jogo_id":1,"quantidade":5}`.
Exemplo de desejo: `{"jogo_id":1,"observacao":"Aguardar promoção"}`.
Exemplo de avaliação: `{"jogo_id":1,"critico_id":1,"nota":90,"url":"https://exemplo.com/avaliacao"}`.

Este é um projeto acadêmico local. Antes de disponibilizar a API na internet,
configure HTTPS, origens CORS, limites de tentativas de login e implantação.
O frontend original ainda precisa de adaptação para os novos cadastros.

## Testes

```sh
cd backend
npm ci
npm test
```

Os testes usam bancos temporários e não alteram o catálogo da loja.
Cobrem regras dos CRUDs, vínculos, autenticação, permissões, sessões, filtros,
lista de desejos, persistência, API HTTP e um fluxo real do terminal.

## Organização

- `backend/src/database`: conexão, esquema SQLite e dados de demonstração.
- `backend/src/services/catalogoService.js`: regras compartilhadas.
- `backend/src/cli/index.js`: menus e formulários de terminal.
- `backend/src/routes`: rotas Express públicas, de conta e administrativas.
- `backend/src/controllers/authController.js`: login e cadastro.
- `backend/test`: testes automatizados com o test runner nativo do Node.
- `frontend`: código original preservado.
