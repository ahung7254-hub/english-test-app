
import React, { useMemo, useState } from "react";

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function splitKoSentence(text) {
  return text.split(/\s+/).map((x) => x.trim()).filter(Boolean);
}

function splitEnSentence(text) {
  return text
    .replace(/([,.!?;:()])/g, " $1 ")
    .split(/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

const starterPassages = [
  {
    id: 1,
    title: "Taste Preferences and Neuroplasticity",
    sentences: [
      {
        en: "Despite learned eating behaviors that are formed in early childhood and inborn biological differences, taste preferences can be changed throughout our lives due to neuroplasticity, our brain's amazing adaptability: There is far more flexibility in our food behaviors than most think, even as we age.",
        ko: "유아기에 형성되는 학습된 섭식 행동과 타고난 생물학적 차이에도 불구하고, 맛 선호도는 우리 뇌의 놀라운 적응력인 신경 가소성 덕분에 우리 인생 전체에 걸쳐 변화될 수 있다. 심지어 우리가 나이가 들어도, 우리의 섭식 행동에는 대부분이 생각하는 것보다 훨씬 더 많은 유연성이 있다."
      },
      {
        en: "This is terrific news for adventurous eaters who want to expand their dinner menu, but it is amazing news for those eager to break poor diet habits.",
        ko: "이것은 자신들의 저녁 식단 메뉴를 확장하고 싶어 하는 모험적으로 음식을 먹는 사람에게는 아주 좋은 소식이지만, 나쁜 식습관을 고치기를 열망하는 사람들에게는 엄청난 소식이다."
      },
      {
        en: "Just as kids gradually learn to like nutritious foods, so, too, can adults readjust their taste.",
        ko: "아이들이 점진적으로 영양가 있는 음식을 좋아하는 것을 배우는 것처럼, 성인 또한 자신의 입맛을 재조정할 수 있다."
      },
      {
        en: "Many who switch from processed grain foods like white bread and white rice to whole grain types, for instance, gradually learn to prefer the nutty flavors and chewy textures.",
        ko: "예를 들어, 흰 빵과 흰 쌀 같은 가공된 곡물 식품에서 통곡물 종류로 바꾸는 많은 이는 점진적으로 견과 같은 풍미와 씹는 식감을 선호하는 것을 배운다."
      },
      {
        en: "Repeated exposure and a willingness to change is the key.",
        ko: "반복된 경험과 변화하려는 의지가 핵심이다."
      }
    ],
    vocab: [
      { word: "neuroplasticity", choices: ["신경 가소성", "식욕 조절", "미각 상실"], answer: "신경 가소성" },
      { word: "adaptability", choices: ["적응력", "충동성", "보존성"], answer: "적응력" },
      { word: "adventurous", choices: ["모험적인", "보수적인", "무관심한"], answer: "모험적인" },
      { word: "eager", choices: ["열망하는", "지루해하는", "주저하는"], answer: "열망하는" },
      { word: "nutritious", choices: ["영양가 있는", "자극적인", "희귀한"], answer: "영양가 있는" },
      { word: "readjust", choices: ["재조정하다", "분해하다", "거부하다"], answer: "재조정하다" },
      { word: "processed", choices: ["가공된", "재배된", "발효된"], answer: "가공된" },
      { word: "exposure", choices: ["노출, 경험", "거절", "회피"], answer: "노출, 경험" }
    ]
  }
];

export default function App() {
  const [passages, setPassages] = useState(starterPassages);
  const [screen, setScreen] = useState("home");
  const [selectedPassageId, setSelectedPassageId] = useState(1);
  const [testType, setTestType] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [resultLog, setResultLog] = useState([]);

  const [title, setTitle] = useState("");
  const [englishText, setEnglishText] = useState("");
  const [koreanText, setKoreanText] = useState("");
  const [vocabText, setVocabText] = useState("");

  const [pool, setPool] = useState([]);
  const [answerTray, setAnswerTray] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const selectedPassage = useMemo(
    () => passages.find((p) => p.id === selectedPassageId) || passages[0],
    [passages, selectedPassageId]
  );

  const totalQuestions = useMemo(() => {
    if (!selectedPassage || !testType) return 0;
    if (testType === "vocab") return selectedPassage.vocab.length;
    return selectedPassage.sentences.length;
  }, [selectedPassage, testType]);

  const currentQuestion = useMemo(() => {
    if (!selectedPassage || !testType) return null;
    if (testType === "vocab") return selectedPassage.vocab[currentIndex] || null;
    return selectedPassage.sentences[currentIndex] || null;
  }, [selectedPassage, testType, currentIndex]);

  function parseVocab(raw) {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((x) => x.trim());
        if (parts.length !== 4) return null;
        return {
          word: parts[0],
          choices: [parts[1], parts[2], parts[3]],
          answer: parts[1],
        };
      })
      .filter(Boolean);
  }

  function savePassage() {
    const enLines = englishText.split("\n").map((x) => x.trim()).filter(Boolean);
    const koLines = koreanText.split("\n").map((x) => x.trim()).filter(Boolean);

    if (!title.trim()) {
      alert("지문 제목을 입력해 주세요.");
      return;
    }
    if (!enLines.length || !koLines.length) {
      alert("영어 문장과 한글 해석을 입력해 주세요.");
      return;
    }
    if (enLines.length !== koLines.length) {
      alert("영어 문장 수와 한글 해석 문장 수가 같아야 해요.");
      return;
    }

    const sentences = enLines.map((en, idx) => ({ en, ko: koLines[idx] }));
    const vocab = parseVocab(vocabText);

    const newPassage = {
      id: Date.now(),
      title: title.trim(),
      sentences,
      vocab,
    };

    setPassages((prev) => [...prev, newPassage]);
    setSelectedPassageId(newPassage.id);
    setTitle("");
    setEnglishText("");
    setKoreanText("");
    setVocabText("");
    setScreen("home");
  }

  function setupQuestion(type, questionIndex = 0, resetScore = false) {
    if (!selectedPassage) return;
    setTestType(type);
    setCurrentIndex(questionIndex);
    setFeedback(null);
    if (resetScore) {
      setScore(0);
      setResultLog([]);
    }

    if (type === "vocab") {
      const q = selectedPassage.vocab[questionIndex];
      setPool(shuffleArray(q?.choices || []));
      setAnswerTray([]);
      return;
    }

    const q = selectedPassage.sentences[questionIndex];
    const pieces = type === "ko" ? splitKoSentence(q?.ko || "") : splitEnSentence(q?.en || "");
    setPool(shuffleArray(pieces));
    setAnswerTray([]);
  }

  function startTest(type) {
    setScreen("test");
    setupQuestion(type, 0, true);
  }

  function pickPiece(item, fromPool = true) {
    if (fromPool) {
      const index = pool.findIndex((x) => x === item);
      if (index === -1) return;
      setAnswerTray((prev) => [...prev, item]);
      setPool((prev) => prev.filter((_, i) => i !== index));
    } else {
      const index = answerTray.findIndex((x) => x === item);
      if (index === -1) return;
      setPool((prev) => [...prev, item]);
      setAnswerTray((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function resetCurrentQuestion() {
    setupQuestion(testType, currentIndex, false);
  }

  function submitAnswer() {
    if (!currentQuestion) return;

    if (testType === "vocab") {
      const chosen = answerTray[0];
      const correct = chosen === currentQuestion.answer;
      setFeedback(correct ? "correct" : "wrong");
      if (correct) setScore((prev) => prev + 1);
      setResultLog((prev) => [
        ...prev,
        {
          prompt: currentQuestion.word,
          user: chosen || "선택 안 함",
          answer: currentQuestion.answer,
          correct,
        },
      ]);
      return;
    }

    const userAnswer = normalizeText(answerTray.join(" "));
    const correctAnswer = normalizeText(testType === "ko" ? currentQuestion.ko : currentQuestion.en);
    const correct = userAnswer === correctAnswer;

    setFeedback(correct ? "correct" : "wrong");
    if (correct) setScore((prev) => prev + 1);
    setResultLog((prev) => [
      ...prev,
      {
        prompt: testType === "ko" ? currentQuestion.en : currentQuestion.ko,
        user: userAnswer,
        answer: correctAnswer,
        correct,
      },
    ]);
  }

  function goNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setScreen("result");
      return;
    }
    setupQuestion(testType, nextIndex, false);
  }

  return (
    <div className="app-shell">
      <header className="top-card">
        <div>
          <h1>영어 지문 테스트 웹앱</h1>
          <p>해석 배열, 영작 배열, 단어 테스트를 휴대폰에서 바로 사용할 수 있는 버전</p>
        </div>
        <div className="button-row">
          <button className="secondary" onClick={() => setScreen("home")}>홈</button>
          <button className="secondary" onClick={() => setScreen("register")}>지문 등록</button>
        </div>
      </header>

      {screen === "home" && (
        <div className="grid">
          <section className="card">
            <h2>등록된 지문</h2>
            {passages.map((passage) => (
              <div
                key={passage.id}
                className={`passage-item ${selectedPassageId === passage.id ? "selected" : ""}`}
              >
                <div>
                  <div className="passage-title">{passage.title}</div>
                  <div className="muted">문장 {passage.sentences.length}개, 단어 {passage.vocab.length}개</div>
                </div>
                <div className="button-row small">
                  <button className="secondary" onClick={() => setSelectedPassageId(passage.id)}>선택</button>
                  <button onClick={() => { setSelectedPassageId(passage.id); setTimeout(() => startTest("ko"), 0); }}>해석</button>
                  <button onClick={() => { setSelectedPassageId(passage.id); setTimeout(() => startTest("en"), 0); }}>영작</button>
                  <button onClick={() => { setSelectedPassageId(passage.id); setTimeout(() => startTest("vocab"), 0); }}>단어</button>
                </div>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>선택된 지문 미리보기</h2>
            {selectedPassage && (
              <>
                <div className="preview-title">{selectedPassage.title}</div>
                <div className="preview-list">
                  {selectedPassage.sentences.map((item, idx) => (
                    <div key={idx} className="preview-item">
                      <div className="en-line">{idx + 1}. {item.en}</div>
                      <div className="ko-line">{item.ko}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {screen === "register" && (
        <section className="card">
          <h2>지문 등록</h2>
          <p className="muted">영어와 한글은 반드시 한 줄에 한 문장씩, 같은 순서로 입력해 주세요.</p>
          <input
            className="text-input"
            placeholder="지문 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid">
            <textarea
              className="text-area"
              placeholder="영어 문장, 한 줄에 한 문장씩"
              value={englishText}
              onChange={(e) => setEnglishText(e.target.value)}
            />
            <textarea
              className="text-area"
              placeholder="한글 해석, 한 줄에 한 문장씩"
              value={koreanText}
              onChange={(e) => setKoreanText(e.target.value)}
            />
          </div>
          <textarea
            className="text-area vocab"
            placeholder="단어 | 정답뜻 | 오답뜻1 | 오답뜻2"
            value={vocabText}
            onChange={(e) => setVocabText(e.target.value)}
          />
          <div className="button-row">
            <button onClick={savePassage}>저장</button>
            <button
              className="secondary"
              onClick={() => {
                setTitle("");
                setEnglishText("");
                setKoreanText("");
                setVocabText("");
              }}
            >
              초기화
            </button>
          </div>
        </section>
      )}

      {screen === "test" && currentQuestion && (
        <section className="card">
          <div className="test-header">
            <h2>
              {testType === "ko" && "한글 해석 배열 테스트"}
              {testType === "en" && "영작 배열 테스트"}
              {testType === "vocab" && "단어 테스트"}
            </h2>
            <div className="muted">{currentIndex + 1} / {totalQuestions}</div>
          </div>

          <div className="question-box">
            {testType === "ko" && (
              <>
                <div className="label">영어 문장</div>
                <div className="question-text">{currentQuestion.en}</div>
              </>
            )}
            {testType === "en" && (
              <>
                <div className="label">한글 해석</div>
                <div className="question-text">{currentQuestion.ko}</div>
              </>
            )}
            {testType === "vocab" && (
              <>
                <div className="label">중요 단어</div>
                <div className="question-text">{currentQuestion.word}</div>
              </>
            )}
          </div>

          <div className="answer-box">
            <div className="label">내 답안</div>
            <div className="chips">
              {answerTray.length === 0 && <span className="muted">아래 보기 조각을 눌러 답을 만드세요.</span>}
              {answerTray.map((piece, idx) => (
                <button key={`${piece}-${idx}`} className="chip selected-chip" onClick={() => pickPiece(piece, false)}>
                  {piece}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label">보기</div>
            <div className="chips">
              {pool.map((piece, idx) => (
                <button key={`${piece}-${idx}`} className="chip" onClick={() => pickPiece(piece, true)}>
                  {piece}
                </button>
              ))}
            </div>
          </div>

          <div className="button-row">
            <button onClick={submitAnswer}>정답 확인</button>
            <button className="secondary" onClick={resetCurrentQuestion}>다시 섞기</button>
          </div>

          {feedback && (
            <div className={`feedback ${feedback}`}>
              <strong>{feedback === "correct" ? "정답입니다." : "오답입니다."}</strong>
              {feedback === "wrong" && (
                <div className="feedback-answer">
                  정답: {testType === "vocab" ? currentQuestion.answer : (testType === "ko" ? currentQuestion.ko : currentQuestion.en)}
                </div>
              )}
              <div className="button-row">
                <button onClick={goNext}>다음 문제</button>
              </div>
            </div>
          )}
        </section>
      )}

      {screen === "result" && (
        <section className="card">
          <h2>테스트 결과</h2>
          <div className="score-box">{score} / {totalQuestions}</div>
          <div className="preview-list">
            {resultLog.map((item, idx) => (
              <div key={idx} className="preview-item">
                <div><strong>{idx + 1}번</strong> {item.correct ? "정답" : "오답"}</div>
                <div className="muted">문제: {item.prompt}</div>
                <div className="muted">내 답: {item.user}</div>
                <div className="muted">정답: {item.answer}</div>
              </div>
            ))}
          </div>
          <div className="button-row">
            <button onClick={() => startTest(testType)}>다시 풀기</button>
            <button className="secondary" onClick={() => setScreen("home")}>홈으로</button>
          </div>
        </section>
      )}
    </div>
  );
}
