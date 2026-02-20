// 画面のblur効果を解除する
window.addEventListener("load", () => {
  document.getElementById("blur-container").classList.add("loaded");
});

// 3D tiltエフェクト
function applyTilt(selector, maxAngle = 12) {
  document.querySelectorAll(selector).forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotateX = -dy * maxAngle;
      const rotateY = dx * maxAngle;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
      card.classList.add("tilt-active");
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.classList.remove("tilt-active");
    });
  });
}

applyTilt("#groom, #bride", 10);
applyTilt(".story-msg", 6);
applyTilt(".story-img", 8);

// 扇形ファン展開 → 横並びアニメーション
function initFanSpread() {
  const fan = document.getElementById("img_fan");
  if (!fan) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Phase 1: 扇形展開
        // 左カードが rotate(-22deg) で画面外に出ないよう padding を確保しつつ中央に配置
        const container = document.getElementById("img_first");
        // 扇形展開中はスクロール許可
        if (container) container.classList.add("fan-spreading");
        const cardH = fan.querySelector(".fan-card").offsetHeight || 260;
        const overhang = Math.ceil(cardH * Math.sin(22 * Math.PI / 180)) + 20;
        // fan を中央に置くため左右に overhang 分の余白を持たせてコンテナを中央スクロール
        fan.style.marginLeft = overhang + "px";
        fan.style.marginRight = overhang + "px";
        fan.classList.add("spread");
        // margin 適用後に DOM が更新されてから中央スクロール
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!container) return;
            const fanRect = fan.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const fanCenterInContainer = (fanRect.left - containerRect.left) + container.scrollLeft + (fan.offsetWidth / 2);
            container.scrollLeft = fanCenterInContainer - container.clientWidth / 2;
          });
        });
        // Phase 2: 1.1秒後に横並び
        setTimeout(() => {
          fan.style.marginLeft = "0";
          fan.style.marginRight = "0";
          fan.classList.add("lined");
          // 横並び完了後（transition: 0.8s + delay 0.24s ≒ 1.1s）に3枚目を中央へ
          setTimeout(() => {
            const container = document.getElementById("img_first");
            const card3 = fan.querySelector(".fan-2"); // 3枚中央は fan-2
            if (!container || !card3) return;
            const containerW = container.clientWidth;
            // getBoundingClientRect で fan 内の実座標を取得
            const fanRect = fan.getBoundingClientRect();
            const card3Rect = card3.getBoundingClientRect();
            const card3LeftInFan = card3Rect.left - fanRect.left;
            const cardW = card3Rect.width;
            container.scrollLeft = card3LeftInFan - (containerW / 2) + (cardW / 2);
            // 横並び＋スクロール完了後にスクロールをロック
            container.classList.remove("fan-spreading");
          }, 900);
        }, 1100);
        observer.unobserve(fan);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(fan);
}

window.addEventListener("load", initFanSpread);

// impression carousel dots
function initImpressionDots() {
  const carousel = document.getElementById("impression");
  const dotsContainer = document.getElementById("impression-dots");
  if (!carousel || !dotsContainer) return;

  const cards = carousel.querySelectorAll(".impression-card");
  if (cards.length === 0) return;

  // build dots
  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "impression-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `スライド ${i + 1}`);
    dot.addEventListener("click", () => {
      cards[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    });
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll(".impression-dot");

  // update active dot based on which card is most visible
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        const index = Array.from(cards).indexOf(entry.target);
        if (index !== -1) {
          dots.forEach((d, i) => d.classList.toggle("active", i === index));
        }
      }
    });
  }, { root: carousel, threshold: 0.5 });

  cards.forEach(card => cardObserver.observe(card));
}

window.addEventListener("load", initImpressionDots);

// スクロールアニメーション
function initScrollAnimations() {
  // Our Story: 奇数行（img左）の img は左から、msg は右から
  // 偶数行（reverse）の img は右から、msg は左から
  document.querySelectorAll(".story-row:not(.reverse) .story-img").forEach(el => el.classList.add("slide-left"));
  document.querySelectorAll(".story-row:not(.reverse) .story-msg").forEach(el => el.classList.add("slide-right"));
  document.querySelectorAll(".story-row.reverse .story-img").forEach(el => el.classList.add("slide-right"));
  document.querySelectorAll(".story-row.reverse .story-msg").forEach(el => el.classList.add("slide-left"));

  // Profile カード: groom は左から、bride は右からフェードイン
  const groom = document.querySelector("#groom");
  const bride = document.querySelector("#bride");
  if (groom) groom.classList.add("slide-left");
  if (bride) bride.classList.add("slide-right");

  // その他のセクション要素は下からフェードアップ
  const fadeTargets = [
    "#greeting",
    ".impression-card",
    ".main-table",
    ".table",
  ];
  fadeTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add("fade-up");
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".fade-up, .slide-left, .slide-right").forEach(el => {
    observer.observe(el);
  });
}

window.addEventListener("load", initScrollAnimations);
