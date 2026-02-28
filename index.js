// 画面のblur効果を解除する & Welcome オーバーレイをフェードアウト
window.addEventListener("load", () => {
  document.getElementById("blur-container").classList.add("loaded");

  // blur transition (3s) が終わるタイミングで Welcome をフェードアウト
  const overlay = document.getElementById("welcome-overlay");
  if (overlay) {
    setTimeout(() => {
      overlay.classList.add("hidden");
      // フェードアウト完了後に DOM から除去
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
    }, 2020); // 2.02s: 扇形→横並び完了タイミング（Phase1: 1.1s + Phase2 transition: 0.92s）
  }
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

// impression カードの幅を最大幅に統一する
function equalizeImpressionCardWidths() {
  const cards = document.querySelectorAll(".impression-card");
  if (cards.length === 0) return;

  // いったんリセットして自然な幅を計測
  cards.forEach(card => { card.style.width = ""; });

  const maxWidth = Math.max(...Array.from(cards).map(card => card.getBoundingClientRect().width));

  cards.forEach(card => { card.style.width = maxWidth + "px"; });
}

window.addEventListener("load", equalizeImpressionCardWidths);

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
