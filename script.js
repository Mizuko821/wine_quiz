// シャトーのデータをJSONファイルから読み込む
let chateauxData;

// 全てのAOCを取得
let allAocs;

// 全ての格付けを取得
let allClassifications;

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

// 全てのクイズを生成
let quizData;

// HTML要素の取得
const questionElement = document.getElementById('question');
const choicesElement = document.getElementById('choices');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const progressElement = document.getElementById('progress');
const scoreDisplayElement = document.getElementById('score-display');

let currentQuizIndex = 0;
let correctAnswers = 0;

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
    nextButton.style.display = 'none'; // 「次の問題へ」ボタンを非表示
    updateProgress();
  } else {
    questionElement.textContent = 'クイズ完了！';
    choicesElement.innerHTML = '';
    feedbackElement.textContent = `全${quizData.length}問中、${correctAnswers}問正解しました！`;
    nextButton.style.display = 'none'; // 「次の問題へ」ボタンを非表示
  }
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

  nextButton.style.display = 'block'; // 「次の問題へ」ボタンを表示
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

// イベントリスナー
nextButton.addEventListener('click', nextQuestion);

// JSONファイルからデータを読み込んでクイズを初期化
fetch('chateaux.json')
  .then(response => response.json())
  .then(data => {
    chateauxData = data;
    allAocs = Array.from(new Set(chateauxData.chateaux.map(c => c.aoc)));
    allClassifications = Array.from(new Set(chateauxData.chateaux.map(c => c.classification)));
    quizData = [
      ...generateNameQuestions(),
      ...generateAocQuestions(),
      ...generateClassificationQuestions()
    ].sort(() => Math.random() - 0.5);
    showQuiz();
  })
  .catch(error => {
    console.error('Error loading chateaux data:', error);
    questionElement.textContent = 'データの読み込みに失敗しました。';
  });