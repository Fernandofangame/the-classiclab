# The ClassicLab

Biblioteca retrô estática feita com HTML, CSS e JavaScript puro. O catálogo é carregado de `data/games.json`.

## Esta versão
- Apenas **ports para PC** e **coleções de PlayStation 1**.
- Janela própria por item, com capa frontal e contracapa/arte alternativa.
- Capas automáticas do xlenore para jogos com serial cadastrado (PS1 e PS2); imagem manual tem prioridade e há fallback se a capa não existir.
- Descrição do jogo original, instruções e requisitos.
- Dois botões principais: emulador/página do projeto e jogo/ROM/coleção.
- Link opcional de documentação da BIOS em recursos extras.
- Pesquisa, filtros e layout responsivo.
- Páginas separadas: `index.html` (Início), `ports.html` (Ports para PC) e `ps1.html` (PlayStation 1). Cada página abre sua própria biblioteca e mantém a janela de detalhes do item.

## Arquivos
- `index.html` — página inicial com o catálogo geral.
- `ports.html` — página exclusiva de ports para PC.
- `ps1.html` — página exclusiva de PlayStation 1.
- `styles.css` — visual retrô e layout responsivo.
- `app.js` — pesquisa, filtros, cards e detalhes.
- `data/games.json` — dados de ports e coleções.

## Testar no VS Code
1. Extraia o ZIP e abra a pasta `The-ClassicLab` no Visual Studio Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html` e selecione **Open with Live Server**.
4. Teste pesquisa, filtros, navegação entre as páginas e janela de detalhes em cada seção.

Use um servidor local: `fetch()` pode não carregar o JSON quando o HTML é aberto diretamente como `file://`.

## Adicionar ou editar itens
Edite `data/games.json`. Cada item precisa de `id` único, `type` (`port` ou `collection`), `title`, `platform`, `genre`, `description`, `originalDescription`, `instructions`, `emulatorUrl` e `gameUrl`.

Campos importantes:
- `coverSerial`: serial exato do jogo, por exemplo `SLUS-00771` (necessário para buscar a capa automática; use o serial exato da edição/região). Aceita também `serial` como nome alternativo do campo.
- `coverSystem`: `ps1` ou `ps2`. Se omitido, o site tenta identificar pelo campo `platform` (`PlayStation 1`/`PS1` ou `PlayStation 2`/`PS2`).
- `coverFront`: URL da capa frontal personalizada (opcional; substitui a automática).
- `coverBack`: URL da contracapa personalizada (opcional; substitui a imagem 3D automática).

### Como funciona a busca automática de capas
O site usa os padrões públicos dos projetos [xlenore/psx-covers](https://github.com/xlenore/psx-covers) e [xlenore/ps2-covers](https://github.com/xlenore/ps2-covers). Para o jogo individual, informe `coverSerial` e, se necessário, `coverSystem`. A capa frontal vem da pasta `covers/default/`; a imagem 3D vem de `covers/3d/` e aparece como vista alternativa, **não** como contracapa real. Se a coleção não tiver aquele serial, o site mantém a arte provisória.

Exemplo de campos em um item individual:
```json
{
  "platform": "PlayStation 1",
  "coverSystem": "ps1",
  "coverSerial": "SLUS-00771",
  "coverFront": "",
  "coverBack": ""
}
```
Um item que represente uma coleção inteira de 274 jogos não tem um único serial que represente todas as capas. Para exibir capas individuais, cadastre cada jogo como item separado com o próprio serial (ou crie uma lista de jogos individuais dentro da coleção).
- `emulatorLabel`, `emulatorDescription`, `emulatorUrl`: texto e URL do primeiro botão.
- `gameLabel`, `gameDescription`, `gameUrl`: texto e URL do segundo botão.
- `biosUrl`, `biosLabel`: link opcional para documentação oficial sobre BIOS, exibido em Recursos extras.
- `gameCount`: opcional, para quantidade de jogos numa coleção.

Se `coverFront` e `coverBack` estiverem vazios, o site mostra capas estilizadas provisórias. Use imagens próprias ou imagens que você tenha autorização para utilizar.

Cada botão abre um link externo em nova aba. A BIOS aparece como link opcional de recurso, não como um terceiro botão de download. Links e textos do catálogo são exemplos e devem ser substituídos antes de publicar.

## Publicar grátis com GitHub Pages
1. Crie uma conta em https://github.com/ e um repositório público, por exemplo `the-classiclab`.
2. Envie todos os arquivos e pastas para a raiz do repositório.
3. Entre em **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
5. Aguarde o deploy e abra a URL indicada nas configurações do Pages.
6. Para atualizar, envie as alterações para a branch `main`.

O site fica hospedado sem manter o PC ligado. GitHub Pages não fornece banco de dados ou painel de login por si só.

## Distribuição responsável
Publique links apenas para jogos, BIOS e arquivos que você tenha direito de compartilhar. Prefira páginas oficiais, homebrew autorizado, freeware e conteúdo com licença de redistribuição. Para jogos comerciais e BIOS proprietárias, indique fontes oficiais ou instruções para que cada usuário obtenha os próprios arquivos legalmente.
