const openWriteModalBtn = document.getElementById("openWriteModal");
const closeWriteModalBtn = document.getElementById("closeWriteModal");
const writeModal = document.getElementById("writeModal");

const closeReadModalBtn = document.getElementById("closeReadModal");
const readModal = document.getElementById("readModal");

const typeButtons = document.querySelectorAll(".type-btn");
const wishInput = document.getElementById("wishInput");
const charCount = document.getElementById("charCount");
const submitWishBtn = document.getElementById("submitWish");

const wishStars = document.getElementById("wishStars");
const skyStars = document.getElementById("skyStars");
const bottleWrapper = document.getElementById("bottleWrapper");

const noteCard = document.getElementById("noteCard");
const totalCount = document.getElementById("totalCount");
const realizedCount = document.getElementById("realizedCount");

const readType = document.getElementById("readType");
const readContent = document.getElementById("readContent");
const readTime = document.getElementById("readTime");
const realizeWishBtn = document.getElementById("realizeWish");
const clearAllBtn = document.getElementById("clearAll");

let selectedType = "愿望";
let selectedWishId = null;
let lastStarColor = null;

const colors = [
  "#ffd938", // 蜡笔黄
  "#ffb703", // 暖橙黄
  "#ff8941", // 橙色
  "#ff6b6b", // 珊瑚红
  "#ea5757", // 红色
  "#f48ac8", // 粉色
  "#ff9fd6", // 浅粉
  "#c77dff", // 紫色
  "#9b7ce8", // 蓝紫
  "#7b61ff", // 深紫蓝
  "#2f73d8", // 蓝色
  "#4dabf7", // 天蓝
  "#58c7e8", // 湖蓝
  "#3bc9db", // 青色
  "#55b979", // 草绿色
  "#8ac926", // 嫩绿
  "#06d6a0", // 薄荷绿
  "#f6a6ff", // 糖果紫粉
  "#ffcad4", // 奶油粉
  "#fdff70"  // 亮黄色
];

let wishes = JSON.parse(localStorage.getItem("starWishBottleDataV2")) || [
  {
    id: makeId(),
    type: "愿望",
    content: "希望明天的小组 presentation 顺顺利利。",
    createdAt: new Date().toLocaleString("zh-CN"),
    color: "#ffd938",
    realized: false,
    x: 34,
    y: 62,
    rotate: -17
  },
  {
    id: makeId(),
    type: "烦恼",
    content: "有时候我也会担心自己讲不好，但我想试试看。",
    createdAt: new Date().toLocaleString("zh-CN"),
    color: "#f48ac8",
    realized: false,
    x: 58,
    y: 70,
    rotate: 14
  },
  {
    id: makeId(),
    type: "鼓励",
    content: "今天也已经很努力了。",
    createdAt: new Date().toLocaleString("zh-CN"),
    color: "#55b979",
    realized: false,
    x: 46,
    y: 45,
    rotate: 28
  }
];

saveData();
renderAll();

openWriteModalBtn.addEventListener("click", () => {
  writeModal.classList.remove("hidden");
  wishInput.focus();
});

closeWriteModalBtn.addEventListener("click", closeWriteModal);
closeReadModalBtn.addEventListener("click", closeReadModal);

writeModal.addEventListener("click", (event) => {
  if (event.target === writeModal) closeWriteModal();
});

readModal.addEventListener("click", (event) => {
  if (event.target === readModal) closeReadModal();
});

typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    typeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    selectedType = button.dataset.type;
  });
});

wishInput.addEventListener("input", () => {
  charCount.textContent = `${wishInput.value.length} / 120`;
});

submitWishBtn.addEventListener("click", () => {
  const content = wishInput.value.trim();

  if (!content) {
    gentleShake(wishInput);
    return;
  }

  const newWish = {
    id: makeId(),
    type: selectedType,
    content,
    createdAt: new Date().toLocaleString("zh-CN"),
    color: randomItem(colors),
    realized: false,
    x: randomBetween(10, 76),
    y: randomBetween(20, 78),
    rotate: randomBetween(-42, 42),
    size: randomBetween(36, 54)
  };

  closeWriteModal();

  animateNoteToStar(newWish, () => {
    wishes.push(newWish);
    saveData();
    renderAll();
    showPreview(newWish);
  });
});

realizeWishBtn.addEventListener("click", () => {
  if (!selectedWishId) return;

  const wish = wishes.find((item) => item.id === selectedWishId);
  if (!wish) return;

  const starElement = document.querySelector(`[data-id="${selectedWishId}"]`);

  if (starElement) {
    animateRealize(starElement);
  }

  wish.realized = true;
  saveData();

  setTimeout(() => {
    closeReadModal();
    renderAll();
    showSkyStar(wish);

    noteCard.innerHTML = `
      <p class="note-empty">
        这颗星星已经飞上天空了。<br/>
        它不再只是一个愿望，也成为了被看见的光。
      </p>
    `;
  }, 1050);
});

clearAllBtn.addEventListener("click", () => {
  const ok = confirm("要换一个全新的空瓶子吗？现在瓶子里的星星会被清空。");
  if (!ok) return;

  wishes = [];
  saveData();
  renderAll();

  noteCard.innerHTML = `<p class="note-empty">新的瓶子已经准备好了。<br/>写下第一颗星星吧。</p>`;
});

function renderAll() {
  renderBottleStars();
  renderSkyStars();
  renderStats();
}

function renderBottleStars() {
  wishStars.innerHTML = "";

  const activeWishes = wishes.filter((wish) => !wish.realized);

  activeWishes.forEach((wish) => {
    const star = document.createElement("div");
    star.className = "paper-star";
    star.dataset.id = wish.id;

    star.style.left = `${wish.x}%`;
    star.style.top = `${wish.y}%`;
    star.style.setProperty("--rotate", `${wish.rotate}deg`);
    star.style.animationDelay = `${Math.random() * 1.5}s`;

    const size = wish.size || randomBetween(36, 52);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    star.innerHTML = createHandStarSvg(wish.color);

    star.addEventListener("click", () => {
      selectedWishId = wish.id;
      openReadModal(wish);
      showPreview(wish);
    });

    wishStars.appendChild(star);
  });
}

function createHandStarSvg(color) {
  const pointsOptions = [
    "50 2, 61 35, 98 34, 68 56, 80 94, 50 72, 21 94, 32 56, 3 34, 39 35",
    "49 0, 64 31, 97 38, 70 58, 76 95, 50 75, 18 91, 30 57, 4 32, 38 34",
    "52 4, 60 33, 95 31, 66 55, 82 88, 51 70, 24 96, 31 60, 1 38, 38 36"
  ];

  const points = randomItem(pointsOptions);

  return `
    <svg viewBox="0 0 100 100">
      <defs>
        <filter id="starRough">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
        </filter>
      </defs>
      <polygon
        points="${points}"
        fill="${color}"
        stroke="rgba(39,59,95,0.35)"
        stroke-width="5"
        stroke-linejoin="round"
      />
      <path
        d="M35 38 C46 34, 56 34, 66 39"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        d="M30 62 C43 67, 57 68, 70 60"
        fill="none"
        stroke="rgba(39,59,95,0.12)"
        stroke-width="4"
        stroke-linecap="round"
      />
    </svg>
  `;
}

function renderSkyStars() {
  skyStars.innerHTML = "";

  const realizedWishes = wishes.filter((wish) => wish.realized);

  realizedWishes.forEach((wish, index) => {
    const star = document.createElement("div");
    star.className = "sky-star";
    star.textContent = index % 2 === 0 ? "★" : "✦";
    star.style.color = wish.color;
    star.style.left = `${12 + ((index * 19) % 75)}%`;
    star.style.top = `${8 + ((index * 13) % 34)}%`;
    star.style.animationDelay = `${index * 0.2}s`;
    skyStars.appendChild(star);
  });
}

function renderStats() {
  totalCount.textContent = wishes.length;
  realizedCount.textContent = wishes.filter((wish) => wish.realized).length;
}

function openReadModal(wish) {
  readType.textContent = wish.type;
  readContent.textContent = wish.content;
  readTime.textContent = `写下时间：${wish.createdAt}`;
  readModal.classList.remove("hidden");
}

function closeReadModal() {
  readModal.classList.add("hidden");
  selectedWishId = null;
}

function closeWriteModal() {
  writeModal.classList.add("hidden");
  wishInput.value = "";
  charCount.textContent = "0 / 120";

  selectedType = "愿望";
  typeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.type === "愿望");
  });
}

function showPreview(wish) {
  noteCard.innerHTML = `
    <div class="preview-type">${wish.type}</div>
    <p class="preview-content">${escapeHTML(wish.content)}</p>
    <p class="preview-time">${wish.createdAt}</p>
  `;
}

/* 核心：便签纸折叠成星星，再飞进瓶子 */
function animateNoteToStar(wish, done) {
  const note = document.createElement("div");
  note.className = "fold-note";

  const startX = window.innerWidth / 2 - 115;
  const startY = window.innerHeight / 2 - 65;

  const bottleRect = bottleWrapper.getBoundingClientRect();
  const targetX = bottleRect.left + bottleRect.width * 0.5;
  const targetY = bottleRect.top + bottleRect.height * 0.62;

  note.style.left = `${startX}px`;
  note.style.top = `${startY}px`;
  note.style.setProperty("--tx", `${targetX - startX}px`);
  note.style.setProperty("--ty", `${targetY - startY}px`);
  note.style.setProperty("--fold-color", wish.color);

  document.body.appendChild(note);

  setTimeout(() => {
    note.remove();
    done();
  }, 980);
}

function animateRealize(starElement) {
  const rect = starElement.getBoundingClientRect();
  const clone = starElement.cloneNode(true);

  clone.classList.add("realizing");
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;

  clone.style.setProperty("--tx", `${randomBetween(-140, 160)}px`);
  clone.style.setProperty("--ty", `${-window.innerHeight * 0.68}px`);

  document.body.appendChild(clone);

  setTimeout(() => {
    clone.remove();
  }, 1300);
}

function showSkyStar(wish) {
  const star = document.createElement("div");
  star.className = "sky-star";
  star.textContent = "★";
  star.style.color = wish.color;
  star.style.left = `${randomBetween(15, 82)}%`;
  star.style.top = `${randomBetween(8, 38)}%`;
  skyStars.appendChild(star);
}

function saveData() {
  localStorage.setItem("starWishBottleDataV2", JSON.stringify(wishes));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gentleShake(element) {
  element.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-8px)" },
      { transform: "translateX(8px)" },
      { transform: "translateX(0)" }
    ],
    {
      duration: 230,
      easing: "ease-in-out"
    }
  );
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[match];
  });
}

function makeId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `wish-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}