// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let tempoRestante = 0; // em segundos
let tempoTrabalho = 25; // em minutos
let tempoDescanso = 5; // em minutos
let intervalo = null;
let emTrabalho = true;
let minutosCompletos = 0;

// Variáveis para Sobre Nós
let paginaAtual = 1;
const totalPaginas = 3;

// Chave PIX
const chavePix = "e87306f1-8148-422b-a199-b2deb63fa194";


// ============================================
// CONTROLE DE SALDO GLOBAL (usando localStorage)
// ============================================

function obterSaldo() {
    const saldo = localStorage.getItem('saldoPontos');
    // Se não existir, inicializa com 0
    if (saldo === null || saldo === undefined) {
        localStorage.setItem('saldoPontos', '0');
        return 0;
    }
    return parseInt(saldo) || 0;
}

function salvarSaldo(novoSaldo) {
    localStorage.setItem('saldoPontos', novoSaldo.toString());
    atualizarSaldoNaTela();
}

function atualizarSaldoNaTela() {
    const saldoAtual = obterSaldo();

    // Atualiza elementos de saldo em diferentes páginas
    const saldoElement = document.getElementById('saldo');
    const saldoIndex = document.querySelector('.saldo span');
    
    if (saldoElement) {
        saldoElement.textContent = `${saldoAtual} pontos`;
    }
    if (saldoIndex) {
        saldoIndex.textContent = `${saldoAtual} pontos`;
    }
}

// ============================================
// FUNÇÕES DO POMODORO
// ============================================

/**
 * Inicia um ciclo Pomodoro com tempo de trabalho e descanso especificados
 */
function iniciarPomodoro(trabalho, descanso) {
    tempoTrabalho = trabalho;
    tempoDescanso = descanso;
    tempoRestante = trabalho * 60;
    emTrabalho = true;
    minutosCompletos = 0;

    const selectionPage = document.getElementById('selectionPage');
    const timerPage = document.getElementById('timerPage');
    
    if (selectionPage) selectionPage.classList.add('hidden');
    if (timerPage) timerPage.classList.add('active');
    
    atualizarDisplay();
    atualizarStatus();
    atualizarSaldoNaTela();
    iniciarTimer();
}

/**
 * Inicia/retoma o timer do Pomodoro
 */
function iniciarTimer() {
    if (intervalo) return; // Já está rodando

    const pauseButton = document.getElementById('pauseButton');
    const playButton = document.getElementById('playButton');
    
    if (pauseButton) pauseButton.style.display = 'flex';
    if (playButton) playButton.style.display = 'none';

    intervalo = setInterval(() => {
        tempoRestante--;

        if (tempoRestante <= 0) {
            finalizarCiclo();
            return;
        }

        // A cada minuto completo, adiciona 10 pontos (só durante trabalho)
        if (emTrabalho && tempoRestante % 60 === 0) {
            adicionarPontos();
        }

        atualizarDisplay();
    }, 1000);
}

/**
 * Pausa o timer do Pomodoro
 */
function pausarTimer() {
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
    }

    const pauseButton = document.getElementById('pauseButton');
    const playButton = document.getElementById('playButton');
    
    if (pauseButton) pauseButton.style.display = 'none';
    if (playButton) playButton.style.display = 'flex';
}

/**
 * Adiciona pontos ao saldo ao completar um minuto de trabalho
 */
function adicionarPontos() {
    const saldoAtual = obterSaldo();
    const novoSaldo = saldoAtual + 10;
    salvarSaldo(novoSaldo);

    const pointsDiv = document.getElementById('pointsEarned');
    if (pointsDiv) {
        pointsDiv.style.display = 'block';
        pointsDiv.textContent = `+10 pontos ganhos! Total: ${novoSaldo} pontos 🎉`;
        setTimeout(() => { pointsDiv.style.display = 'none'; }, 3000);
    }
}

/**
 * Finaliza um ciclo e alterna entre trabalho e descanso
 */
function finalizarCiclo() {
    clearInterval(intervalo);
    intervalo = null;

    if (emTrabalho) {
        // Muda para descanso
        emTrabalho = false;
        tempoRestante = tempoDescanso * 60;
        atualizarStatus();
        iniciarTimer();
    } else {
        // Muda para trabalho
        emTrabalho = true;
        tempoRestante = tempoTrabalho * 60;
        atualizarStatus();
        iniciarTimer();
    }
}

/**
 * Atualiza o display do timer na tela
 */
function atualizarDisplay() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    const timerDisplay = document.getElementById('timerDisplay');
    
    if (timerDisplay) {
        timerDisplay.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;
    }
}

/**
 * Atualiza o status do timer (trabalho ou descanso)
 */
function atualizarStatus() {
    const status = document.getElementById('timerStatus');
    if (status) {
        if (emTrabalho) {
            status.textContent = `${tempoTrabalho} min de Trabalho...`;
        } else {
            status.textContent = `${tempoDescanso} min de Descanso...`;
        }
    }
}

/**
 * Volta para a página de seleção de timer
 */
function voltarSelecao() {
    if (confirm('Deseja realmente sair? O progresso será perdido.')) {
        if (intervalo) {
            clearInterval(intervalo);
            intervalo = null;
        }
        
        const timerPage = document.getElementById('timerPage');
        const selectionPage = document.getElementById('selectionPage');
        
        if (timerPage) timerPage.classList.remove('active');
        if (selectionPage) selectionPage.classList.remove('hidden');
        
        // Atualiza o saldo antes de voltar
        atualizarSaldoNaTela();
    }
}

// ============================================
// FUNÇÕES DE RECOMPENSAS
// ============================================

/**
 * Cadastra uma nova recompensa
 */
function cadastrarRecompensa(button) {
    const card = button.closest('.recompensa-card');
    const inputTexto = card.querySelector('.recompensa-input');
    const inputValor = card.querySelector('.valor-input');

    const texto = inputTexto.value.trim();
    const valor = parseInt(inputValor.value);

    if (!texto) {
        alert('Por favor, digite o nome da recompensa!');
        inputTexto.focus();
        return;
    }

    if (!valor || valor <= 0) {
        alert('Por favor, digite um valor válido para a recompensa!');
        inputValor.focus();
        return;
    }

    // Transforma em recompensa criada
    card.classList.remove('empty-slot');
    card.setAttribute('data-status', 'criada');
    card.setAttribute('data-valor', valor);

    // Adiciona botão de excluir
    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-button delete-button';
    deleteButton.onclick = function () { excluirRecompensa(this); };
    deleteButton.innerHTML = `
        <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    card.insertBefore(deleteButton, card.firstChild);

    // Atualiza o conteúdo
    const content = card.querySelector('.recompensa-content');
    content.innerHTML = `
        <span class="recompensa-text">${texto}</span>
        <span class="valor-badge">${valor}</span>
    `;

    // Atualiza o botão para compra
    button.className = 'action-button buy-button';
    button.onclick = function () { comprarRecompensa(this); };
    button.innerHTML = `
        <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

    alert('Recompensa cadastrada com sucesso! 🎉');
}

/**
 * Compra/resgata uma recompensa
 */
function comprarRecompensa(button) {
    const card = button.closest('.recompensa-card');
    const valor = parseInt(card.getAttribute('data-valor'));
    const nomeRecompensa = card.querySelector('.recompensa-text').textContent;
    const saldoAtual = obterSaldo();

    if (saldoAtual < valor) {
        alert(`Saldo insuficiente! Você precisa de ${valor} pontos, mas tem apenas ${saldoAtual} pontos.`);
        return;
    }

    if (confirm(`Deseja resgatar "${nomeRecompensa}" por ${valor} pontos?`)) {
        const novoSaldo = saldoAtual - valor;
        salvarSaldo(novoSaldo);

        // Animação de remoção
        card.classList.add('removing');

        setTimeout(() => {
            // Remove o botão de excluir se existir
            const deleteBtn = card.querySelector('.delete-button');
            if (deleteBtn) {
                deleteBtn.remove();
            }

            // Transforma em slot vazio
            card.classList.remove('removing');
            card.classList.add('empty-slot');
            card.setAttribute('data-status', 'vazia');
            card.removeAttribute('data-valor');

            // Restaura inputs
            const content = card.querySelector('.recompensa-content');
            content.innerHTML = `
                <input type="text" class="recompensa-input" placeholder="Nova Recompensa" maxlength="30">
                <input type="number" class="valor-input" placeholder="0" min="1" max="999">
            `;

            // Restaura botão de cadastro
            button.className = 'action-button check-button';
            button.onclick = function () { cadastrarRecompensa(this); };
            button.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            `;

            alert(`Recompensa "${nomeRecompensa}" resgatada! 🎉`);
        }, 300);
    }
}

/**
 * Exclui uma recompensa cadastrada
 */
function excluirRecompensa(button) {
    const card = button.closest('.recompensa-card');
    const nomeRecompensa = card.querySelector('.recompensa-text').textContent;

    if (confirm(`Deseja realmente excluir a recompensa "${nomeRecompensa}"?`)) {
        // Animação de remoção
        card.classList.add('removing');

        setTimeout(() => {
            // Remove o botão de excluir
            const deleteBtn = card.querySelector('.delete-button');
            if (deleteBtn) {
                deleteBtn.remove();
            }

            // Transforma em slot vazio
            card.classList.remove('removing');
            card.classList.add('empty-slot');
            card.setAttribute('data-status', 'vazia');
            card.removeAttribute('data-valor');

            // Restaura inputs
            const content = card.querySelector('.recompensa-content');
            content.innerHTML = `
                <input type="text" class="recompensa-input" placeholder="Nova Recompensa" maxlength="30">
                <input type="number" class="valor-input" placeholder="0" min="1" max="999">
            `;

            // Restaura botão de cadastro
            const actionButton = card.querySelector('.action-button');
            actionButton.className = 'action-button check-button';
            actionButton.onclick = function () { cadastrarRecompensa(this); };
            actionButton.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            `;

            alert('Recompensa excluída com sucesso!');
        }, 300);
    }
}

// ============================================
// FUNÇÕES DA PÁGINA SOBRE NÓS
// ============================================

/**
 * Atualiza a página ativa no carrossel de informações
 */
function atualizarPagina() {
    // Esconde todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Mostra a página atual
    const currentPage = document.getElementById(`page${paginaAtual}`);
    if (currentPage) {
        currentPage.classList.add('active');
    }

    // Atualiza indicador
    const pageIndicator = document.getElementById('pageIndicator');
    if (pageIndicator) {
        pageIndicator.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    }

    // Atualiza botões de navegação
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    if (prevButton) prevButton.disabled = paginaAtual === 1;
    if (nextButton) nextButton.disabled = paginaAtual === totalPaginas;
}

/**
 * Muda para próxima ou anterior página
 */
function mudarPagina(direcao) {
    paginaAtual += direcao;
    
    if (paginaAtual < 1) paginaAtual = 1;
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    
    atualizarPagina();
}

// ============================================
// FUNÇÕES DA PÁGINA APOIE (PIX)
// ============================================

/**
 * Copia a chave PIX para a área de transferência
 */
function copiarPix() {
    // Tenta usar a API moderna de clipboard
    navigator.clipboard.writeText(chavePix).then(() => {
        mostrarToast();
    }).catch(err => {
        // Fallback para navegadores mais antigos
        const textarea = document.createElement('textarea');
        textarea.value = chavePix;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        mostrarToast();
    });
}

/**
 * Mostra notificação toast de sucesso
 */
function mostrarToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
}

/**
 * Abre link para assistir anúncio
 */
function assistirAD() {
    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
}

// ============================================
// FUNÇÕES GERAIS
// ============================================

/**
 * Função de sair da aplicação
 */
function sair() {
    if (confirm('Deseja realmente retornar ao Menu?')) {
        window.location.href = 'index.html';
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa a página quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa o saldo se não existir
    obterSaldo();
    
    // Atualiza o saldo em todas as páginas
    atualizarSaldoNaTela();

    // Inicializa a página Sobre Nós se estiver nela
    if (document.getElementById('page1')) {
        atualizarPagina();
    }
});