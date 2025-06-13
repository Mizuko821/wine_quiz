// シャトーのデータをJSONファイルから読み込む
let chateauxData;

// 全てのAOCを取得
let allAocs;

// 全ての格付けを取得
let allClassifications;

// 画面要素の取得
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const explanationScreen = document.getElementById('explanation-screen');
const resultScreen = document.getElementById('result-screen');
const questionCountSelect = document.getElementById('question-count');
const startButton = document.getElementById('start-button');
const backToStartButton = document.getElementById('back-to-start');
const restartButton = document.getElementById('restart-button');
const skipButton = document.getElementById('skip-button');
const explanationNextButton = document.getElementById('explanation-next-button');
const explanationBackToStartButton = document.getElementById('explanation-back-to-start');

// フィードバックコンテナを取得
const feedbackContainer = document.getElementById('feedback-container');

// クイズ関連の要素
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const feedbackIconElement = document.getElementById('feedback-icon');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const progressElement = document.getElementById('progress');
const scoreDisplayElement = document.getElementById('score-display');
const finalScoreElement = document.getElementById('final-score');

// 解説画面の要素
const explanationProgressElement = document.getElementById('explanation-progress');
const explanationScoreElement = document.getElementById('explanation-score');
const explanationQuestionElement = document.getElementById('explanation-question');
const explanationAnswerElement = document.getElementById('explanation-answer');
const explanationTextElement = document.getElementById('explanation-text');

let currentQuizIndex = 0;
let correctAnswers = 0;
let quizData;

// シャトー名を問う問題を生成
function generateNameQuestions() {
  return chateauxData.chateaux.map(chateau => {
    // 正解のシャトーと同じAOCのシャトーは選択肢として使用しない
    const otherAocChateaux = chateauxData.chateaux
      .filter(c => c.aoc !== chateau.aoc)
      .map(c => c.name);
    
    // 選択肢が4つになるように他のAOCから追加
    const choices = new Set([chateau.name]);
    while (choices.size < 4) {
      const randomChateau = otherAocChateaux[Math.floor(Math.random() * otherAocChateaux.length)];
      if (!choices.has(randomChateau)) {
        choices.add(randomChateau);
      }
    }

    return {
      question: `${chateau.aoc}の${chateau.classification}のシャトーは？`,
      choices: Array.from(choices).sort(() => Math.random() - 0.5),
      answer: chateau.name,
      originalChateau: chateau,
      type: 'name'
    };
  });
}

// AOCを問う問題を生成
function generateAocQuestions() {
  return chateauxData.chateaux.map(chateau => {
    // 正解のAOC以外のAOCから選択肢を生成
    const otherAocs = allAocs.filter(aoc => aoc !== chateau.aoc);
    
    // 選択肢が4つになるように他のAOCから追加
    const choices = new Set([chateau.aoc]);
    while (choices.size < 4) {
      const randomAoc = otherAocs[Math.floor(Math.random() * otherAocs.length)];
      if (!choices.has(randomAoc)) {
        choices.add(randomAoc);
      }
    }

    return {
      question: `${chateau.name}のAOCは？`,
      choices: Array.from(choices).sort(() => Math.random() - 0.5),
      answer: chateau.aoc,
      originalChateau: chateau,
      type: 'aoc'
    };
  });
}

// 格付けを問う問題を生成
function generateClassificationQuestions() {
  return chateauxData.chateaux.map(chateau => {
    // 正解の格付け以外の格付けから選択肢を生成
    const otherClassifications = allClassifications.filter(classification => classification !== chateau.classification);
    
    // 選択肢が4つになるように他の格付けから追加
    const choices = new Set([chateau.classification]);
    while (choices.size < 4) {
      const randomClassification = otherClassifications[Math.floor(Math.random() * otherClassifications.length)];
      if (!choices.has(randomClassification)) {
        choices.add(randomClassification);
      }
    }

    return {
      question: `${chateau.name}の格付けは？`,
      choices: Array.from(choices).sort(() => Math.random() - 0.5),
      answer: chateau.classification,
      originalChateau: chateau,
      type: 'classification'
    };
  });
}

// クイズを初期化する関数
function initializeQuiz() {
  console.log('initializeQuiz called.'); // Debug log
  currentQuizIndex = 0;
  correctAnswers = 0;
  
  // 問題数を取得
  const questionCount = questionCountSelect.value;
  const allQuestions = [
    ...generateNameQuestions(),
    ...generateAocQuestions(),
    ...generateClassificationQuestions()
  ].sort(() => Math.random() - 0.5);

  // 問題数を制限
  quizData = questionCount === 'all' 
    ? allQuestions 
    : allQuestions.slice(0, parseInt(questionCount));
  console.log('quizData generated:', quizData, 'length:', quizData.length); // Debug log

  showQuiz();
}

// クイズを表示する関数
function showQuiz() {
  console.log('showQuiz called.'); // Debug log
  quizScreen.style.display = 'block';
  explanationScreen.style.display = 'none';

  // フィードバックコンテナを非表示にする
  feedbackContainer.style.display = 'none';

  if (currentQuizIndex < quizData.length) {
    const currentQuiz = quizData[currentQuizIndex];
    console.log('currentQuiz:', currentQuiz); // Debug log
    questionElement.textContent = currentQuiz.question;
    choicesElement.innerHTML = '';
    console.log('choicesElement cleared.'); // Debug log
    
    // フィードバック表示をリセット
    feedbackIconElement.textContent = '';
    feedbackIconElement.className = '';
    feedbackElement.textContent = '';

    console.log('currentQuiz.choices:', currentQuiz.choices); // Debug log
    currentQuiz.choices.forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice;
      button.classList.add('choice-button');
      button.addEventListener('click', () => checkAnswer(choice, currentQuiz.answer));
      choicesElement.appendChild(button);
      console.log('Button added:', choice); // Debug log
    });
    nextButton.style.display = 'none';
    skipButton.style.display = 'block';
    updateProgress();
  } else {
    showResult();
  }
}

// 結果画面を表示する関数
function showResult() {
  quizScreen.style.display = 'none';
  explanationScreen.style.display = 'none';
  resultScreen.style.display = 'block';
  finalScoreElement.textContent = `全${quizData.length}問中、${correctAnswers}問正解しました！`;
}

// 回答をチェックする関数
function checkAnswer(selectedChoice, correctAnswer) {
  // フィードバックコンテナを表示する
  feedbackContainer.style.display = 'flex';

  if (selectedChoice === correctAnswer) {
    feedbackIconElement.textContent = '⚪︎';
    feedbackIconElement.className = 'correct';
    feedbackElement.textContent = '正解！';
    feedbackElement.style.color = '#4CAF50';
    correctAnswers++;
  } else {
    feedbackIconElement.textContent = '×';
    feedbackIconElement.className = 'incorrect';
    feedbackElement.textContent = '不正解…';
    feedbackElement.style.color = '#f44336';
  }
  
  // 全ての選択肢ボタンを無効化
  Array.from(choicesElement.children).forEach(button => {
    button.disabled = true;
  });

  nextButton.style.display = 'block';
  skipButton.style.display = 'none';
}

// 次の問題へ進む関数
function nextQuestion() {
  currentQuizIndex++;
  showExplanation();
}

// 解説画面を表示する関数
function showExplanation() {
  const currentQuiz = quizData[currentQuizIndex];
  const originalChateau = currentQuiz.originalChateau;
  
  // 解説画面の要素を更新
  explanationProgressElement.textContent = `問題 ${currentQuizIndex + 1}/${quizData.length}`;
  explanationScoreElement.textContent = `正解: ${correctAnswers} / ${currentQuizIndex + 1} 問`;
  explanationQuestionElement.textContent = currentQuiz.question;
  explanationAnswerElement.textContent = `正解: ${currentQuiz.answer}`;
  
  // 解説テキストを生成
  let explanationText = '';
  switch (currentQuiz.type) {
    case 'name':
      explanationText = `<span class="correct-explanation">${originalChateau.name}は${originalChateau.aoc}の${originalChateau.classification}に属するシャトーです。</span>`;
      break;
    case 'aoc':
      explanationText = `<span class="correct-explanation">${originalChateau.name}のAOCは${originalChateau.aoc}です。</span>`;
      break;
    case 'classification':
      explanationText = `<span class="correct-explanation">${originalChateau.name}の格付けは${originalChateau.classification}です。</span>`;
      break;
    default:
      explanationText = `<span class="correct-explanation">${currentQuiz.answer}に関する詳細な情報はこちらで確認できます。</span>`;
  }
  explanationTextElement.innerHTML = explanationText;

  // 画面を切り替え
  quizScreen.style.display = 'none';
  explanationScreen.style.display = 'block';
}

// 解説画面から次の問題へ進む関数
function nextQuestionFromExplanation() {
  currentQuizIndex++;
  if (currentQuizIndex < quizData.length) {
    explanationScreen.style.display = 'none';
    showQuiz();
  } else {
    showResult();
  }
}

// スキップする関数 (不正解扱い)
function skipQuestion() {
  // フィードバックコンテナを表示する
  feedbackContainer.style.display = 'flex';

  const currentQuiz = quizData[currentQuizIndex];
  feedbackIconElement.textContent = '×';
  feedbackIconElement.className = 'incorrect';
  feedbackElement.textContent = 'スキップしました。';
  feedbackElement.style.color = '#f44336';

  // 全ての選択肢ボタンを無効化
  Array.from(choicesElement.children).forEach(button => {
    button.disabled = true;
  });

  nextButton.style.display = 'block';
  skipButton.style.display = 'none';
  showExplanation();
}

// 進捗状況を更新する関数
function updateProgress() {
  progressElement.textContent = `問題 ${currentQuizIndex + 1}/${quizData.length}`;
  // 最初の問題の場合（まだ解答数がない場合）の表示を調整
  if (currentQuizIndex === 0 && correctAnswers === 0) {
    scoreDisplayElement.textContent = `正解: 0 問`;
  } else {
    scoreDisplayElement.textContent = `正解: ${correctAnswers} / ${currentQuizIndex} 問`;
  }
}

// スタート画面を表示する関数
function showStartScreen() {
  startScreen.style.display = 'block';
  quizScreen.style.display = 'none';
  explanationScreen.style.display = 'none';
  resultScreen.style.display = 'none';
}

// クイズ画面を表示する関数
function showQuizScreen() {
  startScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  explanationScreen.style.display = 'none';
  resultScreen.style.display = 'none';
  initializeQuiz();
}

// データを読み込む
async function loadData() {
  try {
    const response = await fetch('chateaux.json');
    chateauxData = await response.json();
    
    // 全てのAOCを取得
    allAocs = [...new Set(chateauxData.chateaux.map(chateau => chateau.aoc))];
    
    // 全ての格付けを取得
    allClassifications = [...new Set(chateauxData.chateaux.map(chateau => chateau.classification))];
    
    // イベントリスナーを設定
    setupEventListeners();
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
  }
}

// イベントリスナーを設定する関数
function setupEventListeners() {
  startButton.addEventListener('click', showQuizScreen);
  backToStartButton.addEventListener('click', showStartScreen);
  restartButton.addEventListener('click', showStartScreen);
  skipButton.addEventListener('click', skipQuestion);
  nextButton.addEventListener('click', nextQuestion);
  explanationNextButton.addEventListener('click', nextQuestionFromExplanation);
  explanationBackToStartButton.addEventListener('click', showStartScreen);
}

// データの読み込みを開始
// loadData(); // この行は削除またはコメントアウト

document.addEventListener('DOMContentLoaded', loadData); // DOMContentLoadedイベントが発火したらloadDataを呼び出す