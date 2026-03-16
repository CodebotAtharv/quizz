const previewQuestions = [
  { number: 1, text: "I like wasting paper", counter: "1/50", selected: 0 },
  { number: 2, text: "I hate littering", counter: "2/50", selected: 3 }
];

const assessmentQuestions = [
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

const options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const traitDefinitions = [
  { id: "open_mindedness", label: "Open-mindness", indexes: [0, 1] },
  { id: "conscientiousness", label: "Conscientiousness", indexes: [2, 3] },
  { id: "extraversion", label: "Extraversion", indexes: [4, 5] },
  { id: "agreeableness", label: "Agreeableness", indexes: [6, 7] },
  { id: "negative_emotionality", label: "Negative Emotionality", indexes: [8, 9] }
];

const selectedValues = new Array(assessmentQuestions.length).fill(null);

const landingPage = document.querySelector(".landing-page");
const footer = document.querySelector(".footer");
const assessmentPage = document.getElementById("assessmentPage");
const resultPage = document.getElementById("resultPage");
const loginPage = document.getElementById("loginPage");
const signupPage = document.getElementById("signupPage");
const previewQuestionsContainer = document.getElementById("previewQuestions");
const assessmentQuestionsContainer = document.getElementById("assessmentQuestions");
const testPreviewSection = document.getElementById("test-preview");
const scrollButtons = document.querySelectorAll(".js-scroll-test");
const homeTriggers = document.querySelectorAll(".js-home-trigger");
const navLoginBtn = document.getElementById("navLoginBtn");
const assessmentBackBtn = document.getElementById("assessmentBackBtn");
const assessmentNextBtn = document.getElementById("assessmentNextBtn");
const toSignupBtn = document.getElementById("toSignupBtn");
const toLoginBtn = document.getElementById("toLoginBtn");
const resultArchetype = document.getElementById("resultArchetype");
const resultSubcopy = document.getElementById("resultSubcopy");
const resultChart = document.getElementById("resultChart");
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmStayBtn = document.getElementById("confirmStayBtn");
const confirmLeaveBtn = document.getElementById("confirmLeaveBtn");

let pendingNavigation = null;

function createOption(label, index, selectedIndex, classNamePrefix) {
  const option = document.createElement("div");
  option.className = `${classNamePrefix}-option`;
  if (index === selectedIndex) {
    option.classList.add("is-selected");
  }

  const mark = document.createElement("span");
  mark.className = `${classNamePrefix}-option-mark`;
  mark.textContent = index === selectedIndex ? "✓" : "";

  const text = document.createElement("span");
  text.textContent = label;

  option.append(mark, text);
  return option;
}

function createOptionMark(classNamePrefix, selected) {
  const mark = document.createElement("span");
  mark.className = `${classNamePrefix}-option-mark`;
  mark.textContent = selected ? "✓" : "";
  return mark;
}

function renderPreviewQuestions() {
  previewQuestionsContainer.innerHTML = "";
  previewQuestions.forEach((question) => {
    const card = document.createElement("article");
    card.className = "preview-question";

    const head = document.createElement("div");
    head.className = "preview-head";

    const titleWrap = document.createElement("div");
    const number = document.createElement("p");
    number.className = "preview-number";
    number.textContent = `${question.number}.`;

    const text = document.createElement("p");
    text.className = "preview-text";
    text.textContent = question.text;

    const counter = document.createElement("p");
    counter.className = "preview-counter";
    counter.textContent = question.counter;

    titleWrap.append(number, text);
    head.append(titleWrap, counter);

    const optionsRow = document.createElement("div");
    optionsRow.className = "preview-options";
    options.forEach((label, index) => {
      optionsRow.append(createOption(label, index, question.selected, "preview"));
    });

    card.append(head, optionsRow);
    previewQuestionsContainer.append(card);
  });
}

function createAssessmentCard(question, index) {
  const card = document.createElement("article");
  card.className = "assessment-question-card";

  const head = document.createElement("div");
  head.className = "assessment-question-head";

  const left = document.createElement("div");
  const number = document.createElement("p");
  number.className = "assessment-question-index";
  number.textContent = `${index + 1}.`;

  const text = document.createElement("p");
  text.className = "assessment-question-text";
  text.textContent = question;

  left.append(number, text);

  const progress = document.createElement("p");
  progress.className = "assessment-question-progress";
  progress.textContent = `${index + 1}/10`;

  head.append(left, progress);

  const optionsRow = document.createElement("div");
  optionsRow.className = "assessment-options";

  options.forEach((label, optionIndex) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "assessment-option";
    option.append(createOptionMark("assessment", selectedValues[index] === optionIndex));

    const textSpan = document.createElement("span");
    textSpan.textContent = label;
    option.append(textSpan);

    if (selectedValues[index] === optionIndex) {
      option.classList.add("is-selected");
    }

    option.addEventListener("click", () => {
      selectedValues[index] = optionIndex;
      renderAssessmentQuestions();
    });

    optionsRow.append(option);
  });

  card.append(head, optionsRow);
  return card;
}

function renderAssessmentQuestions() {
  assessmentQuestionsContainer.innerHTML = "";
  assessmentQuestions.forEach((question, index) => {
    assessmentQuestionsContainer.append(createAssessmentCard(question, index));
  });
}

function getTraitScores() {
  return traitDefinitions.map((trait) => {
    const score = trait.indexes.reduce((sum, questionIndex) => {
      const value = selectedValues[questionIndex];
      return sum + (value === null ? 0 : value);
    }, 0);

    return { ...trait, score };
  });
}

function getArchetype(scores) {
  const answered = selectedValues.filter((value) => value !== null).length;
  if (!answered) {
    return { title: "Analyzing...", copy: "Loading..." };
  }

  const strongest = scores.reduce((best, current) => (current.score > best.score ? current : best), scores[0]);
  const names = {
    open_mindedness: "Explorer",
    conscientiousness: "Organizer",
    extraversion: "Connector",
    agreeableness: "Mediator",
    negative_emotionality: "Reflector"
  };

  return {
    title: names[strongest.id] || "Balanced",
    copy: `Based on ${answered} answered question${answered > 1 ? "s" : ""}`
  };
}

function renderResultChart(scores) {
  resultChart.innerHTML = "";
  scores.forEach((trait) => {
    const col = document.createElement("div");
    col.className = "result-chart-col";

    const value = document.createElement("p");
    value.className = "result-chart-value";
    value.textContent = String(trait.score);

    const bar = document.createElement("div");
    bar.className = "result-chart-bar";
    bar.style.height = `${Math.min(86, (trait.score / 8) * 86)}px`;

    const line = document.createElement("div");
    line.className = "result-chart-line";

    const label = document.createElement("p");
    label.className = "result-chart-label";
    label.textContent = trait.label;

    col.append(value, bar, line, label);
    resultChart.append(col);
  });
}

function showLanding() {
  landingPage.classList.remove("is-hidden");
  footer.classList.remove("is-hidden");
  assessmentPage.classList.add("is-hidden");
  resultPage.classList.add("is-hidden");
  loginPage.classList.add("is-hidden");
  signupPage.classList.add("is-hidden");
}

function showAssessment() {
  landingPage.classList.add("is-hidden");
  footer.classList.add("is-hidden");
  resultPage.classList.add("is-hidden");
  loginPage.classList.add("is-hidden");
  signupPage.classList.add("is-hidden");
  assessmentPage.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showResult() {
  const scores = getTraitScores();
  const archetype = getArchetype(scores);

  resultArchetype.textContent = archetype.title;
  resultSubcopy.textContent = archetype.copy;
  renderResultChart(scores);

  assessmentPage.classList.add("is-hidden");
  resultPage.classList.remove("is-hidden");
  loginPage.classList.add("is-hidden");
  signupPage.classList.add("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showLogin() {
  landingPage.classList.add("is-hidden");
  footer.classList.add("is-hidden");
  assessmentPage.classList.add("is-hidden");
  resultPage.classList.add("is-hidden");
  signupPage.classList.add("is-hidden");
  loginPage.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSignup() {
  landingPage.classList.add("is-hidden");
  footer.classList.add("is-hidden");
  assessmentPage.classList.add("is-hidden");
  resultPage.classList.add("is-hidden");
  loginPage.classList.add("is-hidden");
  signupPage.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function currentViewNeedsConfirmation() {
  return !assessmentPage.classList.contains("is-hidden") || !resultPage.classList.contains("is-hidden");
}

function openConfirm(action) {
  pendingNavigation = action;
  confirmOverlay.classList.remove("is-hidden");
}

function closeConfirm() {
  pendingNavigation = null;
  confirmOverlay.classList.add("is-hidden");
}

function navigateHomeWithGuard() {
  if (currentViewNeedsConfirmation()) {
    openConfirm(showLanding);
    return;
  }

  showLanding();
}

function handleAssessmentBack() {
  openConfirm(showLanding);
}

function scrollToTestPreview() {
  showAssessment();
}

scrollButtons.forEach((button) => {
  button.addEventListener("click", scrollToTestPreview);
});

homeTriggers.forEach((trigger) => {
  trigger.addEventListener("click", navigateHomeWithGuard);
});

navLoginBtn.addEventListener("click", showLogin);
assessmentBackBtn.addEventListener("click", handleAssessmentBack);
assessmentNextBtn.addEventListener("click", showResult);
toSignupBtn.addEventListener("click", showSignup);
toLoginBtn.addEventListener("click", showLogin);
confirmStayBtn.addEventListener("click", closeConfirm);
confirmLeaveBtn.addEventListener("click", () => {
  if (pendingNavigation) {
    const action = pendingNavigation;
    closeConfirm();
    action();
  }
});

renderPreviewQuestions();
renderAssessmentQuestions();
