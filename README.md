# ⚒️ The RPG Forge v3

O **The RPG Forge** é um construtor de mapas e sistema de VTT (Virtual Tabletop) minimalista para mestres de RPG que buscam imersão tecnológica e agilidade. Ele permite criar mapas interativos com sistemas ambientais complexos e exportá-los como um arquivo HTML único e funcional.

---

## 🚀 Como Usar o Builder (Passo a Passo)

### 1. Identidade Visual
*   **Nome do Projeto**: Dê um título ao seu mapa.
*   **Moldes (Temas)**: Escolha a estética base (Sobrevivência, Faroeste, Mistério ou Personalizado). Isso altera as cores e o "clima" da interface final.

### 2. Regras Ambientais & HUD
Nesta etapa, você define a "alma" mecânica do seu mapa:
*   **Ciclo Temporal (Dia/Noite)**: Exige duas imagens por setor (uma clara e uma escura).
*   **Falta de Força (Blackout)**: Ativa um sistema de lanternas dinâmicas que seguem o mouse dos jogadores.
*   **Sistema CCTV**: Adiciona um filtro de câmeras de segurança e HUD de gravação.
*   **Névoa Mística**: Adiciona partículas de neblina animadas sobre o mapa.
*   **Botões de HUD**: Crie botões personalizados para disparar eventos de Javascript (ex: tocar sons, abrir modais).

### 3. Galeria de Andares (Setores)
*   Crie os cômodos ou níveis do seu mapa.
*   **Upload de Imagens**: Para cada setor, suba as versões conforme as regras ativadas (ex: se ativou Dia/Noite, suba a versão `_dia` e a versão `_noite`).
*   **Importante**: O builder usa os nomes dos arquivos. No export final, as imagens físicas devem estar na mesma pasta do arquivo HTML.

### 4. Mapeamento Tático (Hotspots)
*   **Navegação**: Clique em qualquer lugar da imagem para criar um "Hotspot".
*   **Vínculos**: Conecte um ponto do mapa a outro setor (ex: clicar na porta da Sala A leva o jogador para a Sala B).
*   **Visibilidade**: Escolha entre pontos Brilhantes (evidentes), Camuflados ou Invisíveis (para segredos).

### 5. Laboratório de IA
*   O sistema gera prompts prontos para você copiar e usar em assistentes de IA (como ChatGPT ou Claude) para criar Puzzles, Diálogos de NPCs ou Terminais de Senha que se encaixam perfeitamente no tema escolhido.

### 6. Exportar
*   Gera um arquivo `.html` único. Salve-o em uma pasta e coloque todas as imagens que você usou no mesmo local.

---

## 🎮 Controles do Mapa Exportado (VTT)

Uma vez exportado, o mestre e os jogadores utilizam os seguintes comandos:

### 🖱️ Mouse e Interação
*   **Botão Direito**: Abre o **Menu do Mestre** para trocar o clima, criar personagens ou usar botões customizados.
*   **Arrastar Token**: Move o personagem pelo mapa.
*   **Scroll (Roda do Mouse)**: Rotaciona o token selecionado (útil para direcionar a lanterna no modo Blackout).
*   **Duplo Clique no Token**: Renomeia o personagem.

### ⌨️ Atalhos de Teclado
*   **Teclas Ambientais**: (Conforme configurado no Passo 2, ex: `N` para Noite, `C` para CCTV).
*   **Delete / Backspace**: Remove o(s) token(s) selecionado(s).
*   **Ctrl+C / Ctrl+V**: Copia e cola tokens.
*   **Setas Esquerda/Direita**: Espelha (flip) a imagem do token.
*   **Alt + Arrastar**: Ativa a **Régua de Medição** tática (em metros e pés).
*   **Shift + Clique**: Dispara um **Ping (Sonar)** vermelho para chamar atenção na área.

### 🔦 Sistema de Lanterna (Blackout)
*   No modo Blackout, a tela fica escura.
*   Cada token possui uma lanterna própria que ilumina um cone em 60°.
*   Aponte o token usando a roda do mouse para revelar Hotspots escondidos e inimigos.

---

## 🛠️ Requisitos Técnicos
*   **Navegador**: Recomendado o uso de navegadores modernos (Chrome, Edge, Opera GX).
*   **Arquivos**: O arquivo HTML exportado **não armazena as imagens internamente**. Você deve manter as imagens originais na mesma pasta do arquivo exportado para que elas apareçam.

---
*Forjado com ⚡ no The RPG Forge.*
