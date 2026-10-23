const page = document.body.dataset.page || "home";
const pageView = page === "ports" ? "port" : ["ps1", "snes"].includes(page) ? "collection" : "all";
const state = { items: [], view: pageView, query: "", platform: "all", genre: "all" };
const grid = document.querySelector("#game-grid"), searchInput = document.querySelector("#search-input"), typeFilter = document.querySelector("#type-filter"), platformFilter = document.querySelector("#platform-filter"), genreFilter = document.querySelector("#genre-filter"), resultsCount = document.querySelector("#results-count"), emptyState = document.querySelector("#empty-state"), dialog = document.querySelector("#details-dialog"), dialogContent = document.querySelector("#dialog-content"), collectionDownloadGrids = document.querySelectorAll("[data-collection-platform]");
const colors = [["#594174", "#20233c"], ["#355b64", "#22243d"], ["#74453d", "#29213c"], ["#4b5b38", "#20233c"], ["#725331", "#2a203d"], ["#3e477a", "#27213a"]];
function escapeHTML(value = "") { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]); }
function safeExternalURL(value) { try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; } catch { return null; } }
function hashCode(str) { return [...String(str)].reduce((a,c) => ((a<<5)-a+c.charCodeAt(0))|0,0); }
function colorStyle(item) { const pair = Array.isArray(item.colors) && item.colors.length===2 ? item.colors : colors[Math.abs(hashCode(item.id||item.title||""))%colors.length]; return `--card-a:${escapeHTML(pair[0])};--card-b:${escapeHTML(pair[1])}`; }
function normalize(value) { return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase(); }
function kindLabel(item) { return item.typeLabel || (item.type === "collection" ? "COLEÇÃO PS1" : "PORT PARA PC"); }
function getCoverSystem(item) {
  const explicit = String(item.coverSystem || "").toLowerCase();
  if (["ps1", "ps2"].includes(explicit)) return explicit;
  const platform = normalize(item.platform || "");
  if (/\b(ps2|playstation 2|play station 2)\b/.test(platform)) return "ps2";
  if (/\b(ps1|psx|playstation 1|playstation one|play station 1)\b/.test(platform)) return "ps1";
  return null;
}
function getCollectionPage(item) {
  const platform = normalize(item.platform || "");
  if (/\b(ps1|psx|playstation 1|playstation one|play station 1)\b/.test(platform)) return "ps1";
  if (/\b(snes|super nintendo|super famicom)\b/.test(platform)) return "snes";
  return null;
}
function getCoverSerial(item) {
  const serial = String(item.coverSerial || item.serial || "").trim().toUpperCase().replace(/[ _]+/g, "-").replace(/-+/g, "-");
  return /^[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(serial) ? serial : null;
}
function autoCoverUrl(item, variant = "front") {
  const system = getCoverSystem(item), serial = getCoverSerial(item);
  if (!system || !serial) return null;
  const repo = system === "ps2" ? "ps2-covers" : "psx-covers";
  if (variant === "3d") return `https://raw.githubusercontent.com/xlenore/${repo}/main/covers/3d/${serial}.png`;
  return `https://raw.githubusercontent.com/xlenore/${repo}/main/covers/default/${serial}.jpg`;
}
function preferredCoverUrl(item, variant = "front") {
  const manual = variant === "front" ? item.coverFront : item.coverBack;
  if (manual && safeExternalURL(manual)) return safeExternalURL(manual);
  return autoCoverUrl(item, variant === "back" ? "3d" : "front");
}
function attachCoverImages(root) {
  root.querySelectorAll("img[data-cover-src]").forEach(img => {
    img.addEventListener("load", () => img.parentElement?.classList.add(img.dataset.coverRole === "card" ? "has-cover" : "has-image"), { once: true });
    img.addEventListener("error", () => img.remove(), { once: true });
    img.src = img.dataset.coverSrc;
  });
}
function getFilteredItems() { return state.items.filter(item => { const search=normalize([item.title,item.description,item.originalDescription,item.platform,item.genre,item.type].join(" ")); return (state.view==="all"||item.type===state.view)&&(!["ps1","snes"].includes(page)||getCollectionPage(item)===page)&&(state.platform==="all"||item.platform===state.platform)&&(state.genre==="all"||item.genre===state.genre)&&(!state.query||search.includes(normalize(state.query))); }); }
function renderCard(item) {
  const symbol = escapeHTML(item.symbol || item.title.slice(0, 2).toUpperCase());
  const count = item.type === "collection" && item.gameCount ? `${item.gameCount} JOGOS` : escapeHTML(item.genre || "PORT");
  const cover = preferredCoverUrl(item, "front");
  const isUnavailable = item.type === "port" && item.availability === "unavailable";
  const cardClass = `game-card${isUnavailable ? " is-unavailable" : ""}`;
  const status = item.type === "port"
    ? `<span class="availability-badge ${isUnavailable ? "is-unavailable" : "is-available"}">${isUnavailable ? "INDISPONÍVEL" : "DISPONÍVEL"}</span>`
    : "";
  const card = `<div class="card-art" style="${colorStyle(item)}">${cover ? `<img class="card-cover" data-cover-src="${escapeHTML(cover)}" data-cover-role="card" alt="Capa de ${escapeHTML(item.title)}" loading="lazy">` : ""}<span class="card-platform">${escapeHTML(item.platform || "MULTI")}</span><span class="card-kind">${kindLabel(item)}</span><span class="card-symbol">${symbol}</span></div><div class="card-body"><div class="card-meta">${count}</div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description || "Sem descrição cadastrada.")}</p><div class="card-bottom"><span>${escapeHTML(item.year || "ANO N/D")}</span>${status}</div></div>`;
  if (page === "home") {
    const collectionPage = item.type === "collection" ? getCollectionPage(item) : null;
    const href = collectionPage === "snes" ? "snes.html" : collectionPage === "ps1" ? "ps1.html" : "ports.html";
    const destination = collectionPage === "snes" ? "Super Nintendo" : collectionPage === "ps1" ? "PlayStation 1" : "Ports para PC";
    return `<a class="${cardClass}" href="${href}" aria-label="Abrir ${destination}">${card}</a>`;
  }
  const actionLabel = isUnavailable ? "Mostrar aviso de indisponibilidade" : "Ver detalhes";
  return `<article class="${cardClass}" data-open="${escapeHTML(item.id)}" tabindex="0" role="button" aria-label="${actionLabel}: ${escapeHTML(item.title)}">${card}</article>`;
}
function render() { const items=getFilteredItems(); grid.innerHTML=items.map(renderCard).join(""); attachCoverImages(grid); grid.hidden=items.length===0; emptyState.hidden=items.length!==0; resultsCount.textContent=`${String(items.length).padStart(2,"0")} ITEM(NS) ENCONTRADO(S)`; }
function populateFilters() { const platforms=[...new Set(state.items.map(x=>x.platform).filter(Boolean))].sort(), genres=[...new Set(state.items.map(x=>x.genre).filter(Boolean))].sort(); if(platformFilter) platformFilter.innerHTML='<option value="all">Todas</option>'+platforms.map(x=>`<option value="${escapeHTML(x)}">${escapeHTML(x)}</option>`).join(""); genreFilter.innerHTML='<option value="all">Todos</option>'+genres.map(x=>`<option value="${escapeHTML(x)}">${escapeHTML(x)}</option>`).join(""); }
function updateStats() { const total=document.querySelector("#stat-total"); if(!total)return; total.textContent=String(state.items.length).padStart(2,"0"); document.querySelector("#stat-ports").textContent=String(state.items.filter(x=>x.type==="port").length).padStart(2,"0"); document.querySelector("#stat-collections").textContent=String(state.items.filter(x=>x.type==="collection").length).padStart(2,"0"); }
function resetFilters() { state.view=pageView;state.query="";state.platform="all";state.genre="all";searchInput.value="";typeFilter.value=pageView;if(platformFilter)platformFilter.value="all";genreFilter.value="all";render(); }
function coverMarkup(item, side) { const explicitBack=side==="back"&&Boolean(item.coverBack&&safeExternalURL(item.coverBack)), auto3D=side==="back"&&!explicitBack&&Boolean(autoCoverUrl(item,"3d")), url=preferredCoverUrl(item,side), label=side==="front"?"CAPA FRONTAL":explicitBack?"CONTRACAPA":auto3D?"CAPA 3D":"CONTRACAPA", symbol=escapeHTML(item.symbol||item.title.slice(0,2).toUpperCase()), title=escapeHTML(item.title); const fallback=`<div class="cover-fallback"><span class="cover-kicker">${side==="front"?"THE CLASSICLAB ARCHIVE":"GAME FILE / ORIGINAL RELEASE"}</span>${side==="front"?`<span class="cover-symbol">${symbol}</span><strong>${title}</strong><small>${escapeHTML(item.platform||"")}</small>`:`<strong>${title}</strong><p>${escapeHTML(item.originalDescription||item.description||"")}</p><small>${escapeHTML(item.platform||"")} · ${escapeHTML(item.year||"RETRO")}</small>`}<span class="cover-bottom">${label} · CL_</span></div>`; return `<div class="physical-cover ${side}" style="${colorStyle(item)}">${url?`<img class="cover-image" data-cover-src="${escapeHTML(url)}" data-cover-role="detail" alt="${label} de ${title}" loading="lazy" referrerpolicy="no-referrer">`:""}${fallback}</div>`; }
function downloadButton(label, description, url, cls) { const safe=safeExternalURL(url); if(!safe) return `<div class="download-button disabled" aria-disabled="true"><span><strong>${escapeHTML(label)}</strong><small>Link ainda não cadastrado</small></span><b>↗</b></div>`; return `<a class="download-button ${cls}" href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer"><span><strong>${escapeHTML(label)}</strong><small>${escapeHTML(description||"Abre em outro site")}</small></span><b>↗</b></a>`; }
async function loadCollectionDownloads(downloadGrid) {
  try {
    const response = await fetch("data/games.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const items = await response.json();
    const platform = normalize(downloadGrid.dataset.collectionPlatform);
    const collection = items.find(item => item?.type === "collection" && normalize(item.platform) === platform);
    if (!collection) return;
    const emulator = downloadButton(collection.emulatorLabel || "Baixar emulador", collection.emulatorDescription || "Página oficial do emulador", collection.emulatorUrl, "emulator-download");
    const bios = collection.biosLabel ? downloadButton(collection.biosLabel, collection.biosDescription || "Orientações para configurar a BIOS do console", collection.biosUrl, "bios-download") : "";
    const games = downloadButton(collection.gameLabel || "Baixar coletânea", collection.gameDescription || "Acessar a página da coletânea", collection.gameUrl, "game-download");
    downloadGrid.innerHTML = `${emulator}${bios}${games}`;
  } catch (error) {
    console.error(error);
  }
}
function downloadButtonsMarkup(item) {
  const emulator = downloadButton(item.emulatorLabel || "Baixar emulador", item.emulatorDescription || "Página oficial do emulador/projeto", item.emulatorUrl, "emulator-download");
  const game = downloadButton(item.gameLabel || (item.type === "collection" ? "Baixar coleção" : "Baixar jogo / ROM"), item.gameDescription || "Jogo, ROM ou arquivos necessários", item.gameUrl, "game-download");
  return item.showGameDownload === false ? emulator : `${emulator}${game}`;
}
function openDetails(id) {
  const item = state.items.find(x => x.id === id);
  if (!item || (item.type === "port" && item.availability === "unavailable")) return;
  dialog.classList.remove("is-notice");
  const tags = [item.platform, item.genre, item.type === "collection" && item.gameCount ? `${item.gameCount} jogos` : item.year].filter(Boolean);
  const steps = Array.isArray(item.instructions) && item.instructions.length ? item.instructions.map(s => `<li>${escapeHTML(s)}</li>`).join("") : "<li>Consulte a documentação oficial do projeto.</li>";
  const biosURL = safeExternalURL(item.biosUrl);
  const bios = biosURL ? `<p class="bios-resource"><span>RECURSO EXTRA</span> <a href="${escapeHTML(biosURL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.biosLabel || "Documentação sobre BIOS")} ↗</a></p>` : "";
  dialogContent.innerHTML = `<div class="detail-hero" style="${colorStyle(item)}"><div class="cover-pair">${coverMarkup(item, "front")}${coverMarkup(item, "back")}</div><div class="detail-title-block"><p class="eyebrow">${kindLabel(item)} · ARQUIVO CLASSICLAB</p><h2 id="detail-title">${escapeHTML(item.title)}</h2><div class="detail-tags">${tags.map(t => `<span>${escapeHTML(t)}</span>`).join("")}</div></div></div><div class="detail-main"><section class="detail-block original-description"><p class="eyebrow">SOBRE O JOGO ORIGINAL</p><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.originalDescription || item.description || "Descrição ainda não cadastrada.")}</p></section><section class="detail-block"><p class="eyebrow">COMO JOGAR</p><h3>Instruções</h3><ul class="instruction-list">${steps}</ul>${item.requirements ? `<p class="requirements"><strong>Requisitos / observações:</strong> ${escapeHTML(item.requirements)}</p>` : ""}${bios}</section><section class="download-section"><p class="eyebrow">ARQUIVOS E DOWNLOADS</p><div class="download-grid">${downloadButtonsMarkup(item)}</div><p class="download-note">Os botões abrem links externos. Confira a fonte, a licença e as instruções antes de baixar.</p></section>${item.notice ? `<p class="detail-notice">${escapeHTML(item.notice)}</p>` : ""}</div>`;
  attachCoverImages(dialogContent);
  if (typeof dialog.showModal === "function") dialog.showModal();
}
function showUnavailableNotice() {
  if (!dialog || !dialogContent) return;
  dialog.classList.add("is-notice");
  dialogContent.innerHTML = `<div class="availability-notice"><p class="eyebrow">PORT PARA PC</p><h2 id="detail-title">Jogo indisponível</h2><p>Esse jogo ainda não chegou ao site até o momento.</p><button class="button button-secondary" id="unavailable-ok" type="button" autofocus>Ok</button></div>`;
  dialog.showModal();
  dialogContent.querySelector("#unavailable-ok").addEventListener("click", () => dialog.close());
}
function openCard(id) {
  const item = state.items.find(x => x.id === id);
  if (!item) return;
  if (item.type === "port" && item.availability === "unavailable") {
    showUnavailableNotice();
    return;
  }
  openDetails(id);
}
async function loadCatalog() { try { if(pageView!=="all"){typeFilter.closest("label").style.display="none";} const response=await fetch("data/games.json");if(!response.ok)throw new Error(`HTTP ${response.status}`);const data=await response.json();if(!Array.isArray(data))throw new Error("O arquivo JSON deve conter uma lista.");state.items=data.filter(x=>x&&x.id&&x.title&&["port","collection"].includes(x.type));populateFilters();updateStats();render(); } catch(error) { console.error(error);grid.innerHTML=`<div class="empty-state"><span>!</span><h3>Não foi possível carregar o catálogo</h3><p>Abra o projeto por um servidor local, como a extensão Live Server do VS Code. O JSON pode não carregar se abrir o HTML diretamente.</p><p>Detalhe: ${escapeHTML(error.message)}</p></div>`;resultsCount.textContent="ERRO AO CARREGAR"; } }
if(grid){
  searchInput.addEventListener("input",e=>{state.query=e.target.value;render();}); typeFilter.addEventListener("change",e=>{state.view=e.target.value;render();}); if(platformFilter)platformFilter.addEventListener("change",e=>{state.platform=e.target.value;render();}); genreFilter.addEventListener("change",e=>{state.genre=e.target.value;render();});
  document.querySelector("#clear-filters").addEventListener("click",resetFilters);document.querySelector("#empty-clear").addEventListener("click",resetFilters);document.querySelector("#explore-btn").addEventListener("click",()=>document.querySelector("#library").scrollIntoView({behavior:"smooth"}));grid.addEventListener("click",e=>{const card=e.target.closest("[data-open]");if(card)openCard(card.dataset.open);});grid.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches(".game-card[data-open]")){e.preventDefault();openCard(e.target.dataset.open);}});document.querySelector("#dialog-close").addEventListener("click",()=>dialog.close());dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});document.addEventListener("keydown",e=>{if(e.key==="/"&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();searchInput.focus();}if(e.key==="Escape"&&dialog.open)dialog.close();});loadCatalog();
}
collectionDownloadGrids.forEach(loadCollectionDownloads);
document.querySelector("#year").textContent=new Date().getFullYear();
