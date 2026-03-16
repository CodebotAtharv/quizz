const questions = [
  "I enjoy trying new experiences even if they feel unfamiliar.",
  "I prefer sticking to familiar routines rather than experimenting.",
  "I plan my tasks before starting them.",
  "I often leave tasks unfinished.",
  "I feel energized after social interactions.",
  "I prefer spending most of my time alone.",
  "I try to avoid conflict and maintain harmony.",
  "I prioritize my own needs over others, even if it upsets them.",
  "I tend to overthink situations.",
  "I get stressed easily."
];

const options = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
];

const selectedValues = new Array(questions.length).fill(null);
const questionsContainer = document.getElementById("questionsContainer");
const quizPage = document.getElementById("quizPage");
const resultPage = document.getElementById("resultPage");
const nextPageBtn = document.getElementById("nextPageBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const archetypeTitle = document.getElementById("archetypeTitle");
const archetypeSub = document.getElementById("archetypeSub");
const traitChart = document.getElementById("traitChart");

const traitDefinitions = [
  { id: "open_mindedness", label: "Open-mindedness", questions: [0, 1] },
  { id: "conscientiousness", label: "Conscientiousness", questions: [2, 3] },
  { id: "extraversion", label: "Extraversion", questions: [4, 5] },
  { id: "agreeableness", label: "Agreeableness", questions: [6, 7] },
  { id: "negative_emotionality", label: "Negative Emotionality", questions: [8, 9] }
];

function getTraitScores() {
  return traitDefinitions.map((trait) => {
    const rawScore = trait.questions.reduce((sum, questionIndex) => {
      const answer = selectedValues[questionIndex];
      if (answer === null) {
        return sum;
      }
      return sum + answer;
    }, 0);

    return {
      ...trait,
      score: rawScore
    };
  });
}

function getArchetype(scores) {
  const totalAnswered = selectedValues.filter((value) => value !== null).length;

  if (totalAnswered === 0) {
    return {
      title: "Analyzing...",
      subtitle: "Loading..."
    };
  }

  const topTrait = scores.reduce((best, current) => {
    if (!best || current.score > best.score) {
      return current;
    }
    return best;
  }, null);

  const archetypeMap = {
    open_mindedness: "Explorer",
    conscientiousness: "Organizer",
    extraversion: "Connector",
    agreeableness: "Mediator",
    negative_emotionality: "Reflector"
  };

  return {
    title: archetypeMap[topTrait.id] || "Balanced",
    subtitle: `Based on ${totalAnswered} answered question${totalAnswered > 1 ? "s" : ""}`
  };
}

function renderTraitChart(scores) {
  traitChart.innerHTML = "";

  scores.forEach((trait) => {
    const col = document.createElement("div");
    col.className = "trait-col";

    const value = document.createElement("p");
    value.className = "trait-value";
    value.textContent = String(trait.score);

    const bar = document.createElement("div");
    bar.className = "trait-bar";
    bar.style.height = `${Math.min(90, (trait.score / 8) * 90)}px`;

    const base = document.createElement("div");
    base.className = "trait-base";

    const name = document.createElement("p");
    name.className = "trait-name";
    name.textContent = trait.label;

    col.append(value, bar, base, name);
    traitChart.appendChild(col);
  });
}

function createChoiceButton(label, optionIndex, questionIndex) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "choice-btn";
  button.innerHTML = `<span class="choice-icon" aria-hidden="true">↺</span><span>${label}</span>`;
  button.setAttribute("aria-pressed", "false");

  if (selectedValues[questionIndex] === optionIndex) {
    button.classList.add("is-selected");
    button.setAttribute("aria-pressed", "true");
  }

  button.addEventListener("click", () => {
    selectedValues[questionIndex] = optionIndex;
    renderQuestions();
  });

  return button;
}

function createQuestionCard(questionText, index) {
  const card = document.createElement("article");
  card.className = "question-card";

  const head = document.createElement("div");
  head.className = "question-head";

  const titleBlock = document.createElement("div");
  const title = document.createElement("p");
  title.className = "question-title";
  title.textContent = `${index + 1}.`;

  const text = document.createElement("p");
  text.className = "question-text";
  text.textContent = questionText;

  titleBlock.append(title, text);

  const counter = document.createElement("p");
  counter.className = "counter";
  counter.textContent = `${index + 1}/10`;

  head.append(titleBlock, counter);

  const row = document.createElement("div");
  row.className = "choice-row";

  options.forEach((label, optionIndex) => {
    row.appendChild(createChoiceButton(label, optionIndex, index));
  });

  card.append(head, row);
  return card;
}

function renderQuestions() {
  questionsContainer.innerHTML = "";
  questions.forEach((question, index) => {
    questionsContainer.appendChild(createQuestionCard(question, index));
  });
}

function showResultPage() {
  const scores = getTraitScores();
  const archetype = getArchetype(scores);
  archetypeTitle.textContent = archetype.title;
  archetypeSub.textContent = archetype.subtitle;
  renderTraitChart(scores);

  quizPage.classList.add("is-hidden");
  resultPage.classList.remove("is-hidden");
}

function showQuizPage() {
  resultPage.classList.add("is-hidden");
  quizPage.classList.remove("is-hidden");
}

nextPageBtn.addEventListener("click", showResultPage);
prevPageBtn.addEventListener("click", showQuizPage);

renderQuestions();
