(function () {
  "use strict";

  // Kleine hulpfunctie: tekst normaliseren (kleine letters, geen accenten, geen extra spaties).
  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Alle vragen. type: "date" | "choice" | "text" | "number"
  var QUESTIONS = [
    {
      text: "Sinds wanneer zijn we al samen? 💑",
      type: "date",
      correct: "2023-12-16",
      display: "16/12/2023",
    },
    {
      text: "Wat was onze eerste date? ☕",
      type: "choice",
      options: [
        "Een warme choco op de Grote Markt in Hasselt",
        "Een pizza delen in Genk",
        "Een filmpje in de Kinepolis",
        "Een wandeling in de Japanse Tuin",
        "Schaatsen op Winterland",
      ],
      correct: "Een warme choco op de Grote Markt in Hasselt",
      display: "Een warme choco op de Grote Markt in Hasselt",
    },
    {
      text: "Wanneer is Zilleke geboren? 🎂",
      type: "date",
      correct: "2004-11-23",
      display: "23/11/2004",
    },
    {
      text: "In welk land was onze laatste week vakantie? ✈️",
      type: "text",
      placeholder: "Typ hier het land…",
      accept: ["spanje", "spain", "espana"],
      display: "Spanje",
    },
    {
      text: "Hoeveel op 100 hou je van je protmachine? 💗",
      type: "number",
      placeholder: "Een getal…",
      min: 100,
      display: "100 (of alles erboven!)",
    },
    {
      text: "Wie is naast Ruby mijn favoriete man op aarde? 👨",
      type: "text",
      placeholder: "Typ hier je antwoord…",
      accept: ["papa", "pa", "vader", "papi", "mijn papa", "jouw papa"],
      contains: "papa",
      display: "Papa",
    },
    {
      text: "Wie heeft de broek aan in de relatie? 👖",
      type: "choice",
      options: ["Ruby", "Zilleke"],
      correct: "Zilleke",
      display: "Zilleke (uiteraard 😌)",
    },
  ];

  function isCorrect(q, answer) {
    switch (q.type) {
      case "date":
      case "choice":
        return answer === q.correct;
      case "number":
        return Number(answer) >= q.min;
      case "text":
        var n = normalize(answer);
        if (q.accept.map(normalize).indexOf(n) !== -1) return true;
        return q.contains ? n.split(" ").indexOf(q.contains) !== -1 : false;
      default:
        return false;
    }
  }

  function formatAnswer(q, answer) {
    if (q.type === "date" && /^\d{4}-\d{2}-\d{2}$/.test(answer)) {
      var p = answer.split("-");
      return p[2] + "/" + p[1] + "/" + p[0];
    }
    return answer;
  }

  // ---------- DOM ----------
  var $ = function (id) { return document.getElementById(id); };
  var screens = {
    start: $("screen-start"),
    question: $("screen-question"),
    result: $("screen-result"),
  };
  var form = $("answer-form");
  var area = $("answer-area");
  var hint = $("hint");

  var current = 0;
  var answers = [];

  function show(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle("active", key === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderProgress() {
    var html = "";
    for (var i = 0; i < QUESTIONS.length; i++) {
      var cls = i < current ? "done" : i === current ? "current" : "";
      html += '<span class="' + cls + '">❤️</span>';
    }
    $("progress").innerHTML = html;
    $("counter").textContent = "Vraag " + (current + 1) + " van " + QUESTIONS.length;
  }

  function renderQuestion() {
    var q = QUESTIONS[current];
    renderProgress();
    $("question-text").textContent = q.text;
    hint.textContent = "";
    area.innerHTML = "";

    if (q.type === "choice") {
      var wrap = document.createElement("div");
      wrap.className = "options";
      wrap.setAttribute("role", "radiogroup");
      var opts = q.options.length > 2 ? shuffle(q.options) : q.options;
      opts.forEach(function (opt) {
        var label = document.createElement("label");
        label.className = "option";
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "choice";
        input.value = opt;
        var dot = document.createElement("span");
        dot.className = "dot";
        dot.textContent = "💗";
        var txt = document.createElement("span");
        txt.textContent = opt;
        label.appendChild(input);
        label.appendChild(dot);
        label.appendChild(txt);
        wrap.appendChild(label);
      });
      area.appendChild(wrap);
    } else {
      var field = document.createElement("input");
      field.className = "text-input";
      field.name = "answer";
      field.id = "answer-input";
      field.setAttribute("aria-label", q.text);
      if (q.type === "date") {
        field.type = "date";
      } else if (q.type === "number") {
        field.type = "number";
        field.inputMode = "numeric";
        field.placeholder = q.placeholder;
      } else {
        field.type = "text";
        field.placeholder = q.placeholder;
      }
      area.appendChild(field);
      setTimeout(function () { field.focus(); }, 50);
    }

    $("next-btn").textContent =
      current === QUESTIONS.length - 1 ? "Bekijk mijn score 💖" : "Volgende 💌";
  }

  function readAnswer() {
    var q = QUESTIONS[current];
    if (q.type === "choice") {
      var checked = form.querySelector('input[name="choice"]:checked');
      return checked ? checked.value : "";
    }
    return $("answer-input").value.trim();
  }

  function burst(x) {
    var bg = document.querySelector(".hearts-bg");
    for (var i = 0; i < 8; i++) spawnHeart(bg, x + (Math.random() * 80 - 40));
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var answer = readAnswer();
    if (!answer) {
      hint.textContent = "Oei, je bent iets vergeten in te vullen 🙈";
      return;
    }
    answers[current] = answer;
    var rect = $("next-btn").getBoundingClientRect();
    burst(rect.left + rect.width / 2);
    current++;
    if (current < QUESTIONS.length) {
      renderQuestion();
    } else {
      showResult();
    }
  });

  function showResult() {
    var score = 0;
    var review = $("review");
    review.innerHTML = "";

    QUESTIONS.forEach(function (q, i) {
      var ok = isCorrect(q, answers[i]);
      if (ok) score++;
      var li = document.createElement("li");
      li.className = ok ? "" : "wrong";
      var qs = document.createElement("span");
      qs.className = "q";
      qs.textContent = (ok ? "✅ " : "❌ ") + q.text;
      var as = document.createElement("span");
      as.className = "a";
      as.textContent = ok
        ? "Jij zei: " + formatAnswer(q, answers[i])
        : "Jij zei: " + formatAnswer(q, answers[i]) + " · Juist was: " + q.display;
      li.appendChild(qs);
      li.appendChild(as);
      review.appendChild(li);
    });

    $("result-text").innerHTML =
      "Je had <strong>" + score + "</strong> " + (score === 1 ? "vraag" : "vragen") +
      " juist! Je hebt nu recht op <strong>" + score + " maal 100 kusjes</strong> van je madammeke! 😘";

    var kisses = $("kisses");
    kisses.innerHTML = "";
    var count = Math.max(score, 1);
    for (var k = 0; k < count; k++) {
      var s = document.createElement("span");
      s.textContent = score ? "💋" : "🥺";
      s.style.animationDelay = k * 0.12 + "s";
      kisses.appendChild(s);
    }

    show("result");
    celebrate();
  }

  // ---------- Hartjes ----------
  var HEARTS = ["💖", "💕", "💗", "💓", "💞", "❤️", "🩷", "💘"];

  function spawnHeart(container, xPx) {
    var span = document.createElement("span");
    span.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    var size = 16 + Math.random() * 26;
    var duration = 6 + Math.random() * 6;
    span.style.fontSize = size + "px";
    span.style.left = xPx != null ? xPx + "px" : Math.random() * 100 + "vw";
    span.style.animationDuration = duration + "s";
    container.appendChild(span);
    setTimeout(function () { span.remove(); }, duration * 1000);
  }

  function celebrate() {
    var bg = document.querySelector(".hearts-bg");
    for (var i = 0; i < 40; i++) {
      setTimeout(function () { spawnHeart(bg); }, i * 60);
    }
  }

  (function startBackground() {
    var bg = document.querySelector(".hearts-bg");
    for (var i = 0; i < 6; i++) spawnHeart(bg);
    setInterval(function () { spawnHeart(bg); }, 900);
  })();

  // ---------- Knoppen ----------
  $("start-btn").addEventListener("click", function () {
    current = 0;
    answers = [];
    renderQuestion();
    show("question");
  });

  $("restart-btn").addEventListener("click", function () {
    current = 0;
    answers = [];
    renderQuestion();
    show("question");
  });
})();
