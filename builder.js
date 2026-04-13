// ========================================================================
// THE RPG FORGE - ADVANCED LOGIC V3 (MULTILAYERS & MASTER HUD)
// ========================================================================

let projectData = {
    name: "",
    theme: "survival",
    customThemeName: "",
    hasDayNight: false,
    keyDayNight: '',
    hasBlackout: false,
    keyBlackout: '',
    keyTokenLight: '',
    hasCctv: false,
    keyCctv: '',
    hasFog: false,
    keyFog: '',
    masterButtons: [],
    sectors: [
        { 
            id: 'andar_1', name: 'Recepção', 
            imgBaseName: '', imgNightName: '', imgBlackoutName: '', 
            blobBase: null, blobNight: null, blobBlackout: null,
            hotspots: [] 
        }
    ]
};

let currentStep = 1;
let tempHotspot = { x: 0, y: 0 }; 
window.userTestMapBlob = null; // Legacy global mock mode support

// Variaveis globais de preview no Step 4
let editorLanterna = false;
let editorCctv = false;

// ========================================================================
// 1. WIZARD NAVIGATION
// ========================================================================

function nextStep(step) {
    if (step === 2) {
        const nameInput = document.getElementById('worldName').value.trim();
        if (!nameInput) return showToast("Por favor, preencha o Nome do Projeto.");
        projectData.name = nameInput;

        if (projectData.theme === 'custom') {
            const customInput = document.getElementById('customThemeName').value.trim();
            if (!customInput) return showToast("Descreva o seu tema personalizado.");
            projectData.customThemeName = customInput;
        }
    }

    if (step === 3) {
        projectData.hasDayNight = document.getElementById('cboxDayNight').checked;
        projectData.keyDayNight = document.getElementById('keyDayNight').value.trim().toLowerCase();
        projectData.hasBlackout = document.getElementById('cboxBlackout').checked;
        projectData.keyBlackout = document.getElementById('keyBlackout').value.trim().toLowerCase();
        projectData.keyTokenLight = document.getElementById('keyTokenLight').value.trim().toLowerCase();
        projectData.hasCctv = document.getElementById('cboxCctv').checked;
        projectData.keyCctv = document.getElementById('keyCctv').value.trim().toLowerCase();
        projectData.hasFog = document.getElementById('cboxFog').checked;
        projectData.keyFog = document.getElementById('keyFog').value.trim().toLowerCase();
        renderSectors();
    }

    if (step === 4) {
        // Valida se os andares pussuem ao menos um nome base configurado ou blob salvo.
        initEditor();
    }

    if (step === 5) {
        if (!window.currentPromptTab) window.currentPromptTab = 'minigame';
        updatePromptForType(window.currentPromptTab);
    }

    document.querySelectorAll('.wizard-card').forEach(v => v.classList.remove('active'));
    document.getElementById(`step${step}View`).classList.add('active');

    document.querySelectorAll('.step').forEach(btn => {
        const btnStep = parseInt(btn.dataset.step);
        if (btnStep === step) {
            btn.classList.add('active');
            btn.classList.remove('completed');
        } else if (btnStep < step) {
            btn.classList.remove('active');
            btn.classList.add('completed');
        } else {
            btn.classList.remove('active', 'completed');
        }
    });
    currentStep = step;
}

function prevStep(step) {
    document.querySelectorAll('.wizard-card').forEach(v => v.classList.remove('active'));
    document.getElementById(`step${step}View`).classList.add('active');

    document.querySelectorAll('.step').forEach(btn => {
        const btnStep = parseInt(btn.dataset.step);
        if (btnStep === step) {
            btn.classList.add('active');
            btn.classList.remove('completed');
        } else if (btnStep < step) {
            btn.classList.remove('active');
            btn.classList.add('completed');
        } else {
            btn.classList.remove('active', 'completed');
        }
    });

    currentStep = step;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-card').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.theme-card').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            projectData.theme = opt.dataset.theme;
            
            const customGroup = document.getElementById('customThemeContainer');
            if(projectData.theme === 'custom') {
                customGroup.style.display = 'block';
            } else {
                customGroup.style.display = 'none';
            }
        });
    });
});

// ========================================================================
// MASTER BUTTONS ADDON
// ========================================================================
function addMasterButton() {
    projectData.masterButtons.push({ tag: 'Botão ' + (projectData.masterButtons.length+1), action: 'alert("Botão Clickado");', key: '' });
    renderMasterButtons();
}

function updateMasterBtn(idx, field, val) { projectData.masterButtons[idx][field] = val; }

function removeMasterButton(idx) {
    projectData.masterButtons.splice(idx, 1);
    renderMasterButtons();
}

function renderMasterButtons() {
    const box = document.getElementById('masterButtonsGrid');
    box.innerHTML = projectData.masterButtons.map((b, idx) => `
        <div class="master-btn-row" style="grid-template-columns: 2fr 3fr 1fr auto;">
            <input type="text" value="${b.tag}" placeholder="Nome Exibido" onchange="updateMasterBtn(${idx}, 'tag', this.value)">
            <input type="text" value="${b.action}" placeholder="Código JS (ex: toggleTime())" onchange="updateMasterBtn(${idx}, 'action', this.value)">
            <input type="text" value="${b.key}" placeholder="Tecla" onchange="updateMasterBtn(${idx}, 'key', this.value)" maxlength="1" style="text-align:center; text-transform:uppercase;">
            <button class="btn btn-secondary" onclick="removeMasterButton(${idx})" title="Remover Botão">✖</button>
        </div>
    `).join('');
}


// ========================================================================
// 2. SECTORS OVERHAUL (DYNAMIC MULTI-IMAGE UPLOADS)
// ========================================================================

function addSector() {
    const id = 'andar_' + (projectData.sectors.length + 1);
    projectData.sectors.push({
        id: id, name: 'Nova Sala/Andar', 
        imgBaseName: '', imgNightName: '', imgBlackoutName: '',
        blobBase: null, blobNight: null, blobBlackout: null,
        hotspots: []
    });
    renderSectors();
}

function handleSectorFile(idx, type, fileObj) {
    const sec = projectData.sectors[idx];
    if(fileObj) {
        sec[type + 'Name'] = fileObj.name; 
        const blobUrl = URL.createObjectURL(fileObj);
        
        if (type === 'imgBase') { if(sec.blobBase) URL.revokeObjectURL(sec.blobBase); sec.blobBase = blobUrl; }
        if (type === 'imgNight') { if(sec.blobNight) URL.revokeObjectURL(sec.blobNight); sec.blobNight = blobUrl; }
        if (type === 'imgBlackout') { if(sec.blobBlackout) URL.revokeObjectURL(sec.blobBlackout); sec.blobBlackout = blobUrl; }
        
        renderSectors();
        showToast("✓ Arquivo capturado para a simulação.");
    }
}

function removeSector(idx) {
    if(confirm("Remover este andar?")) {
        projectData.sectors.splice(idx, 1);
        renderSectors();
    }
}

function renderSectors() {
    const container = document.getElementById('sectorsContainer');
    container.innerHTML = '';

    projectData.sectors.forEach((sector, index) => {
        const div = document.createElement('div');
        div.className = 'sector-row';
        div.style.display = 'block';
        div.style.marginBottom = '20px';
        
        let extraInputs = "";
        
        if(projectData.hasDayNight) {
            extraInputs += `
                <div style="flex:1;">
                    <label style="font-size:0.8em; color:var(--text-muted); display:block; margin-bottom:5px;">🌙 Imagem da Noite</label>
                    ${sector.imgNightName ? `<div style="font-size:0.8em; color:var(--emerald);">[OK] ${sector.imgNightName}</div>` : ''}
                    <input type="file" accept="image/*" style="font-size:0.8em; margin-top:5px;" onchange="handleSectorFile(${index}, 'imgNight', this.files[0])">
                    <p style="font-size:0.75em; opacity:0.5;">Dica de arquivo: nome terminando com _noite.png</p>
                </div>`;
        }

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <div class="tag">${sector.id}</div>
                <button class="btn btn-secondary" style="padding:4px 8px;" onclick="removeSector(${index})">Deletar</button>
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="font-size:0.8em; color:var(--text-muted);">Nome na Interface (O Jogador verá isso)</label>
                <input type="text" value="${sector.name}" onchange="updateSector(${index}, 'name', this.value)" placeholder="Nome Exibido">
            </div>

            <div style="display:flex; gap:15px; margin-top:10px; background:rgba(255,255,255,0.03); padding:15px; border-radius:8px;">
                <div style="flex:1;">
                    <label style="font-size:0.8em; color:var(--text-muted); display:block; margin-bottom:5px;">☀️ Imagem Base / Dia</label>
                    ${sector.imgBaseName ? `<div style="font-size:0.8em; color:var(--emerald); word-break: break-all;">[OK] ${sector.imgBaseName}</div>` : ''}
                    <input type="file" accept="image/*" style="font-size:0.8em; margin-top:5px;" onchange="handleSectorFile(${index}, 'imgBase', this.files[0])">
                    <p style="font-size:0.75em; opacity:0.5;">* Obrigatório. (Ex: sala1.png)</p>
                </div>
                ${extraInputs}
            </div>
        `;
        container.appendChild(div);
    });
}

function updateSector(index, key, value) {
    projectData.sectors[index][key] = value.trim();
}

// ========================================================================
// 4. HOTSPOT EDITOR OVERHAUL (FIXED PRECISE ANCHORING)
// ========================================================================

function initEditor() {
    const select = document.getElementById('activeSectorSelect');
    select.innerHTML = projectData.sectors.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    // Mostra/Oculta toggles baseados no passo 2
    document.getElementById('btnTestLanterna').style.display = projectData.hasBlackout ? 'inline-block' : 'none';
    document.getElementById('btnTestCctv').style.display = projectData.hasCctv ? 'inline-block' : 'none';
    
    updateEditorPreview();
}

window.uploadTestMap = function(e) {
    const file = e.target.files[0];
    if(file) {
        if(window.userTestMapBlob) URL.revokeObjectURL(window.userTestMapBlob);
        window.userTestMapBlob = URL.createObjectURL(file);
        updateEditorPreview();
        showToast("Imagem Alternativa carregada livremente!");
    }
}

function updateEditorPreview() {
    const anchor = document.getElementById('mapAnchorGrid');
    const sectorId = document.getElementById('activeSectorSelect').value;
    const sector = projectData.sectors.find(s => s.id === sectorId);

    // Se o usuário soltou a imagem real no Step 3, usamos como prioridade do preview.
    // Senão, checa o mockup secundário do Editor ou usa SVG genérico
    let mockImage = sector.blobBase || window.userTestMapBlob || 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect fill="%231a1a24" width="800" height="450"/%3E%3Cpath stroke="%232d2d3d" stroke-width="2" d="M0 0l800 450M800 0L0 450"/%3E%3Crect x="300" y="180" width="200" height="90" fill="%230c0c11" stroke="%23dca362" stroke-width="2" rx="10"/%3E%3Ctext x="400" y="222" font-family="sans-serif" font-size="18" fill="%23dca362" font-weight="bold" text-anchor="middle"%3EÁREA DO MAPA OMITIDA%3C/text%3E%3Ctext x="400" y="245" font-family="sans-serif" font-size="12" fill="%238d8d9b" text-anchor="middle"%3EFaça o Upload no Passo 3 ou insira livremente%3C/text%3E%3C/svg%3E';

    anchor.innerHTML = `
        <img src="${mockImage}" alt="Base Image" draggable="false" ondragstart="return false;" style="-webkit-user-drag: none; user-select: none;">
        <div id="hotspotMarkersLayer"></div>
    `;

    anchor.onclick = function(e) {
        if(e.target.classList.contains('hs-marker-viz')) return;
        const rect = anchor.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        triggerHotspotModal(x, y);
    };

    renderHotspotMarkers();
}

function toggleTestLanterna() {
    editorLanterna = !editorLanterna;
    document.getElementById('editorLanternaLayer').style.display = editorLanterna ? 'block' : 'none';
}
function toggleTestCCTV() {
    editorCctv = !editorCctv;
    document.getElementById('editorCctvLayer').style.display = editorCctv ? 'block' : 'none';
}

function triggerHotspotModal(x, y) {
    tempHotspot = { x, y };

    const select = document.getElementById('hsTargetSelect');
    select.innerHTML = projectData.sectors.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    document.getElementById('hsTitleInput').value = '';
    
    // Reseta visibilidade pra default
    document.getElementById('hsVisibilitySelect').value = 'visible';
    
    const overlay = document.getElementById('hotspotModalOverlay');
    overlay.style.display = 'flex';
    document.getElementById('hsTitleInput').focus();
}

function closeHotspotModal() { document.getElementById('hotspotModalOverlay').style.display = 'none'; }

function confirmHotspotCreation() {
    const title = document.getElementById('hsTitleInput').value.trim();
    if(!title) {
        showToast("O hotspot precisa de um nome!");
        return;
    }

    const target = document.getElementById('hsTargetSelect').value;
    const visibility = document.getElementById('hsVisibilitySelect').value;
    const sectorId = document.getElementById('activeSectorSelect').value;
    const sector = projectData.sectors.find(s => s.id === sectorId);

    sector.hotspots.push({
        id: target,
        title: title,
        visibility: visibility,
        position: { top: tempHotspot.y.toFixed(3) + '%', left: tempHotspot.x.toFixed(3) + '%' }
    });

    closeHotspotModal();
    renderHotspotMarkers();
    showToast("Hotspot vinculado com sucesso!");
}

function renderHotspotMarkers() {
    const layer = document.getElementById('hotspotMarkersLayer');
    if (!layer) return;

    const sectorId = document.getElementById('activeSectorSelect').value;
    const sector = projectData.sectors.find(s => s.id === sectorId);

    layer.innerHTML = sector.hotspots.map((h, idx) => `
        <div class="hs-marker-viz" data-vis="${h.visibility || 'visible'}" style="top: ${h.position.top}; left: ${h.position.left};" title="${h.title}" onclick="removeHotspot(${idx}, event)"></div>
    `).join('');
}

function removeHotspot(index, event) {
    event.stopPropagation();
    const sectorId = document.getElementById('activeSectorSelect').value;
    const sector = projectData.sectors.find(s => s.id === sectorId);
    if(confirm(`Deseja remover o direcionamento para "${sector.hotspots[index].title}"?`)) {
        sector.hotspots.splice(index, 1);
        renderHotspotMarkers();
    }
}


// ========================================================================
// 5. PROMPT LIBRARY (THE AI FORGE)
// ========================================================================
window.updatePromptForType = function(type) {
    window.currentPromptTab = type;
    const promptEl = document.getElementById('minigamePrompt');
    const titleEl = document.getElementById('promptHeaderTitle');
    
    let ambienteStr = projectData.hasDayNight ? "O mapa tem um sistema de ciclos Dia/Noite (`isDay`). " : "";
    let temaStr = projectData.theme === 'survival' ? "Modelo: Bunker Sci-Fi / Sobrevivência. Quero puzzles envolvendo sensores ou painéis de circuitos." :
                  projectData.theme === 'western' ? "Modelo: Velho Oeste. Quero ação, duelos rápidos ou roubo/arrombamento de cofre." :
                  projectData.theme === 'mystery' ? "Modelo: Mistério Obscuro. Preciso de exploração sutil, dedução ou organização de provas." : 
                  `Modelo Personalizado: '${projectData.customThemeName}'. Crie a mecânica mergulhada puramente nesse cenário.`;
                  
    if(type === 'minigame') {
        if(titleEl) titleEl.innerText = '⚙️ Gerador Dinâmico de Modais';
        promptEl.value = `📍 ESTÁGIO 1: A LÓGICA DO MINIGAME
"Estou desenvolvendo o sistema 'The RPG Forge' do meu mapa. Crie o código self-contained de um MINIGAME. Ele deve contar com HTML (Modal), CSS nativo e Javascript completo. 
Contexto do mapa global: THEME_LORE = '${projectData.theme === 'custom' ? projectData.customThemeName : projectData.theme}'. ${ambienteStr} ${temaStr} Retorne pronto para eu colar logo abaixo da tag </body>."`;
    } else if (type === 'npc') {
        if(titleEl) titleEl.innerText = '🗣️ Engajamento Narrativo';
        promptEl.value = `"Projeto Base: 'The RPG Forge'. HTML/JS Vanilla. THEME_LORE atual é '${projectData.theme === 'custom' ? projectData.customThemeName : projectData.theme}'.
Sua missão: Construir um componente ModalUI elegante de Diálogos, do Zero.
1. Caixa classic RPG presa ao rodapé, Portrait redondo e efeito Typewriter.
2. Função 'iniciarDialogo(nome, arrayDeMensagens)' ativável com cliques para ir p/ próxima linha. Retorne em bloco sel-contained."`;
    } else if (type === 'puzzle') {
        if(titleEl) titleEl.innerText = '🔑 Fechaduras Digitais';
        promptEl.value = `"Preciso de um Terminal de Senha / Puzzle.
1. Um Enigma textual complexo moldado pelo THEME_LORE: '${projectData.theme === 'custom' ? projectData.customThemeName : projectData.theme}'. (Gere o lore do desafio).
2. Input e Botão. Acerto encerra div, Erro treme tela (CSS .shake). Mande HTML/JS selfcontained."`;
    }
}


// ========================================================================
// 6. EXPORT ENGINE (A OBRA DE ARTE FINAL)
// ========================================================================

function exportProject() {
    const template = generateTemplate();
    const blob = new Blob([template], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mapa_RPG_${projectData.name.replace(/ /g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Seu arquivo matriz foi forjado e salvo na pasta Segura!");
}

function generateTemplate() {
    const hierarchy = {};
    projectData.sectors.forEach(s => {
        // Agora gravamos não só o id, mas também garantimos as strings extraídas dos files no Passo 3.
        hierarchy[s.id] = { 
            id: s.id, name: s.name, 
            imgBaseName: s.imgBaseName || s.name+'.png',
            imgNightName: s.imgNightName || s.name+'_noite.png',
            imgBlackoutName: s.imgBlackoutName || s.name+'_blackout.png',
            hotspots: s.hotspots 
        };
    });

    let envCSS = '';
    let envHTML = '';
    let customCssVars = '';

    if (projectData.theme === 'custom') {
        customCssVars = '--main-color: #f72585; --bg-gradient: radial-gradient(circle, rgba(16,10,25,1) 0%, rgba(0,0,0,1) 100%); --ambient-glow: rgba(247,37,133,0.3);';
    } else if (projectData.theme === 'survival') {
        customCssVars = '--main-color: #e5b376; --bg-gradient: radial-gradient(circle, rgba(20,25,20,1) 0%, rgba(5,10,5,1) 100%); --ambient-glow: rgba(229,179,118,0.3);';
    } else if (projectData.theme === 'western') {
        customCssVars = '--main-color: #d17a22; --bg-gradient: radial-gradient(circle, rgba(35,20,10,1) 0%, rgba(10,5,0,1) 100%); --ambient-glow: rgba(209,122,34,0.3);';
    } else if (projectData.theme === 'mystery') {
        customCssVars = '--main-color: #7289da; --bg-gradient: radial-gradient(circle, rgba(15,20,35,1) 0%, rgba(0,0,5,1) 100%); --ambient-glow: rgba(114,137,218,0.3);';
    }
    
    // Engine CSS Master de sobreposição ambiente (DayNight é resolvido logicamente, CCTV/Blackout são DOM Layers e Canvas)
    const cctvLayerCSS = `
        #cctvLayer { position: absolute; inset: 0; pointer-events: none; z-index: 100; display: none; background: repeating-linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%); background-size: 100% 4px; animation: scanlines 10s linear infinite; backdrop-filter: blur(0.8px); box-shadow: inset 0 0 30px rgba(0,0,0,0.8); }
        @keyframes scanlines { from { background-position: 0 0; } to { background-position: 0 100%; } }
        
        .cctv-cam { position: absolute; top: 30px; left: 40px; font-family: "Courier New", monospace; font-size: 2.2rem; color: #fff; font-weight: bold; opacity:0.8; text-shadow: 0 0 5px #fff; }
        .cctv-hud { position: absolute; top: 30px; right: 40px; font-family: "Courier New", monospace; color: #fff; display: flex; flex-direction: column; align-items: flex-end; }
        .cctv-rec { font-size: 1.8rem; color: red; font-weight: bold; animation: blink 1s infinite; display:flex; align-items:center; gap:12px; text-shadow: 0 0 5px #f00; }
        .cctv-rec::before { content:''; width:16px; height:16px; background:red; border-radius:50%; box-shadow: 0 0 8px red; }
        .cctv-date { font-size: 1.3rem; margin-top:8px; opacity:0.9; text-shadow: 0 0 5px #fff; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    `;
    const fogCSS = projectData.hasFog ? `
        .fog-layer { position: absolute; inset: 0; pointer-events: none; z-index: 15; display: none; opacity: 0; transition: opacity 1s ease-in-out; overflow: hidden; mix-blend-mode: screen; }
        .fog-layer.active { display: block; opacity: 1; }
        .fog-overlay { position: absolute; inset: -100px; background: radial-gradient(ellipse 600px 400px at 20% 30%, rgba(200, 200, 220, 0.35), transparent 50%), radial-gradient(ellipse 500px 350px at 50% 50%, rgba(210, 210, 230, 0.3), transparent 50%), radial-gradient(ellipse 550px 380px at 80% 70%, rgba(205, 205, 225, 0.33), transparent 50%); animation: fogDriftRight 30s linear infinite; filter: blur(40px); }
        @keyframes fogDriftRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .fog-veil { position: absolute; inset: -100px; background: radial-gradient(ellipse 550px 370px at 30% 40%, rgba(190, 190, 210, 0.3), transparent 50%), radial-gradient(ellipse 480px 340px at 60% 60%, rgba(185, 185, 205, 0.28), transparent 50%), radial-gradient(ellipse 520px 360px at 90% 20%, rgba(195, 195, 215, 0.32), transparent 50%); animation: fogDriftRight 45s linear infinite; filter: blur(50px); animation-delay: -15s; }
        .fog-dense-layer { position: absolute; inset: -100px; background: radial-gradient(ellipse 580px 390px at 40% 25%, rgba(180, 180, 200, 0.28), transparent 50%), radial-gradient(ellipse 490px 330px at 70% 75%, rgba(175, 175, 195, 0.25), transparent 50%); animation: fogDriftLeft 40s linear infinite; filter: blur(45px); animation-delay: -10s; }
        @keyframes fogDriftLeft { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .fog-float-layer { position: absolute; inset: 0; background: radial-gradient(ellipse 650px 420px at 15% 20%, rgba(220, 220, 240, 0.4), transparent 50%), radial-gradient(ellipse 580px 390px at 85% 80%, rgba(210, 210, 230, 0.42), transparent 50%), radial-gradient(ellipse 620px 400px at 45% 55%, rgba(215, 215, 235, 0.38), transparent 50%); animation: fogFloatInPlace1 20s ease-in-out infinite; filter: blur(55px); }
        @keyframes fogFloatInPlace1 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; } 33% { transform: translate(40px, -30px) scale(1.08); opacity: 0.85; } 66% { transform: translate(-35px, 35px) scale(0.92); opacity: 0.9; } }
        .fog-ambient-layer { position: absolute; inset: 0; background: radial-gradient(ellipse 700px 450px at 50% 30%, rgba(200, 200, 220, 0.38), transparent 50%), radial-gradient(ellipse 600px 380px at 25% 70%, rgba(190, 190, 210, 0.4), transparent 50%), radial-gradient(ellipse 550px 360px at 75% 45%, rgba(195, 195, 215, 0.36), transparent 50%); animation: fogFloatInPlace2 28s ease-in-out infinite; filter: blur(60px); animation-delay: -7s; }
        @keyframes fogFloatInPlace2 { 0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 50% { transform: translate(-45px, 40px) rotate(5deg); opacity: 0.8; } }
        .fog-pulse-layer { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 0%, transparent 20%, rgba(180, 180, 200, 0.2) 50%, rgba(160, 160, 180, 0.3) 100%); animation: fogPulse 12s ease-in-out infinite; filter: blur(35px); }
        @keyframes fogPulse { 0%, 100% { opacity: 0.9; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } }
        .fog-particles { position: absolute; inset: 0; background-image: radial-gradient(circle 2px at 15% 25%, rgba(255, 255, 255, 0.5), transparent), radial-gradient(circle 1px at 45% 35%, rgba(255, 255, 255, 0.3), transparent), radial-gradient(circle 2px at 75% 15%, rgba(255, 255, 255, 0.4), transparent), radial-gradient(circle 1px at 25% 65%, rgba(255, 255, 255, 0.35), transparent), radial-gradient(circle 2px at 85% 55%, rgba(255, 255, 255, 0.4), transparent), radial-gradient(circle 1px at 55% 75%, rgba(255, 255, 255, 0.3), transparent), radial-gradient(circle 2px at 10% 85%, rgba(255, 255, 255, 0.5), transparent), radial-gradient(circle 1px at 90% 85%, rgba(255, 255, 255, 0.3), transparent), radial-gradient(circle 2px at 40% 50%, rgba(255, 255, 255, 0.4), transparent), radial-gradient(circle 1px at 70% 30%, rgba(255, 255, 255, 0.35), transparent); background-size: 200% 200%; animation: fogParticlesDrift 25s linear infinite; opacity: 0.6; }
        @keyframes fogParticlesDrift { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }
    ` : '';
    let blackoutCanvasCSS = projectData.hasBlackout ? '#flashlightCanvas { pointer-events:none; position:absolute; inset:0; width:100%; height:100%; z-index:90; display:none; }' : '';

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectData.name} | Gerado RpgForge V3</title>
    <style>
        :root { ${customCssVars} }
        /* CSS BASE - ENGRENAGEM PRINCIPAL */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-gradient); color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; overflow: hidden; }

        /* LABEL FLUTUANTE DE LOCALIZAÇÃO */
        .location-label { position: fixed; bottom: 20px; left: 25px; z-index: 2000; pointer-events: none; }
        .location-name { font-weight: 700; font-size: 1.1em; text-transform: uppercase; letter-spacing: 3px; color: var(--main-color); text-shadow: 0 2px 8px rgba(0,0,0,0.9), 0 0 20px var(--ambient-glow); }
        .location-hint { font-size: 0.65em; color: rgba(255,255,255,0.35); letter-spacing: 1px; margin-top: 3px; }

        /* MENU DE CONTEXTO (Botão Direito) */
        .ctx-menu { position: fixed; z-index: 9999; background: rgba(12,12,16,0.97); border: 1px solid var(--main-color); border-radius: 12px; padding: 8px; display: none; flex-direction: column; gap: 6px; min-width: 220px; box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 20px var(--ambient-glow); backdrop-filter: blur(12px); animation: ctxFadeIn 0.15s ease; }
        .ctx-menu.open { display: flex; }
        @keyframes ctxFadeIn { from { opacity:0; transform: scale(0.92); } to { opacity:1; transform: scale(1); } }
        .ctx-sep { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }
        .ctx-title { font-size: 0.7em; text-transform: uppercase; letter-spacing: 2px; color: var(--main-color); padding: 4px 10px; opacity: 0.7; }
        .btn-ui { display: block; width: 100%; padding: 11px 16px; background: transparent; border: none; border-radius: 8px; color: #fff; text-align: left; cursor: pointer; transition: 0.2s; font-size: 0.92em; font-family: inherit; }
        .btn-ui:hover { background: rgba(255,255,255,0.08); color: var(--main-color); padding-left: 22px; }
        .btn-ui.btn-back { color: rgba(255,255,255,0.6); }
        .ctx-tip { padding: 5px 16px; font-size: 0.78em; color: rgba(255,255,255,0.35); line-height: 1.6; }

        /* O CONTAINER MESTRE */
        .viewport { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
        .map-anchor { position: relative; display: inline-flex; box-shadow: 0 20px 80px rgba(0,0,0,0.9); }
        .map-anchor img { display: block; max-width: 100vw; max-height: 100vh; object-fit: contain; pointer-events: none; user-select: none; -webkit-user-drag: none; }
        
        /* THE HOTSPOTS (Agora com VISIBILIDADE variavel!) */
        .hs-marker-viz { position: absolute; transform: translate(-50%, -50%); width: 25px; height: 25px; border-radius: 50%; pointer-events: auto; cursor: pointer; transition: all 0.3s; z-index: 20; }
        .hs-marker-viz[data-vis="visible"] { background: var(--main-color); border: 2px solid #fff; box-shadow: 0 0 15px var(--ambient-glow); }
        .hs-marker-viz[data-vis="visible"]:hover { transform: translate(-50%, -50%) scale(1.3); }
        .hs-marker-viz[data-vis="semi"] { background: transparent; border: 2px dashed rgba(255,255,255,0.3); }
        .hs-marker-viz[data-vis="semi"]:hover { transform: translate(-50%, -50%) scale(1.3); background: rgba(255,255,255,0.2); border-color: #fff; }
        .hs-marker-viz[data-vis="invisible"] { background: transparent; border: none; }
        .hs-marker-viz[data-vis="invisible"]:hover { background: rgba(255,255,255,0.05); }

        /* PERSONAGENS E MULTI-SELECT (VTT) */
        .char-token { position: absolute; width: 45px; height: 45px; border-radius: 50%; background: #111; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 1.2em; cursor: grab; z-index: 110; transform: translate(-50%, -50%) rotate(0deg); box-shadow: 0 10px 20px rgba(0,0,0,0.8); user-select: none; transition: box-shadow 0.2s, border-color 0.2s; }
        .char-token.selected { border-color: #ffd700; box-shadow: 0 0 20px rgba(255,215,0,0.8); z-index: 115; }
        .char-token:active { cursor: grabbing; box-shadow: 0 15px 30px rgba(0,0,0,0.9); }
        .char-name { position: absolute; top: 110%; background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 6px; font-size: 0.7em; white-space: nowrap; pointer-events:none; z-index:115; }
        .marquee-box { position: absolute; border: 1px dashed #ffd700; background: rgba(255,215,0,0.15); pointer-events: none; z-index: 120; display: none; }
        
        .ping-sonar { position: absolute; width: 20px; height: 20px; border: 4px solid #f22; border-radius: 50%; opacity: 1; transform: translate(-50%, -50%) scale(1); pointer-events: none; z-index: 100; animation: sonarAnim 1s ease-out forwards; }
        @keyframes sonarAnim { to { opacity: 0; transform: translate(-50%, -50%) scale(8); } }
        
        /* SISTEMAS AMBIENTAIS ESPECIAIS */
        ${cctvLayerCSS}
        ${fogCSS}
        ${blackoutCanvasCSS}
        
    </style>
</head>
<body>

    <!-- Label flutuante de localização -->
    <div class="location-label">
        <div class="location-name" id="lblLocation">${projectData.name}</div>
        <div class="location-hint">Botão direito → opções</div>
    </div>

    <!-- Menu de Contexto (Botão Direito) -->
    <div class="ctx-menu" id="ctxMenu">
        <div class="ctx-title">⚙ Controles do Mestre</div>
        <div class="ctx-sep"></div>
        <button class="btn-ui btn-back" id="ctxBtnBack" onclick="goBack(); closeCtxMenu();" style="display:none;">← Voltar ao Anterior</button>
        ${projectData.masterButtons.map(b => `<button class="btn-ui" onclick="${b.action.replace(/"/g, "'")}; closeCtxMenu();">${b.tag}</button>`).join('')}
        ${projectData.hasDayNight ? `<button class="btn-ui" onclick="toggleTime(); closeCtxMenu();">🌤️ Dia / Noite</button>` : ''}
        ${projectData.hasFog ? `<button class="btn-ui" onclick="toggleFog(); closeCtxMenu();">☁️ Névoa</button>` : ''}
        ${projectData.hasCctv ? `<button class="btn-ui" onclick="toggleCCTV(); closeCtxMenu();">🎥 CCTV</button>` : ''}
        ${projectData.hasBlackout ? `<button class="btn-ui" onclick="toggleBlackout(); closeCtxMenu();">🔌 Blackout</button>` : ''}
        <div class="ctx-sep"></div>
        <button class="btn-ui" onclick="spawnHero(); closeCtxMenu();" style="color:#55a86d;">➕ Criar Herói</button>
        <div class="ctx-sep"></div>
        <div class="ctx-title" style="opacity:0.4; font-size:0.6em;">📖 DICAS DO SISTEMA</div>
        <div class="ctx-tip">🗑️ <b>Delete</b> — Remove jogador selecionado</div>
        <div class="ctx-tip">📐 <b>Alt + Arrastar</b> — Régua de medição</div>
        <div class="ctx-tip">🔴 <b>Shift + Clique</b> — Ping tático no mapa</div>
        <div class="ctx-tip">🖱️ <b>Scroll</b> sobre token — Rotaciona</div>
        <div class="ctx-tip">↔️ <b>← →</b> com token — Espelha token</div>
    </div>

    <div class="viewport">
        <!-- MATRIZ PRINCIPAL - A LÓGICA ANCORA NELE -->
        <div class="map-anchor" id="mapAnchor">
            <img id="bgImage" src="" alt="Fundo" draggable="false" ondragstart="return false;">
            <div id="hotspotsLayer"></div>
            <div id="charsLayer"></div>
            <div id="marqueeBox" class="marquee-box"></div>
            ${projectData.hasBlackout ? '<canvas id="flashlightCanvas"></canvas>' : ''}
            ${projectData.hasFog ? `
            <div class="fog-layer" id="fogLayer">
                <div class="fog-pulse-layer"></div>
                <div class="fog-veil"></div>
                <div class="fog-overlay"></div>
                <div class="fog-dense-layer"></div>
                <div class="fog-float-layer"></div>
                <div class="fog-ambient-layer"></div>
                <div class="fog-particles"></div>
            </div>` : ''}
            <div id="cctvLayer">
                <div class="cctv-cam">LIVE ON</div>
                <div class="cctv-hud">
                    <div class="cctv-date" id="cctvClock">2026/04/13 00:00:00</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const THEME_LORE = "${projectData.theme === 'custom' ? projectData.customThemeName : projectData.theme}";
        const hierarchy = ${JSON.stringify(hierarchy)};
        const hasDayNight = ${projectData.hasDayNight};
        const hasBlackoutFeature = ${projectData.hasBlackout};
        
        let currentId = '${projectData.sectors[0].id}';
        let isDay = true;
        let isBlackout = false;
        let isCctv = false;
        let cctvInterval = null;
        let navHistory = [];
        
        const ctxMenu = document.getElementById('ctxMenu');

        function openCtxMenu(x, y) {
            ctxMenu.style.left = x + 'px';
            ctxMenu.style.top  = y + 'px';
            ctxMenu.classList.add('open');
            // Ajuste para não sair da tela
            requestAnimationFrame(() => {
                const r = ctxMenu.getBoundingClientRect();
                if (r.right  > window.innerWidth)  ctxMenu.style.left = (x - r.width)  + 'px';
                if (r.bottom > window.innerHeight) ctxMenu.style.top  = (y - r.height) + 'px';
            });
        }

        function closeCtxMenu() { ctxMenu.classList.remove('open'); }

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openCtxMenu(e.clientX, e.clientY);
        });

        document.addEventListener('click', (e) => {
            if (!ctxMenu.contains(e.target)) closeCtxMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCtxMenu();
        });
        
        let charsData = {}; 
        let charID = 0;

        // VIRTUAL TABLETOP (VTT): Seleção e Extras Avançados
        let selectedTokens = new Set();
        let clipBoard = [];
        let isMarquee = false;
        let isMeasuring = false;
        let measureDom = null;
        let startM = {x:0, y:0};

        const anchor = document.getElementById('mapAnchor');
        const marqueeDom = document.getElementById('marqueeBox');
        
        // Pings e Regras (Shift/Alt click) ou Deseleção Global
        window.addEventListener('mousedown', (e) => {
            if(!e.target.closest('.char-token') && !e.shiftKey && !e.altKey && !e.target.closest('.hud-bar')) { 
                selectedTokens.clear(); updateSelectionVisuals(); 
            }
        });

        // Laços do Painel Traseiro
        anchor.addEventListener('mousedown', (e) => {
            if(e.target.closest('.char-token') || e.target.closest('.hotspot-interactive')) return;
            e.preventDefault(); // Impede o navegador de puxar a imagem fantasma ao iniciar Marquee
            
            const rect = anchor.getBoundingClientRect();
            
            if(e.shiftKey) { // Ping Tatico Sonar
                const ping = document.createElement('div');
                ping.className = 'ping-sonar';
                ping.style.left = (e.clientX - rect.left) + 'px';
                ping.style.top = (e.clientY - rect.top) + 'px';
                anchor.appendChild(ping);
                setTimeout(() => ping.remove(), 1000);
                return;
            }

            if(e.altKey) { // Régua de Medição Geométrica
                isMeasuring = true;
                startM = { x: e.clientX - rect.left, y: e.clientY - rect.top };
                if(!measureDom) {
                    measureDom = document.createElement('div');
                    measureDom.id = 'measureRuler';
                    measureDom.innerHTML = \`<svg style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:100; overflow:visible;"><line id="measureLine" x1="0" y1="0" x2="0" y2="0" stroke="#f22" stroke-width="3" stroke-dasharray="5,5"/><text id="measureText" x="0" y="0" fill="#fff" font-size="16" font-weight="bold" font-family="sans-serif" stroke="#000" stroke-width="3" paint-order="stroke"></text></svg>\`;
                    anchor.appendChild(measureDom);
                }
                measureDom.style.display = 'block';
                return;
            }

            isMarquee = true;
            startM = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            marqueeDom.style.left = startM.x + 'px';
            marqueeDom.style.top = startM.y + 'px';
            marqueeDom.style.width = '0px'; marqueeDom.style.height = '0px';
            marqueeDom.style.display = 'block';
        });
        
        window.addEventListener('mousemove', (e) => {
            const rect = anchor.getBoundingClientRect();
            let currX = e.clientX - rect.left;
            let currY = e.clientY - rect.top;
            
            currX = Math.max(0, Math.min(currX, rect.width));
            currY = Math.max(0, Math.min(currY, rect.height));

            if(isMeasuring) {
                const line = document.getElementById('measureLine');
                const txt = document.getElementById('measureText');
                line.setAttribute('x1', startM.x); line.setAttribute('y1', startM.y);
                line.setAttribute('x2', currX); line.setAttribute('y2', currY);
                let distPx = Math.hypot(currX - startM.x, currY - startM.y);
                // Escala de Faz-de-conta: ~50px = 1.5 metros (Padrão Grid RPG)
                let m = (distPx / 50 * 1.5).toFixed(1);
                txt.setAttribute('x', currX + 15); txt.setAttribute('y', currY + 15);
                txt.textContent = \`\${m}m / \${(m * 3.28).toFixed(1)}ft\`;
                return;
            }

            if(isMarquee) {
                let minX = Math.min(startM.x, currX); let maxX = Math.max(startM.x, currX);
                let minY = Math.min(startM.y, currY); let maxY = Math.max(startM.y, currY);
                marqueeDom.style.left = minX + 'px'; marqueeDom.style.top = minY + 'px';
                marqueeDom.style.width = (maxX - minX) + 'px'; marqueeDom.style.height = (maxY - minY) + 'px';
                const arr = charsData[currentId] || [];
                arr.forEach(t => {
                    let px = (t.rx / 100) * rect.width; let py = (t.ry / 100) * rect.height;
                    if(px >= minX && px <= maxX && py >= minY && py <= maxY) {
                        selectedTokens.add(t.id);
                    } else if (!selectedTokens.has(t.id)) { selectedTokens.delete(t.id); }
                });
                updateSelectionVisuals();
            }
        });

        window.addEventListener('mouseup', () => { 
            if(isMeasuring) { isMeasuring = false; if(measureDom) measureDom.style.display='none'; }
            if(isMarquee) { isMarquee = false; marqueeDom.style.display = 'none'; } 
        });

        // Comandos de Teclado
        window.addEventListener('keydown', (e) => {
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const k = e.key.toLowerCase();

            // Mapeamentos Ambientais Gerados
            if ("${projectData.keyDayNight}" && k === "${projectData.keyDayNight}") { if(hasDayNight) toggleTime(); }
            if ("${projectData.keyCctv}" && k === "${projectData.keyCctv}") { if(${projectData.hasCctv}) toggleCCTV(); }
            if ("${projectData.keyFog}" && k === "${projectData.keyFog}") { if(${projectData.hasFog}) toggleFog(); }
            if ("${projectData.keyBlackout}" && k === "${projectData.keyBlackout}") { if(${projectData.hasBlackout}) toggleBlackout(); }
            if ("${projectData.keyTokenLight}" && k === "${projectData.keyTokenLight}") {
                 if (selectedTokens.size > 0) {
                     // Alterna as lanternas dos tokens marcardos e refaz render do mapa
                     selectedTokens.forEach(id => window.toggleTokenLight(id));
                     if(isBlackout && typeof drawFlashlight === 'function') drawFlashlight();
                 }
            }

            // Mapeamentos de Botões Nativos Mestre
            ${projectData.masterButtons.map(b => b.key ? `if (k === "${b.key.toLowerCase()}") { ${b.action}; }` : '').join('\n            ')}

            // Delete (Matar Tokens)
            if((e.key === 'Delete' || e.key === 'Backspace') && selectedTokens.size > 0) {
                charsData[currentId] = charsData[currentId].filter(x => !selectedTokens.has(x.id));
                selectedTokens.clear();
                renderMap(currentId, true);
            }
            // Espelhar token selecionado com ← ou →
            if((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && selectedTokens.size > 0) {
                e.preventDefault();
                if(!charsData[currentId]) return;
                charsData[currentId].forEach(t => {
                    if(selectedTokens.has(t.id)) {
                        t.flipped = !t.flipped;
                        const el = document.querySelector(\`.char-token[data-id="\${t.id}"]\`);
                        if(el) {
                            // Flip apenas no emoji, nao no nome
                            const face = el.querySelector('.token-face');
                            if(face) face.style.transform = t.flipped ? 'scaleX(-1)' : 'scaleX(1)';
                        }
                    }
                });
            }
            // Copiar
            if(e.ctrlKey && e.key.toLowerCase() === 'c') {
                clipBoard = charsData[currentId].filter(t => selectedTokens.has(t.id)).map(t => ({...t}));
            }
            // Colar
            if(e.ctrlKey && e.key.toLowerCase() === 'v') {
                if(clipBoard.length === 0) return;
                selectedTokens.clear();
                clipBoard.forEach(t => {
                    const clone = {...t, id: ++charID, rx: t.rx + 2, ry: t.ry + 2};
                    if(!charsData[currentId]) charsData[currentId] = [];
                    charsData[currentId].push(clone);
                    selectedTokens.add(clone.id);
                });
                renderMap(currentId, true);
            }
        });

        function updateSelectionVisuals() {
            document.querySelectorAll('.char-token').forEach(el => {
                if(selectedTokens.has(parseInt(el.dataset.id))) el.classList.add('selected');
                else el.classList.remove('selected');
            });
        }

        // BLACKOUT CANVAS LOGIC MODERNO (CONES E ROTAÇÃO)
        let fCanvas = document.getElementById('flashlightCanvas');
        let fCtx = fCanvas ? fCanvas.getContext('2d') : null;
        let mouseX = 0, mouseY = 0;

        if (fCanvas) {
            function resizeCanvas() {
                const rect = document.getElementById('mapAnchor').getBoundingClientRect();
                fCanvas.width = rect.width; fCanvas.height = rect.height;
                drawFlashlight();
            }
            window.addEventListener('resize', resizeCanvas);
            document.getElementById('mapAnchor').addEventListener('mousemove', (e) => {
                const rect = fCanvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left; mouseY = e.clientY - rect.top;
                if(isBlackout) drawFlashlight();
            });
            
            function drawFlashlight() {
                if(!fCtx) return;
                const rect = fCanvas.getBoundingClientRect();
                
                fCtx.clearRect(0, 0, fCanvas.width, fCanvas.height);
                fCtx.fillStyle = "rgba(0, 0, 0, 0.98)";
                fCtx.fillRect(0, 0, fCanvas.width, fCanvas.height);
                fCtx.globalCompositeOperation = 'destination-out';
                
                const arr = charsData[currentId] || [];
                const RADIUS = 280; // Cone de Luz Menor
                const CONE_ANGLE = Math.PI / 3; // Feixe fechado de ~60 graus
                
                arr.forEach(c => {
                   if (c.lightOn === false) return; // Verifica se a lanterna do token tá travada desligada
                   
                   let cx = (c.rx / 100) * rect.width;
                   let cy = (c.ry / 100) * rect.height;
                   // Compensação p/ Norte: 0 graus no Canvas é Direita(Leste). Subtrair 90 joga a luz pra "Cima"(Norte) da view.
                   let angleRad = ((c.rot || 0) - 90) * (Math.PI / 180);
                   
                   fCtx.beginPath();
                   fCtx.moveTo(cx, cy);
                   fCtx.arc(cx, cy, RADIUS, angleRad - CONE_ANGLE/2, angleRad + CONE_ANGLE/2);
                   fCtx.lineTo(cx, cy);
                   fCtx.fill();
                });
                
                fCtx.globalCompositeOperation = 'source-over';
                
                // Culling Fotométrico de Hotspots
                const hsDoms = document.querySelectorAll('.hs-marker-viz');
                if(!isBlackout) {
                    hsDoms.forEach(d => { d.style.opacity = '1'; d.style.pointerEvents = 'auto'; });
                    return;
                }
                
                const data = hierarchy[currentId];
                hsDoms.forEach((d, idx) => {
                    let rawPos = data.hotspots[idx].position; 
                    let hx = (parseFloat(rawPos.left) / 100) * rect.width;
                    let hy = (parseFloat(rawPos.top) / 100) * rect.height;
                    
                    let isVisible = false;
                    for(let c of arr) {
                        if (c.lightOn === false) continue;
                        let cx = (c.rx / 100) * rect.width; let cy = (c.ry / 100) * rect.height;
                        if(Math.hypot(hx - cx, cy - hy) <= RADIUS) {
                            let targetAngle = Math.atan2(hy - cy, hx - cx);
                            // Mesma compensação do Norte (CSS) vs Leste (Math)
                            let srcAngle = ((c.rot || 0) - 90) * (Math.PI / 180);
                            let diff = targetAngle - srcAngle;
                            while (diff < -Math.PI) diff += Math.PI * 2;
                            while (diff > Math.PI) diff -= Math.PI * 2;
                            if(Math.abs(diff) <= CONE_ANGLE/2) { isVisible = true; break; }
                        }
                    }
                    d.style.opacity = isVisible ? '1' : '0';
                    d.style.pointerEvents = isVisible ? 'auto' : 'none';
                });
            }
        }

        function toggleBlackout() {
            isBlackout = !isBlackout;
            const cv = document.getElementById('flashlightCanvas');
            if(cv) cv.style.display = isBlackout ? 'block' : 'none';
            renderMap(currentId, true); // Força refresh da imagem base se houver variante fisica!
        }
        
        let isFog = false;
        function toggleFog() {
            isFog = !isFog;
            const fLayer = document.getElementById('fogLayer');
            if(fLayer) {
                if(isFog) fLayer.classList.add('active');
                else fLayer.classList.remove('active');
            }
        }
        
        function updateCctvTicks() {
            const d = new Date();
            document.getElementById('cctvClock').textContent = d.getFullYear() + "/" + 
                    String(d.getMonth() + 1).padStart(2, '0') + "/" + 
                    String(d.getDate()).padStart(2, '0') + " " + 
                    String(d.getHours()).padStart(2, '0') + ":" + 
                    String(d.getMinutes()).padStart(2, '0') + ":" + 
                    String(d.getSeconds()).padStart(2, '0');
        }

        function toggleCCTV() {
            isCctv = !isCctv;
            const lyr = document.getElementById('cctvLayer');
            lyr.style.display = isCctv ? 'block' : 'none';
            
            if(isCctv) {
                updateCctvTicks();
                cctvInterval = setInterval(updateCctvTicks, 1000);
            } else {
                clearInterval(cctvInterval);
            }
        }

        function renderMap(id, fromBack = false) {
            if (!hierarchy[id]) return alert("Setor Inexistente no Banco de Dados!");
            if(!fromBack && currentId !== id) navHistory.push(currentId);
            currentId = id;
            
            const data = hierarchy[id];
            
            // Lógica Avançada de Busca da Imagem física apropriada pelas Regras!
            let targetImage = data.imgBaseName;
            
            if (hasDayNight && !isDay && data.imgNightName) {
                targetImage = data.imgNightName;
            }

            const imgDom = document.getElementById('bgImage');
            imgDom.src = targetImage;
            
            imgDom.onerror = function() {
                console.error("Imagem offline não encontrada:", targetImage);
                imgDom.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%231a0505' width='800' height='450'/%3E%3Ctext y='225' x='400' fill='%23ff5555' font-size='20' text-anchor='middle' font-family='sans-serif'%3EERRO: ARQUIVO '" + targetImage + "' DEVE ESTAR NA PASTA DA HTML!%3C/text%3E%3C/svg%3E";
                imgDom.onerror = null;
                // Ajusta canvas se precisar
                if(isBlackout) setTimeout(resizeCanvas, 50);
            };
            
            imgDom.onload = function() {
                if(isBlackout) resizeCanvas();
            }

            document.getElementById('lblLocation').textContent = data.name;
            document.getElementById('ctxBtnBack').style.display = navHistory.length > 0 ? 'block' : 'none';
            
            const hsLayer = document.getElementById('hotspotsLayer');
            hsLayer.innerHTML = '';
            document.getElementById('charsLayer').innerHTML = ''; 

            data.hotspots.forEach(h => {
                const el = document.createElement('div');
                el.className = 'hs-marker-viz';
                el.setAttribute('data-vis', h.visibility || 'visible');
                el.style.top = h.position.top;
                el.style.left = h.position.left;
                el.title = h.title;
                el.onclick = () => renderMap(h.id);
                hsLayer.appendChild(el);
            });
            
            renderSavedChars();
        }

        function goBack() { if (navHistory.length > 0) renderMap(navHistory.pop(), true); }
        function toggleTime() { isDay = !isDay; renderMap(currentId, true); }

        function spawnHero() {
            const name = prompt("Defina o nome do Herói ou Missão:", "Investigador");
            if (!name) return;
            const emoji = prompt("Símbolo que o representa no tabuleiro (Emoji = 👤):", "👤") || "👤";
            const cInfo = { id: ++charID, name: name, emoji: emoji, rx: 50, ry: 50, rot: 0, lightOn: true };
            if(!charsData[currentId]) charsData[currentId] = [];
            charsData[currentId].push(cInfo);
            selectedTokens.clear();
            selectedTokens.add(cInfo.id);
            drawChar(cInfo);
            updateSelectionVisuals();
            if(isBlackout && typeof drawFlashlight === 'function') drawFlashlight();
        }

        function renderSavedChars() {
            const arr = charsData[currentId] || [];
            arr.forEach(c => drawChar(c));
            updateSelectionVisuals();
            if(isBlackout && typeof drawFlashlight === 'function') drawFlashlight();
        }

        function drawChar(cObj) {
            const anchor = document.getElementById('mapAnchor');
            const layer = document.getElementById('charsLayer');

            const dom = document.createElement('div');
            dom.className = 'char-token';
            dom.dataset.id = cObj.id;
            dom.style.left = cObj.rx + '%';
            dom.style.top = cObj.ry + '%';
            dom.style.transform = \`translate(-50%, -50%) rotate(\${cObj.rot || 0}deg)\`;
            dom.innerHTML = \`<span class="token-face">\${cObj.emoji}</span><div class="char-name">\${cObj.name}</div>\`;
            // Aplicar flip apenas no emoji (nao no container para nao espelhar o nome)
            if(cObj.flipped) dom.querySelector('.token-face').style.transform = 'scaleX(-1)';

            // Scroll Wheel ROTA o personagem
            dom.onwheel = (e) => {
                e.preventDefault();
                cObj.rot = (cObj.rot || 0) + (e.deltaY > 0 ? 15 : -15);
                cObj.rot = cObj.rot % 360;
                // Rotação só no container, flip só no token-face
                dom.style.transform = \`translate(-50%, -50%) rotate(\${cObj.rot}deg)\`;
                if (isBlackout && typeof drawFlashlight === 'function') drawFlashlight();
            };

            dom.ondblclick = (e) => {
                e.stopPropagation();
                const n = prompt("Renomear:", cObj.name);
                if(n) { cObj.name = n.trim(); dom.querySelector('.char-name').innerText = cObj.name; }
            };

            let dragging = false;
            let dragOrigin = {x:0, y:0};
            let initialTokensPos = {};

            dom.onmousedown = (e) => { 
                e.stopPropagation(); 
                e.preventDefault(); 
                if(!selectedTokens.has(cObj.id)) {
                    if(!e.shiftKey) selectedTokens.clear();
                    selectedTokens.add(cObj.id);
                    updateSelectionVisuals();
                }
                dragging = true; 
                dragOrigin = { x: e.clientX, y: e.clientY };
                
                // Salvar as posições cruas de TODOS os selecionados para movimentação em delta
                charsData[currentId].forEach(t => {
                    if(selectedTokens.has(t.id)) { initialTokensPos[t.id] = { rx: t.rx, ry: t.ry }; }
                });
            };

            window.addEventListener('mousemove', (e) => {
                if(!dragging) return;
                const rect = anchor.getBoundingClientRect();
                
                let deltaX = ((e.clientX - dragOrigin.x) / rect.width) * 100;
                let deltaY = ((e.clientY - dragOrigin.y) / rect.height) * 100;

                charsData[currentId].forEach(t => {
                    if(selectedTokens.has(t.id)) {
                        let nx = initialTokensPos[t.id].rx + deltaX;
                        let ny = initialTokensPos[t.id].ry + deltaY;
                        if(nx < 0) nx=0; if(nx > 100) nx=100;
                        if(ny < 0) ny=0; if(ny > 100) ny=100;
                        
                        t.rx = nx; t.ry = ny;
                        const tDom = document.querySelector(\`.char-token[data-id="\${t.id}"]\`);
                        if(tDom) { tDom.style.left = t.rx + '%'; tDom.style.top = t.ry + '%'; }
                    }
                });
                if (isBlackout && typeof drawFlashlight === 'function') drawFlashlight();
            });

            window.addEventListener('mouseup', () => { dragging = false; });

            layer.appendChild(dom);
        }

        window.toggleTokenLight = function(id) {
             const t = charsData[currentId].find(x => x.id === id);
             if(t) {
                 t.lightOn = !(t.lightOn !== false);
                 const tDom = document.querySelector(\`.char-token[data-id="\${id}"]\`);
                 if(tDom) {
                     tDom.style.filter = t.lightOn !== false ? 'none' : 'grayscale(80%) opacity(0.6)';
                 }
                 // O drawFlashlight() será chamado no disparador global do atalho
             }
        }

        window.onload = () => renderMap(currentId);
    <\/script>
</body>
</html>`;
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); }, 3000);
}
