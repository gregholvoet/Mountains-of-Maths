/* Synthétiseur Audio Web Audio API pour des retours sonores joyeux et bienveillants */
let audioContext = null;
let soundEnabled = true;

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function toggleAudio() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-btn');
  btn.innerHTML = soundEnabled ? '🔊' : '🔇';
  btn.setAttribute('aria-label', soundEnabled ? 'Désactiver le son' : 'Activer le son');
}

function playTone(type) {
  if (!soundEnabled) return;
  try {
    initAudio();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'encourage') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn('Audio non disponible', e);
  }
}

const state = {
  activeTab: 'matrix',
  selectedTables: [2], // 1 ou 2 tables sélectionnées pour comparaison
  showSquares: false,
  inspectedRow: 3,
  inspectedCol: 4,
  
  // État du quiz
  quizTables: [2, 3, 4, 5],
  currentQ: { a: 2, b: 3 },
  currentInput: '',
  score: 0,
  streak: 0,
  isAnswerChecked: false
};

function switchTab(tabId) {
  state.activeTab = tabId;
  const viewMatrix = document.getElementById('view-matrix');
  const viewQuiz = document.getElementById('view-quiz');
  const btnMatrix = document.getElementById('tab-btn-matrix');
  const btnQuiz = document.getElementById('tab-btn-quiz');

  if (tabId === 'matrix') {
    viewMatrix.classList.remove('hidden');
    viewQuiz.classList.add('hidden');
    btnMatrix.className = 'px-4 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-amber-500 text-white shadow-sm flex items-center gap-1.5';
    btnQuiz.className = 'px-4 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 text-slate-600 hover:text-amber-700 flex items-center gap-1.5';
  } else {
    viewMatrix.classList.add('hidden');
    viewQuiz.classList.remove('hidden');
    btnQuiz.className = 'px-4 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-amber-500 text-white shadow-sm flex items-center gap-1.5';
    btnMatrix.className = 'px-4 py-1.5 rounded-xl font-semibold text-sm transition-all duration-200 text-slate-600 hover:text-amber-700 flex items-center gap-1.5';
    generateNewQuestion();
  }
}

function renderTableSelectorChips() {
  const container = document.getElementById('table-selector-chips');
  container.innerHTML = '';
  
  for (let i = 0; i <= 10; i++) {
    const isSelected = state.selectedTables.includes(i);
    const idx = state.selectedTables.indexOf(i);
    
    let colorClasses = 'bg-slate-100 text-slate-700 hover:bg-amber-100';
    if (isSelected && idx === 0) {
      colorClasses = 'bg-blue-500 text-white font-bold ring-2 ring-blue-300';
    } else if (isSelected && idx === 1) {
      colorClasses = 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-300';
    }

    const chip = document.createElement('button');
    chip.className = `px-3 py-1 rounded-xl text-xs font-semibold transition cell-bounce ${colorClasses}`;
    chip.textContent = `Table de ${i}`;
    chip.onclick = () => toggleTableSelection(i);
    container.appendChild(chip);
  }
}

function toggleTableSelection(num) {
  playTone('pop');
  state.showSquares = false;
  document.getElementById('btn-squares').classList.remove('ring-2', 'ring-amber-500', 'bg-amber-200');

  if (state.selectedTables.includes(num)) {
    state.selectedTables = state.selectedTables.filter(t => t !== num);
  } else {
    if (state.selectedTables.length >= 2) {
      state.selectedTables.shift(); // conserve max 2 tables pour comparaison claire
    }
    state.selectedTables.push(num);
  }
  updateComparisonBanner();
  renderTableSelectorChips();
  renderMatrix();
}

function highlightDoubleComparison(t1, t2) {
  playTone('pop');
  state.showSquares = false;
  state.selectedTables = [t1, t2];
  renderTableSelectorChips();
  renderMatrix();
  updateComparisonBanner();
}

function toggleSquares() {
  playTone('pop');
  state.showSquares = !state.showSquares;
  const btn = document.getElementById('btn-squares');
  if (state.showSquares) {
    state.selectedTables = [];
    btn.classList.add('ring-2', 'ring-amber-500', 'bg-amber-200');
  } else {
    btn.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-200');
  }
  updateComparisonBanner();
  renderTableSelectorChips();
  renderMatrix();
}

function resetMatrixHighlights() {
  playTone('pop');
  state.selectedTables = [];
  state.showSquares = false;
  document.getElementById('btn-squares').classList.remove('ring-2', 'ring-amber-500', 'bg-amber-200');
  updateComparisonBanner();
  renderTableSelectorChips();
  renderMatrix();
}

function updateComparisonBanner() {
  const banner = document.getElementById('compare-banner');
  const text = document.getElementById('compare-text');

  if (state.selectedTables.length === 2) {
    const [a, b] = state.selectedTables.sort((x, y) => x - y);
    banner.classList.remove('hidden');
    if (b === a * 2) {
      text.innerHTML = `<strong>Regarde bien !</strong> Chaque résultat de la <strong>table de ${b}</strong> est exactement <strong>le double (× 2)</strong> de la table de <strong>${a}</strong> ! (Ex: ${a}×3 = ${a*3} et ${b}×3 = ${b*3})`;
    } else {
      text.innerHTML = `Comparaison active entre la <strong>table de ${a}</strong> (en bleu) et la <strong>table de ${b}</strong> (en vert). Remarque les multiples communs !`;
    }
  } else if (state.showSquares) {
    banner.classList.remove('hidden');
    text.innerHTML = `<strong>Carrés Parfaits (en violet) :</strong> C'est quand un nombre est multiplié par lui-même (comme 2×2, 3×3, 4×4...) pour former un carré parfait !`;
  } else {
    banner.classList.add('hidden');
  }
}

function renderMatrix() {
  const grid = document.getElementById('multiplication-grid');
  grid.innerHTML = '';

  // Coin supérieur gauche
  const corner = document.createElement('div');
  corner.className = 'bg-amber-200 text-amber-900 rounded-lg p-1.5 flex items-center justify-center font-black';
  corner.textContent = '×';
  grid.appendChild(corner);

  // En-têtes colonnes (0 à 10)
  for (let c = 0; c <= 10; c++) {
    const colHeader = document.createElement('div');
    const isSelectedTable = state.selectedTables.includes(c);
    let headerStyle = 'bg-amber-100 text-amber-900';
    if (isSelectedTable) {
      const idx = state.selectedTables.indexOf(c);
      headerStyle = idx === 0 ? 'bg-blue-200 text-blue-950 font-black' : 'bg-emerald-200 text-emerald-950 font-black';
    }
    colHeader.className = `rounded-lg p-1.5 font-bold transition ${headerStyle}`;
    colHeader.textContent = c;
    grid.appendChild(colHeader);
  }

  // Lignes de 0 à 10
  for (let r = 0; r <= 10; r++) {
    // En-tête de ligne
    const rowHeader = document.createElement('div');
    const isSelectedTable = state.selectedTables.includes(r);
    let headerStyle = 'bg-amber-100 text-amber-900';
    if (isSelectedTable) {
      const idx = state.selectedTables.indexOf(r);
      headerStyle = idx === 0 ? 'bg-blue-200 text-blue-950 font-black' : 'bg-emerald-200 text-emerald-950 font-black';
    }
    rowHeader.className = `rounded-lg p-1.5 font-bold transition ${headerStyle}`;
    rowHeader.textContent = r;
    grid.appendChild(rowHeader);

    // Cellules de résultats
    for (let c = 0; c <= 10; c++) {
      const val = r * c;
      const cell = document.createElement('button');
      cell.setAttribute('type', 'button');
      cell.setAttribute('aria-label', `${r} fois ${c} égale ${val}`);

      const isInspected = (r === state.inspectedRow && c === state.inspectedCol);
      const isSquare = (r === c);
      const isTable1 = state.selectedTables[0] !== undefined && (r === state.selectedTables[0] || c === state.selectedTables[0]);
      const isTable2 = state.selectedTables[1] !== undefined && (r === state.selectedTables[1] || c === state.selectedTables[1]);

      let styleClass = 'bg-slate-50 text-slate-700 hover:bg-amber-200';

      if (isInspected) {
        styleClass = 'bg-amber-400 text-slate-900 ring-2 ring-amber-600 font-black scale-105 z-10 shadow';
      } else if (state.showSquares && isSquare) {
        styleClass = 'bg-purple-200 text-purple-950 font-extrabold ring-1 ring-purple-400';
      } else if (isTable1 && isTable2) {
        styleClass = 'bg-teal-200 text-teal-950 font-extrabold ring-1 ring-teal-400'; // Intersection des deux tables
      } else if (isTable1) {
        styleClass = 'bg-blue-100 text-blue-900 font-semibold';
      } else if (isTable2) {
        styleClass = 'bg-emerald-100 text-emerald-900 font-semibold';
      }

      cell.className = `cell-bounce rounded-lg p-1 sm:p-2 cursor-pointer transition flex items-center justify-center ${styleClass}`;
      cell.textContent = val;

      cell.onclick = () => {
        playTone('pop');
        inspectCell(r, c);
      };

      grid.appendChild(cell);
    }
  }
}

function inspectCell(r, c) {
  state.inspectedRow = r;
  state.inspectedCol = c;
  
  const product = r * c;
  const formulaEl = document.getElementById('inspector-formula');
  const meaningEl = document.getElementById('inspector-meaning');
  const container = document.getElementById('visual-blocks-container');
  const zeroNotice = document.getElementById('visual-zero-notice');

  formulaEl.textContent = `${r} × ${c} = ${product}`;

  if (r === 0 || c === 0) {
    meaningEl.textContent = `0 fois n'importe quel nombre donne toujours 0 !`;
    zeroNotice.classList.remove('hidden');
    container.innerHTML = '';
  } else {
    zeroNotice.classList.add('hidden');
    meaningEl.textContent = `${r} ligne${r > 1 ? 's' : ''} de ${c} carré${c > 1 ? 's' : ''} = ${product} carré${product > 1 ? 's' : ''} en tout`;
    
    // Rendu des blocs visuels (max 10x10)
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${c}, minmax(0, 1fr))`;

    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        const block = document.createElement('div');
        block.className = 'w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 rounded-md border border-amber-500 shadow-xs transform transition duration-200 hover:scale-110';
        container.appendChild(block);
      }
    }
  }

  renderMatrix();
}

function renderQuizTableToggles() {
  const container = document.getElementById('quiz-table-toggles');
  container.innerHTML = '';

  for (let i = 0; i <= 10; i++) {
    const isChecked = state.quizTables.includes(i);
    const label = document.createElement('button');
    label.type = 'button';
    label.className = `px-2.5 py-1 rounded-xl text-xs font-bold transition ${
      isChecked ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
    }`;
    label.textContent = `Table ${i}`;
    label.onclick = () => toggleQuizTable(i);
    container.appendChild(label);
  }

  document.getElementById('quiz-selected-count').textContent = 
    `${state.quizTables.length} table${state.quizTables.length > 1 ? 's' : ''} activée${state.quizTables.length > 1 ? 's' : ''}`;
}

function toggleQuizTable(n) {
  playTone('pop');
  if (state.quizTables.includes(n)) {
    if (state.quizTables.length > 1) {
      state.quizTables = state.quizTables.filter(x => x !== n);
    }
  } else {
    state.quizTables.push(n);
    state.quizTables.sort((a, b) => a - b);
  }
  renderQuizTableToggles();
  generateNewQuestion();
}

function setQuizTablesPreset(preset) {
  playTone('pop');
  if (preset === 'easy') {
    state.quizTables = [1, 2, 5, 10];
  } else if (preset === 'hard') {
    state.quizTables = [6, 7, 8, 9];
  } else {
    state.quizTables = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }
  renderQuizTableToggles();
  generateNewQuestion();
}

function generateNewQuestion() {
  state.isAnswerChecked = false;
  state.currentInput = '';
  updateUserInputDisplay();
  hideQuizFeedback();

  // Choisir une table parmi les sélectionnées
  const tables = state.quizTables.length > 0 ? state.quizTables : [2, 3, 4];
  const table = tables[Math.floor(Math.random() * tables.length)];
  const multiplier = Math.floor(Math.random() * 11); // 0 à 10

  // Alternance aléatoire pour habituer l'enfant à la commutativité
  if (Math.random() > 0.5) {
    state.currentQ = { a: table, b: multiplier, answer: table * multiplier };
  } else {
    state.currentQ = { a: multiplier, b: table, answer: table * multiplier };
  }

  document.getElementById('quiz-question-display').textContent = `${state.currentQ.a} × ${state.currentQ.b} = ?`;
}

function handleKeypad(key) {
  if (state.isAnswerChecked) {
    generateNewQuestion();
  }

  playTone('pop');
  if (key === 'clear') {
    state.currentInput = '';
  } else {
    if (state.currentInput.length < 3) {
      state.currentInput += key;
    }
  }
  updateUserInputDisplay();
}

function updateUserInputDisplay() {
  const text = document.getElementById('input-text');
  text.textContent = state.currentInput === '' ? '?' : state.currentInput;
}

function validateQuizAnswer() {
  if (state.currentInput === '') return;
  if (state.isAnswerChecked) {
    generateNewQuestion();
    return;
  }

  const userVal = parseInt(state.currentInput, 10);
  const isCorrect = userVal === state.currentQ.answer;
  state.isAnswerChecked = true;

  const feedbackBox = document.getElementById('quiz-feedback-box');
  feedbackBox.classList.remove('opacity-0');

  if (isCorrect) {
    playTone('success');
    state.score += 10;
    state.streak += 1;
    document.getElementById('quiz-score').textContent = state.score;
    document.getElementById('quiz-streak').textContent = state.streak;

    feedbackBox.className = 'w-full text-center text-sm font-bold flex items-center justify-center p-2.5 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 transition-opacity';
    feedbackBox.innerHTML = `🎉 Super champion ! ${state.currentQ.a} × ${state.currentQ.b} = ${state.currentQ.answer}`;

    // Confettis de motivation lors des séries de 5 ou sur les tables complexes
    if (state.streak % 5 === 0 || state.currentQ.a >= 7) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }

    setTimeout(() => {
      if (state.activeTab === 'quiz' && state.isAnswerChecked) {
        generateNewQuestion();
      }
    }, 1300);

  } else {
    playTone('encourage');
    state.streak = 0;
    document.getElementById('quiz-streak').textContent = state.streak;

    feedbackBox.className = 'w-full text-center text-xs sm:text-sm font-bold flex flex-col items-center justify-center p-2.5 rounded-2xl bg-rose-50 text-rose-800 border border-rose-300 transition-opacity space-y-1';
    feedbackBox.innerHTML = `
      <div>Presque ! La bonne réponse était <strong>${state.currentQ.answer}</strong>.</div>
      <div class="text-[11px] text-rose-600 font-normal">Astuce : ${state.currentQ.a} fois ${state.currentQ.b}, c'est ${state.currentQ.answer} ! Réessaie au prochain tour.</div>
    `;

    setTimeout(() => {
      if (state.activeTab === 'quiz' && state.isAnswerChecked) {
        generateNewQuestion();
      }
    }, 2500);
  }
}

function hideQuizFeedback() {
  const feedbackBox = document.getElementById('quiz-feedback-box');
  feedbackBox.classList.add('opacity-0');
}

// Support du clavier physique (ordinateur ou tablette avec clavier)
window.addEventListener('keydown', (e) => {
  if (state.activeTab !== 'quiz') return;

  if (e.key >= '0' && e.key <= '9') {
    handleKeypad(e.key);
  } else if (e.key === 'Backspace') {
    handleKeypad('clear');
  } else if (e.key === 'Enter') {
    validateQuizAnswer();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  renderTableSelectorChips();
  renderMatrix();
  inspectCell(3, 4);
  renderQuizTableToggles();
  generateNewQuestion();
});