// シャトーのデータをJSONファイルから読み込む
let chateauxData;

// 全てのAOCを取得
let allAocs;

// 全ての格付けを取得
let allClassifications;

// 画面要素の取得
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionCountSelect = document.getElementById('question-count');
const startButton = document.getElementById('start-button');
const backToStartButton = document.getElementById('back-to-start');
const restartButton = document.getElementById('restart-button');

// クイズ関連の要素
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const progressElement = document.getElementById('progress');
const scoreDisplayElement = document.getElementById('score-display');
const finalScoreElement = document.getElementById('final-score');

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
      answer: chateau.name
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
      answer: chateau.aoc
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
      answer: chateau.classification
    };
  });
}

// クイズを初期化する関数
function initializeQuiz() {
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

  showQuiz();
}

// クイズを表示する関数
function showQuiz() {
  if (currentQuizIndex < quizData.length) {
    const currentQuiz = quizData[currentQuizIndex];
    questionElement.textContent = currentQuiz.question;
    choicesElement.innerHTML = '';
    currentQuiz.choices.forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice;
      button.classList.add('choice-button');
      button.addEventListener('click', () => checkAnswer(choice, currentQuiz.answer));
      choicesElement.appendChild(button);
    });
    feedbackElement.textContent = '';
    nextButton.style.display = 'none';
    updateProgress();
  } else {
    showResult();
  }
}

// 結果画面を表示する関数
function showResult() {
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'block';
  finalScoreElement.textContent = `全${quizData.length}問中、${correctAnswers}問正解しました！`;
}

// 回答をチェックする関数
function checkAnswer(selectedChoice, correctAnswer) {
  if (selectedChoice === correctAnswer) {
    feedbackElement.textContent = '正解！';
    feedbackElement.style.color = 'green';
    correctAnswers++;
  } else {
    feedbackElement.textContent = `不正解！正解は ${correctAnswer} です。`;
    feedbackElement.style.color = 'red';
  }
  
  // 全ての選択肢ボタンを無効化
  Array.from(choicesElement.children).forEach(button => {
    button.disabled = true;
  });

  nextButton.style.display = 'block';
}

// 次の問題へ進む関数
function nextQuestion() {
  currentQuizIndex++;
  showQuiz();
}

// 進捗状況を更新する関数
function updateProgress() {
  progressElement.textContent = `問題 ${currentQuizIndex + 1}/${quizData.length}`;
  scoreDisplayElement.textContent = `正解: ${correctAnswers} / ${currentQuizIndex} 問`;
}

// 画面遷移の関数
function showStartScreen() {
  startScreen.style.display = 'block';
  quizScreen.style.display = 'none';
  resultScreen.style.display = 'none';
}

function showQuizScreen() {
  startScreen.style.display = 'none';
  quizScreen.style.display = 'block';
  resultScreen.style.display = 'none';
  initializeQuiz();
}

// イベントリスナー
startButton.addEventListener('click', showQuizScreen);
backToStartButton.addEventListener('click', showStartScreen);
restartButton.addEventListener('click', showStartScreen);
nextButton.addEventListener('click', nextQuestion);

// JSONファイルからデータを読み込んで初期化
fetch('chateaux.json')
  .then(response => response.json())
  .then(data => {
    chateauxData = data;
    allAocs = Array.from(new Set(chateauxData.chateaux.map(c => c.aoc)));
    allClassifications = Array.from(new Set(chateauxData.chateaux.map(c => c.classification)));
    showStartScreen();
  })
  .catch(error => {
    console.error('Error loading chateaux data:', error);
    questionElement.textContent = 'データの読み込みに失敗しました。';
  });