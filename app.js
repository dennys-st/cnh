// ==========================================
// MOTO GUIA - CNH PREP ENGINE
// ==========================================

// --- State Management ---
const state = {
    score: 0,
    streak: 0,
    maxScore: 100 // Estimate for progress bar
};

// --- Notifications & UI Updates ---
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ri-information-fill';
    if(type === 'success') icon = 'ri-checkbox-circle-fill';
    if(type === 'error') icon = 'ri-close-circle-fill';
    if(type === 'warning') icon = 'ri-error-warning-fill';

    toast.innerHTML = `<i class="${icon}"></i> ${msg}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function updateScore(points) {
    if (points > 0) {
        state.streak++;
        const multiplier = state.streak >= 3 ? 2 : 1; // Combo 2x
        const totalPoints = points * multiplier;
        state.score += totalPoints;
        
        let msg = `+${totalPoints} pts!`;
        if (multiplier > 1) msg += ` (Combo x${state.streak})`;
        showToast(msg, 'success');
        
        if(state.streak >= 3) {
            document.getElementById('streakBadge').classList.remove('hidden');
            document.getElementById('streakValue').innerText = `x${state.streak}`;
        }
    } else {
        state.streak = 0;
        state.score += points; // points is negative
        showToast(`${points} pts`, 'error');
        document.getElementById('streakBadge').classList.add('hidden');
    }

    // Prevent negative score visually if preferred, but let's keep it raw
    document.getElementById('scoreValue').innerText = state.score;
    updateLevel();
    updateProgressBar();
}

function updateLevel() {
    const levelEl = document.getElementById('userLevel');
    if (state.score < 0) {
        levelEl.innerHTML = `<i class="ri-alert-fill" style="color:var(--danger)"></i> Risco Multa`;
    } else if (state.score < 30) {
        levelEl.innerHTML = `<i class="ri-user-star-fill"></i> Iniciante`;
    } else if (state.score < 70) {
        levelEl.innerHTML = `<i class="ri-steering-fill" style="color:var(--warning)"></i> Condutor`;
    } else {
        levelEl.innerHTML = `<i class="ri-medal-fill" style="color:var(--success)"></i> Especialista`;
    }
}

function updateProgressBar() {
    const progress = Math.min(Math.max((state.score / state.maxScore) * 100, 0), 100);
    document.getElementById('overall-progress').style.width = `${progress}%`;
}

// --- Navigation ---
function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    const backBtn = document.getElementById('backToHome');
    if (viewId === 'view-home') backBtn.classList.add('hidden');
    else backBtn.classList.remove('hidden');
}

function showHome() { showView('view-home'); }

// --- Helpers ---
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// ==========================================
// MODULE 1: CHECKLIST (A Missão Prática)
// ==========================================
const missionSteps = [
    {
        title: "Fase 1: Preparando o Rolê",
        checks: [
            "Pneu calibrado e freio testado (CTB Art. 230 - segurança em primeiro lugar).",
            "Capacete na cabeça e viseira 100% abaixada (Viseira levantada dá multa média, bicho).",
            "Manter 2 segundos de distância do carro da frente na rodovia."
        ]
    },
    {
        title: "Fase 2: Chegando em Cruz",
        checks: [
            "Passou o pórtico? Reduz pra 40km/h na hora. Sem choro.",
            "Dois dedos sempre na embreagem e no freio pra evitar perrengue.",
            "Fica ligado em porta de carro abrindo do nada nas ruas do centro."
        ]
    },
    {
        title: "Fase 3: A Praça e a Cofel",
        checks: [
            "Respeita a faixa de pedestre. Não parar é infração gravíssima (7 pontos).",
            "Parar a motoca alinhada certinho na vaga pra não tomar multa leve.",
            "Travar o guidão e botar a chave no bolso pra não dar B.O."
        ]
    }
];

function startJourney() {
    const container = document.getElementById('checklist-container');
    container.innerHTML = '';
    
    missionSteps.forEach((step, stepIndex) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'check-step';
        
        const h3 = document.createElement('h3');
        h3.innerText = step.title;
        stepDiv.appendChild(h3);

        step.checks.forEach((checkText, i) => {
            const id = `check_${stepIndex}_${i}`;
            const item = document.createElement('label');
            item.className = 'check-item';
            
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = id;
            cb.onchange = () => handleCheck(cb);

            const span = document.createElement('span');
            span.innerText = checkText;

            item.appendChild(cb);
            item.appendChild(span);
            stepDiv.appendChild(item);
        });
        
        container.appendChild(stepDiv);
    });
}

function handleCheck(checkbox) {
    if (checkbox.checked) updateScore(1);
    else updateScore(-1); // Penalty for unchecking
}

// ==========================================
// MODULE 2: SINALIZAÇÕES (Modals)
// ==========================================
const signDetails = {
    pare: {
        title: "Placa PARE (R-1)",
        desc: "Mano, imobilização TOTAL da moto. Rolar devagarinho é infração gravíssima (Art. 208 do CTB). Cruzamento é onde a galera mais dá PT."
    },
    maodupla: {
        title: "Mão Dupla Adiante (A-25)",
        desc: "Fica esperto que vem carro de frente nas ruas apertadas. Fica de boa na tua mão direita e não corta caminho na contramão (multa grave)."
    },
    estacionamento: {
        title: "Estacionamento (R-6b)",
        desc: "Tem as vagas demarcadas na praça. Não larga a moto de qualquer jeito senão é infração média (Art. 181). Procura alinhar o pneu com a calçada."
    },
    pedestre: {
        title: "Faixa de Pedestre",
        desc: "Pisou na faixa, tu tem que parar. A moral é toda deles. Avançar é infração gravíssima com multa cabulosa."
    }
};

function showSignDetail(id) {
    const s = signDetails[id];
    document.getElementById('modal-title').innerText = s.title;
    document.getElementById('modal-body').innerText = s.desc;
    document.getElementById('sys-modal').classList.remove('hidden');
    updateScore(1);
}
function closeModal() { document.getElementById('sys-modal').classList.add('hidden'); }

// ==========================================
// MODULE 3: FLASHCARDS (Certo ou Caô)
// ==========================================
const flashDataRaw = [
    { s: "Posso dar aquele grau maroto lá na praça pra tirar onda?", true: false, f: "É CAÔ! Manobra perigosa gera suspensão da CNH e multa altíssima (CTB Art. 175). Fora a chance de dar PT." },
    { s: "Preciso ficar de olho no retrovisor toda hora?", true: true, f: "POD CRÊ! Direção defensiva básica, bicho. Tem que saber o que tá rolando atrás e nos pontos cegos." },
    { s: "Andar colado no carro da frente é esquema pra cortar o vento.", true: false, f: "É CAÔ! Se o cara frear, tu não tem tempo de parar e dá ruim. Mantém a distância de seguimento." },
    { s: "Capacete levantado pra bater um vento no rosto tá liberado no calor.", true: false, f: "É CAÔ! Viseira totalmente abaixada ou com óculos de proteção. Pilotar com ela aberta é infração média." },
    { s: "Em cruzamento sem placa, quem vem da direita tem a preferência.", true: true, f: "POD CRÊ! Regra universal do CTB. Se não tem placa, a moral é de quem vem pela direita do cruzamento." },
    { s: "Ultrapassar pela direita é de boa se o cara da frente tiver lento.", true: false, f: "É CAÔ! Ultrapassagem é SEMPRE pela esquerda. A única exceção é se o cara for entrar à esquerda." },
    { s: "A seta é a voz da moto, tem que usar pra avisar a galera.", true: true, f: "POD CRÊ! Ninguém lê mente não. Bate a seta pra avisar a rapaziada e evitar colisão." }
];

let flashDeck = [];
let currentFlashIndex = 0;
let isFlashcardAnswered = false;

function initFlashcards() {
    flashDeck = shuffle([...flashDataRaw]);
    currentFlashIndex = 0;
    loadFlashUI();
}

function loadFlashUI() {
    if (currentFlashIndex >= flashDeck.length) {
        document.getElementById('flashcard-statement').innerText = "Simulado Finalizado! 100% Auditado.";
        document.getElementById('flashcard-actions').classList.add('hidden');
        return;
    }
    
    isFlashcardAnswered = false;
    const card = document.getElementById('active-flashcard');
    card.classList.remove('flipped', 'correct-card', 'wrong-card');
    
    document.getElementById('flashcard-actions').classList.remove('hidden');
    document.getElementById('flashcard-statement').innerText = flashDeck[currentFlashIndex].s;
}

function answerFlashcard(userGuessedTrue) {
    if (isFlashcardAnswered) return;
    isFlashcardAnswered = true;
    
    const cardData = flashDeck[currentFlashIndex];
    const isCorrect = userGuessedTrue === cardData.true;
    
    const card = document.getElementById('active-flashcard');
    const resultIcon = document.getElementById('flashcard-icon-result');
    
    document.getElementById('flashcard-feedback').innerText = cardData.f;
    
    if (isCorrect) {
        card.classList.add('correct-card');
        resultIcon.className = 'result-icon correct ri-checkbox-circle-fill';
        updateScore(3);
    } else {
        card.classList.add('wrong-card');
        resultIcon.className = 'result-icon wrong ri-close-circle-fill';
        updateScore(-2);
    }
    
    card.classList.add('flipped');
    document.getElementById('flashcard-actions').classList.add('hidden');
}

function nextFlashcard() {
    currentFlashIndex++;
    loadFlashUI();
}

// ==========================================
// MODULE 4: MATCH GAME (Se Ligar)
// ==========================================
const matchQs = [
    { id: 'mq1', text: 'Passar voado na placa de PARE' },
    { id: 'mq2', text: 'Andar a milhão no corredor' },
    { id: 'mq3', text: 'Pilotar de chinelão' },
    { id: 'mq4', text: 'Avançar faixa de pedestre' },
    { id: 'mq5', text: 'Viseira aberta' }
];

const matchAs = [
    { id: 'ma1', text: 'Gravíssima (Aviso: Risco de Bater)', match: 'mq1' },
    { id: 'ma2', text: 'Perigo de portazada sinistra', match: 'mq2' },
    { id: 'ma3', text: 'Multa Média (Falta de firmeza)', match: 'mq3' },
    { id: 'ma4', text: 'Gravíssima (7 pontos, mano)', match: 'mq4' },
    { id: 'ma5', text: 'Multa Média na CNH', match: 'mq5' }
];

let selectedQ = null;

function initMatchGame() {
    const qCont = document.getElementById('match-questions');
    const aCont = document.getElementById('match-answers');
    qCont.innerHTML = ''; aCont.innerHTML = '';
    
    const sq = shuffle([...matchQs]);
    const sa = shuffle([...matchAs]);

    sq.forEach(q => {
        const btn = document.createElement('button');
        btn.className = 'match-item question';
        btn.innerText = q.text;
        btn.onclick = () => selectQ(btn, q.id);
        qCont.appendChild(btn);
    });

    sa.forEach(a => {
        const btn = document.createElement('button');
        btn.className = 'match-item answer';
        btn.innerText = a.text;
        btn.onclick = () => selectA(btn, a.id, a.match);
        aCont.appendChild(btn);
    });
}

function selectQ(el, id) {
    if(el.classList.contains('matched')) return;
    document.querySelectorAll('.match-item.question').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedQ = { el, id };
}

function selectA(el, id, matchId) {
    if(el.classList.contains('matched') || !selectedQ) return;
    
    if(selectedQ.id === matchId) {
        el.classList.add('matched');
        selectedQ.el.classList.add('matched');
        selectedQ.el.classList.remove('selected');
        selectedQ = null;
        updateScore(4); // Harder game = more points
        showToast("É isso aí, mermão!", "success");
    } else {
        updateScore(-2);
        showToast("Viajou legal, tenta de novo!", "error");
    }
}

// ==========================================
// MODULE 5: QUIZ (Simulado Maneiro)
// ==========================================
const quizDb = [
    { tag: "Direção Defensiva", q: "Começou a chover forte no trajeto pra Cruz. Qual a boa?", opts: ["Acelerar pra não se molhar muito e chegar logo", "Reduzir a velocidade, dobrar a distância do carro da frente e ir na moral", "Ligar o pisca alerta e parar no meio da pista"], c: 1 },
    { tag: "Legislação Básica", q: "Transitar com a moto sobre calçadas ou praças é infração?", opts: ["Não, se for rapidinho pra cortar caminho", "Sim, infração média", "Sim, infração gravíssima (multiplicada por 3, prejuízo certo)"], c: 2 },
    { tag: "Sobrevivência", q: "Ao chegar nos cruzamentos sem visão do centro de Cruz das Almas:", opts: ["Buzina sem parar e vai com tudo", "Breca, cobre o freio, olha bem e só passa quando tiver certeza", "Fecha o olho e confia que a preferência é tua"], c: 1 },
    { tag: "Direção Defensiva", q: "Ponto cego é:", opts: ["Quando a viseira fica embaçada", "A área do lado do carro/caminhão que o retrovisor deles não pega", "Quando o sol bate na cara do piloto"], c: 1 },
    { tag: "Equipamento", q: "O que o CTB fala sobre o calçado para pilotar?", opts: ["Pode ir de havaianas de boa", "Tem que ser bota de couro", "Precisa ser calçado que se firme nos pés e não comprometa os pedais"], c: 2 },
    { tag: "A Praça", q: "Tu achou uma vaga pra moto perto da Cofel, mas tá em 45 graus. O que faz?", opts: ["Estaciona do jeito que der, largando de lado", "Estaciona alinhado certinho conforme a pintura, pra não tomar multa", "Para em cima da calçada pra não arranhar a moto"], c: 1 }
];

let activeQuiz = [];
let quizIndex = 0;

function startQuiz() {
    activeQuiz = shuffle([...quizDb]);
    quizIndex = 0;
    renderQuiz();
}

function renderQuiz() {
    const optsCont = document.getElementById('quiz-options-container');
    optsCont.innerHTML = '';
    
    if(quizIndex >= activeQuiz.length) {
        document.getElementById('quiz-question-text').innerText = "Fim de papo! Mandou bem.";
        document.getElementById('quiz-subject').innerText = "Acabou";
        document.getElementById('quiz-progress-text').innerText = "";
        optsCont.innerHTML = `<button class="btn-glow full-width" onclick="showHome()">Voltar pro Início</button>`;
        return;
    }

    const currentQ = activeQuiz[quizIndex];
    document.getElementById('quiz-subject').innerText = currentQ.tag;
    document.getElementById('quiz-progress-text').innerText = `${quizIndex + 1}/${activeQuiz.length}`;
    document.getElementById('quiz-question-text').innerText = currentQ.q;

    // Hide the "Next" button at the start of a new question
    const nextContainer = document.getElementById('quiz-next-container');
    if(nextContainer) nextContainer.classList.add('hidden');

    // Shuffle options map to keep track of correct index
    let optionsMap = currentQ.opts.map((text, i) => ({ text, isCorrect: i === currentQ.c }));
    optionsMap = shuffle(optionsMap);

    optionsMap.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn glass-panel';
        btn.innerText = opt.text;
        btn.onclick = () => submitQuiz(btn, opt.isCorrect, optionsMap);
        optsCont.appendChild(btn);
    });
}

function submitQuiz(btn, isCorrect, optionsMap) {
    const allBtns = document.querySelectorAll('.quiz-btn');
    allBtns.forEach(b => b.disabled = true); // Lock answers

    if(isCorrect) {
        btn.classList.add('correct');
        updateScore(3);
    } else {
        btn.classList.add('wrong');
        updateScore(-2);
        // Show correct answer visually
        allBtns.forEach((b, i) => {
            if(optionsMap[i].isCorrect) b.classList.add('correct');
        });
    }

    // Show the "Next" button instead of timeout
    const nextContainer = document.getElementById('quiz-next-container');
    if(nextContainer) nextContainer.classList.remove('hidden');
}

function nextQuizQuestion() {
    quizIndex++;
    renderQuiz();
}

// Initial state
// To ensure everything works with showView
const origShowView = window.showView;
window.showView = function(id) {
    if(origShowView) origShowView(id);
    else {
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        
        const backBtn = document.getElementById('backToHome');
        if (id === 'view-home') backBtn.classList.add('hidden');
        else backBtn.classList.remove('hidden');
    }
    
    if(id === 'view-flashcards') initFlashcards();
    if(id === 'view-quiz') startQuiz();
    if(id === 'view-ligar') initMatchGame();
};
