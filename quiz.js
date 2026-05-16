
const supabaseUrl = "https://sueyklcinseiwdnsibwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZXlrbGNpbnNlaXdkbnNpYnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODg2ODAsImV4cCI6MjA5MjU2NDY4MH0.tRMTfczL7R9L5DVSoAxGcB8FYwbuHFCwprReZNN14Uw";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);


const questionTypes = [
  "normal", "reverse",   // O
  "normal", "reverse",   // C
  "normal", "reverse",   // E
  "normal", "reverse",   // A
  "normal", "reverse"    // N
];

document.querySelector("#signupPage .auth-submit")
  .addEventListener("click", async () => {
    const email = document.querySelector("#signupPage input[type='email']").value;
    const password = document.querySelector("#signupPage input[type='password']").value;

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful! Please login.");

      // 👉 go to login page
      showLogin();

      // 👉 prefill email
      const loginEmailInput = document.querySelector("#loginPage input[type='email']");
      if (loginEmailInput) {
        loginEmailInput.value = email;
      }
    }
});

document.querySelector("#loginPage .auth-submit")
  .addEventListener("click", async () => {
    const email = document.querySelector("#loginPage input[type='email']").value;
    const password = document.querySelector("#loginPage input[type='password']").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
    } else {
      // ✅ store user
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ update navbar to logout
      if (navLoginBtn) {
        navLoginBtn.textContent = "Logout";
        navLoginBtn.onclick = logout;
      }

      console.log("Logged in as:", data.user.email);

      showLanding();
    }
});

const weights = [10, 20, 30, 40, 50];
const reverseWeights = [50, 40, 30, 20, 10];

let visibleQuestionIndex = 0;

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

  // ✅ ICON
  const icon = document.createElement("img");
  icon.src = `assets/icons/icon-${optionIndex}.svg`; // name your icons like icon-0.svg, icon-1.svg etc
  icon.className = "option-icon";

  // ✅ TEXT
  const textSpan = document.createElement("span");
  textSpan.textContent = label;

  option.append(icon, textSpan);

  if (selectedValues[index] === optionIndex) {
    option.classList.add("is-selected");
  }
 
  option.addEventListener("click", () => {
  if (option.classList.contains("is-selected")) return;

  const parent = option.closest(".assessment-question-card");

  // remove previous selection
  parent.querySelectorAll(".assessment-option")
    .forEach(btn => btn.classList.remove("is-selected"));

  // apply selection
  option.classList.add("is-selected");

  const type = questionTypes[index];

  const score = type === "reverse"
    ? reverseWeights[optionIndex]
    : weights[optionIndex];

  selectedValues[index] = score;

  setTimeout(() => {
    parent.querySelectorAll(".assessment-option")
      .forEach(btn => btn.disabled = true);

    if (index === visibleQuestionIndex) {
      if (visibleQuestionIndex < assessmentQuestions.length - 1) {
        visibleQuestionIndex++;

        const nextCard = createAssessmentCard(
          assessmentQuestions[visibleQuestionIndex],
          visibleQuestionIndex
        );

        assessmentQuestionsContainer.append(nextCard);

        // focus
        document.querySelectorAll(".assessment-question-card")
          .forEach(card => card.classList.remove("is-active"));
        nextCard.classList.add("is-active");

        setTimeout(() => {
          nextCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);

      } else {
        setTimeout(() => {
          showResult();
        }, 300);
      }
    }
  }, 200);
});

optionsRow.append(option);
});

card.append(head, optionsRow);
return card;
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

const archetypeData = {
  "Creative Leader": {
    copy: "You combine vision with action. You explore new ideas and inspire others to move forward with confidence."
  },
  "Thoughtful Strategist": {
    copy: "You think deeply before acting. Your strength lies in planning, clarity, and long-term thinking."
  },
  "Visionary": {
    copy: "You see possibilities others miss. You’re driven by curiosity and imagination."
  },
  "Achiever": {
    copy: "You are goal-driven and energetic. You thrive on progress, performance, and results."
  },
  "Reliable Supporter": {
    copy: "You bring stability and trust. People rely on your consistency and care."
  },
  "Architect": {
    copy: "You build systems that work. Structured, disciplined, and precise."
  },
  "Catalyst": {
    copy: "You spark energy in people and situations. You initiate movement and bring momentum."
  },
  "Deep Empath": {
    copy: "You feel deeply and connect emotionally. You understand others at a core level."
  },
  "Harmonizer": {
    copy: "You maintain balance and peace. You value relationships and emotional stability."
  },
  "Reflective Mind": {
    copy: "You think inwardly and analyze deeply. You grow through introspection."
  },
  "Balanced Profile": {
    copy: "You show a balanced personality across traits. Adaptable and steady."
  },
  "Integrated Individual": {
    copy: "You maintain harmony across traits while still showing clear tendencies."
  }
};

function getArchetype(scores) {
  const map = {};
  scores.forEach(s => map[s.id] = s.score);

  const O = map.open_mindedness;
  const C = map.conscientiousness;
  const E = map.extraversion;
  const A = map.agreeableness;
  const N = map.negative_emotionality;

  // 🔹 GLOBAL CONDITIONS
  if (O <= 40 && C <= 40 && E <= 40 && A <= 40 && N <= 40) {
    return {
      title: "Balanced Profile",
      copy: archetypeData["Balanced Profile"].copy
    };
  }

  if (O <= 70 && C <= 70 && E <= 70 && A <= 70 && N <= 70) {
    return {
      title: "Integrated Individual",
      copy: archetypeData["Integrated Individual"].copy
    };
  }

  // 🔹 FIND DOMINANT
  const traits = [
    { id: 1, value: O },
    { id: 2, value: C },
    { id: 3, value: E },
    { id: 4, value: A },
    { id: 5, value: N }
  ];

  let dominant = traits.reduce((max, t) =>
    t.value > max.value ? t : max
  ).id;

  // 🔹 CONDITIONAL LOGIC

  if (dominant === 1) {
    if (E >= 70) {
      return {
        title: "Creative Leader",
        copy: archetypeData["Creative Leader"].copy
      };
    } else if (C >= 70) {
      return {
        title: "Thoughtful Strategist",
        copy: archetypeData["Thoughtful Strategist"].copy
      };
    } else {
      return {
        title: "Visionary",
        copy: archetypeData["Visionary"].copy
      };
    }
  }

  if (dominant === 2) {
    if (E >= 70) {
      return {
        title: "Achiever",
        copy: archetypeData["Achiever"].copy
      };
    } else if (A >= 70) {
      return {
        title: "Reliable Supporter",
        copy: archetypeData["Reliable Supporter"].copy
      };
    } else {
      return {
        title: "Architect",
        copy: archetypeData["Architect"].copy
      };
    }
  }

  if (dominant === 3) {
    if (O >= 70) {
      return {
        title: "Creative Leader",
        copy: archetypeData["Creative Leader"].copy
      };
    } else if (C >= 70) {
      return {
        title: "Achiever",
        copy: archetypeData["Achiever"].copy
      };
    } else {
      return {
        title: "Catalyst",
        copy: archetypeData["Catalyst"].copy
      };
    }
  }

  if (dominant === 4) {
    if (C >= 70) {
      return {
        title: "Reliable Supporter",
        copy: archetypeData["Reliable Supporter"].copy
      };
    } else if (N >= 70) {
      return {
        title: "Deep Empath",
        copy: archetypeData["Deep Empath"].copy
      };
    } else {
      return {
        title: "Harmonizer",
        copy: archetypeData["Harmonizer"].copy
      };
    }
  }

  if (dominant === 5) {
    if (A >= 70) {
      return {
        title: "Deep Empath",
        copy: archetypeData["Deep Empath"].copy
      };
    } else {
      return {
        title: "Reflective Mind",
        copy: archetypeData["Reflective Mind"].copy
      };
    }
  }

  return {
    title: "Balanced",
    copy: "Your personality shows a mix of traits."
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
    bar.style.height = `${(trait.score / 100) * 86}px`;

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

  visibleQuestionIndex = 0;
  selectedValues.fill(null);

  assessmentQuestionsContainer.innerHTML = "";

  const firstCard = createAssessmentCard(assessmentQuestions[0], 0);
  assessmentQuestionsContainer.append(firstCard);

  // ✅ NOW safe
  firstCard.classList.add("is-active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function showResult() {
  const scores = getTraitScores();
  const archetype = getArchetype(scores);

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  resultArchetype.textContent = archetype.title;
  resultSubcopy.innerHTML = archetype.copy.replace(/\n/g, "<br>");
  const traitInsight = document.getElementById("traitInsight");
if (traitInsight) {
  traitInsight.textContent =
    `Highest: ${strongest.label} • Lowest: ${weakest.label}`;
}
  renderResultChart(scores);
  renderRadarChart(scores);
  renderPolarChart(scores);

  // ✅ OPTIONAL SAVE (only if logged in)
  const { data } = await supabaseClient.auth.getSession();
  const user = data.session?.user;

  if (user) {
    await supabaseClient.from("results").insert([
      {
        user_id: user.id,
        archetype: archetype.title,
        scores: scores
      }
    ]);
    console.log("Result saved");
  } else {
    console.log("No user → result not saved");
  }

  assessmentPage.classList.add("is-hidden");
  resultPage.classList.remove("is-hidden");
  setTimeout(() => {
  renderRadarChart(scores);
  renderPolarChart(scores);
}, 100);
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

const backBtn = document.querySelector(".quiz-back-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => showLanding());
}

if (navLoginBtn) {
  navLoginBtn.addEventListener("click", showLogin);
}  
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

  document.getElementById("retryBtn")
  .addEventListener("click", showAssessment);

document.getElementById("homeBtn")
  .addEventListener("click", showLanding);

supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) {
    const user = data.session.user;

    console.log("User logged in:", user.email);

    if (navLoginBtn) {
      navLoginBtn.textContent = "Logout";
      navLoginBtn.onclick = logout;
    }
  }
});

async function logout() {
  await supabaseClient.auth.signOut();
  localStorage.removeItem("user");

  if (navLoginBtn) {
    navLoginBtn.textContent = "Log In";
    navLoginBtn.onclick = showLogin;
  }

  alert("Logged out");
}

function renderRadarChart(scores) {
  const canvas = document.getElementById("radarChart");
  const ctx = canvas.getContext("2d");

  if (window.radarInstance) {
    window.radarInstance.destroy();
  }

  const labels = scores.map(s => s.label);
  const data = scores.map(s => s.score);

  window.radarInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        fill: true,
        backgroundColor: "rgba(0, 0, 0, 0.08)",   // soft fill
        borderColor: "#000",                     // clean black line
        borderWidth: 1.5,
        pointBackgroundColor: "#000",
        pointRadius: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          min: 0,
          max: 100,

          // 🔥 GRID STYLE
          grid: {
            color: "rgba(0,0,0,0.1)"
          },

          angleLines: {
            color: "rgba(0,0,0,0.15)"
          },

          // 🔥 LABEL STYLE
          pointLabels: {
            color: "#000",
            font: {
              size: 10,
              family: "Playfair Display"
            }
          },

          ticks: {
            display: false
          }
        }
      }
    }
  });
}

/* ============================= */
/* POLAR CHART */
/* ============================= */

function renderPolarChart(scores) {
  const canvas = document.getElementById("polarChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  if (window.polarInstance) {
    window.polarInstance.destroy();
  }

  const labels = scores.map(s => s.label);
  const data = scores.map(s => s.score);

  window.polarInstance = new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "rgba(0,0,0,0.08)",
          "rgba(0,0,0,0.15)",
          "rgba(0,0,0,0.22)",
          "rgba(0,0,0,0.3)",
          "rgba(0,0,0,0.4)"
        ],
        borderColor: "#000",
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#000",
            font: {
              size: 10,
              family: "Playfair Display"
            }
          }
        }
      },
      scales: {
        r: {
          ticks: { display: false },
          grid: { color: "rgba(0,0,0,0.1)" },
          angleLines: { color: "rgba(0,0,0,0.1)" }
        }
      }
    }
  });
}