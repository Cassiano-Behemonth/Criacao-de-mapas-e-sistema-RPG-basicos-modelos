# ⚒️ The RPG Forge v3.1 (Professional)

**Acesse o sistema online aqui:** 🚀 [The RPG Forge - Web Builder](https://cassiano-behemonth.github.io/Criacao-de-mapas-e-sistema-RPG-basicos-modelos/)

O **The RPG Forge** é um construtor de mapas e sistema de VTT (Virtual Tabletop) minimalista para mestres de RPG que buscam imersão tecnológica e agilidade. Ele permite criar mapas interativos com sistemas ambientais complexos e exportá-los como um arquivo HTML único, auto-suficiente e funcional.

---

## 🚀 Como Usar o Builder (Passo a Passo)

### 1. Identidade Visual
*   **Nome do Projeto**: Dê um título ao seu mapa (passo obrigatório para navegação livre).
*   **Moldes (Temas Estéticos)**: Escolha a estética base (Sobrevivência/Bunker, Faroeste/Deserto, Investigação Mística, Alta Fantasia/Medieval, Cyberpunk/Neon, Mistério Noir/Detetive, Survival Horror/Apocalipse ou Personalizado).
*   **Fontes Dinâmicas**: Cada tema carrega uma fonte temática do Google Fonts no VTT exportado (ex: `Orbitron` para Cyberpunk, `Cinzel` para Fantasia, `Special Elite` para Mistério).

### 2. Regras Ambientais & HUD
Nesta etapa, você define a "alma" mecânica do seu mapa:
*   **Ciclo Temporal (Dia/Noite)**: Exige duas imagens por setor (uma clara e uma escura).
*   **Falta de Força (Blackout)**: Ativa um sistema de lanternas dinâmicas nos tokens com atalhos separados para o apagão geral e a lanterna do jogador.
*   **Sistema CCTV**: Adiciona um filtro de câmeras de segurança e HUD de gravação.
*   **Névoa Mística**: Adiciona partículas de neblina animadas sobre o mapa.
*   **Opções de Localização (HUD)**: Escolha se deseja exibir o nome do mapa na tela do jogo e em qual canto posicioná-lo (Inferior Esquerdo, Inferior Direito, Superior Esquerdo, Superior Direito ou Central Inferior).
*   **Botões de HUD**: Crie botões personalizados para disparar eventos de JavaScript (ex: `toggleTime()`, `toggleBlackout()`, `playSoundEffect('sndLanterna')`, `toggleJumpscare('vulto.webm', 'fundo_dominic.png', 'sndVulto')`).

### 3. Galeria de Andares (Setores)
*   Crie os cômodos ou níveis do seu mapa (ID Único como `andar_1` ou `cozinha`).
*   **Upload de Imagens**: Para cada setor, envie as versões base (Dia/Luz) e Noite (caso Dia/Noite esteja ativo).
*   **Aspect Ratio Recomendado**: Recomendamos o uso de imagens widescreen no formato **16:9** (como 1920x1080) ou **16:10** (notebooks modernos - 1920x1200) para cobrir perfeitamente a tela. Também há suporte para 4:3 (quadrado) e 21:9 (ultrawide).

### 4. Mapeamento Tático (Hotspots)
*   **Navegação**: Selecione o setor ativo no menu superior, clique em qualquer lugar da imagem para criar um "Hotspot" de teletransporte.
*   **Vínculos**: Conecte um ponto do mapa a outro setor (ex: clicar na porta da Recepção (`andar_1`) leva o jogador para a Cozinha (`andar_2`)).
*   **Visibilidade**: 
    - *Brilhantes*: Evidentes e com brilho de neon.
    - *Invisíveis*: Totalmente ocultos (para passagens secretas).
    - *Camuflados (Semi-Invisíveis)*: Aplicam um efeito de desfoque sutil no fundo (`backdrop-filter: blur(1.5px)`) e borda extremamente translúcida, destacando-se levemente (`blur(6px)`) apenas quando o mouse passa por cima.

### 5. Laboratório de IA
*   O sistema gera prompts estruturados para você copiar e usar em assistentes de IA (como Claude 3.5 Sonnet, ChatGPT-4o ou Gemini 1.5 Pro) para criar Puzzles de cofres, Jumpscares, Efeitos Sonoros e caixas de diálogos clássicas de NPCs.
*   **IDE recomendadas**: Desenvolva utilizando o **Antigravity IDE** (Pair-Programming Agentic da DeepMind), **Cursor IDE** (com suporte IA no `Ctrl+K`) ou **VS Code** (usando a extensão *Live Server* para atualizações automáticas ao salvar).

### 6. Exportar
*   Gera um arquivo `.html` único. Salve-o em uma pasta no seu computador e coloque todas as imagens utilizadas na mesma pasta do arquivo exportado.

---

## 🎮 Controles do Mapa Exportado (VTT)

Uma vez exportado, o mestre e os jogadores utilizam os seguintes comandos:

### 🖱️ Mouse e Interação
*   **Botão Direito**: Abre o **Menu do Mestre** para trocar o clima, criar personagens heróis ou usar botões customizados.
*   **Arrastar Token**: Move o personagem pelo mapa.
*   **Scroll (Roda do Mouse)**: Rotaciona o token selecionado (útil para direcionar a lanterna no modo Blackout) ou o monstro no mapa.
*   **Duplo Clique no Token**: Renomeia o personagem.

### ⌨️ Atalhos de Teclado
*   **Teclas Ambientais**: (Conforme configurado no Passo 2, ex: `T` para Noite, `C` para CCTV, `G` para Névoa).
*   **Delete / Backspace**: Remove o(s) token(s) selecionado(s) ou mata o monstro focado.
*   **Ctrl+C / Ctrl+V**: Copia e cola tokens.
*   **Setas Esquerda/Direita**: Espelha (flip) a imagem do token ou monstro.
*   **Alt + Arrastar**: Ativa a **Régua de Medição** tática (em metros e pés).
*   **Shift + Clique**: Dispara um **Ping (Sonar)** vermelho para chamar atenção na área.

### 🔦 Sistema de Lanterna (Blackout)
*   No modo Blackout, a tela fica escura.
*   Cada token possui uma lanterna própria que ilumina um cone em 60° (se a lanterna estiver ligada).
*   Aponte o token usando a roda do mouse para revelar Hotspots escondidos e inimigos.

---

## 🛠️ Requisitos Técnicos
*   **Navegador**: Recomendado o uso de navegadores modernos (Chrome, Edge, Opera GX, Safari).
*   **Arquivos**: O arquivo HTML exportado **não armazena as imagens internamente** (mantendo o arquivo ultra-leve). Você deve manter as imagens originais na mesma pasta do arquivo exportado para que elas apareçam.

---
*Forjado com ⚡ no The RPG Forge.*
