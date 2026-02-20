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

// スクロールアニメーション
function initScrollAnimations() {
  // Our Story: 奇数行（img左）の img は左から、msg は右から
  // 偶数行（reverse）の img は右から、msg は左から
  document.querySelectorAll(".story-row:not(.reverse) .story-img").forEach(el => el.classList.add("slide-left"));
  document.querySelectorAll(".story-row:not(.reverse) .story-msg").forEach(el => el.classList.add("slide-right"));
  document.querySelectorAll(".story-row.reverse .story-img").forEach(el => el.classList.add("slide-right"));
  document.querySelectorAll(".story-row.reverse .story-msg").forEach(el => el.classList.add("slide-left"));

  // その他のセクション要素は下からフェードアップ
  const fadeTargets = [
    "#greeting",
    "#groom",
    "#bride",
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
