

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mainEl = document.getElementById("main");
  const themeToggleBtn = document.getElementById("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const STORAGE_KEY = "charlieTheme";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    savedTheme = null;
  }
  let currentTheme = savedTheme || (prefersDark ? "dark" : "light");

  function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggleBtn) {
      themeToggleBtn.dataset.theme = theme;
      themeToggleBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#f5f7fb");
    }
  }

  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, currentTheme);
      } catch (error) {
        // Ignore storage errors
      }
      applyTheme(currentTheme);
    });
  }

  /* ─── Loading Screen ─────────────────────── */
  function hideLoader() {
    const loader = document.getElementById("loading-screen");
    if (!loader) return;
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.remove();
      // Refresh ScrollTrigger after loader is gone
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }, 600);
  }

  /* ─── Typing Effect ──────────────────────── */
  const typingEl = document.getElementById("typing");
  const typingText = (typeof DATA !== "undefined" && DATA.typingText)
    ? DATA.typingText
    : "I build elegant solutions for complex problems";
  let charIdx = 0;
  let typingDirection = 1;

  function typeText() {
    if (!typingEl) return;
    if (prefersReduced) {
      typingEl.textContent = typingText;
      return;
    }
    typingEl.textContent = typingText.slice(0, charIdx);
    charIdx += typingDirection;

    if (charIdx > typingText.length) {
      typingDirection = 0;
      setTimeout(() => { typingDirection = -1; typeText(); }, 2200);
      return;
    }
    if (charIdx < 0) {
      typingDirection = 0;
      setTimeout(() => { typingDirection = 1; charIdx = 0; typeText(); }, 800);
      return;
    }
    setTimeout(typeText, typingDirection === 1 ? 55 : 30);
  }

  /* ─── Custom Cursor ──────────────────────── */
  const cursor = document.querySelector(".cursor");
  const follower = document.querySelector(".cursor-follower");
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  if (cursor && follower && !prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    (function animateFollower() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateFollower);
    })();

    const hoverTargets = "a, button, .glass, input, textarea, select, .project-card, .skill-card, .service-card, .badge";
    document.addEventListener("mouseenter", (e) => {
      if (e.target.matches && (e.target.matches(hoverTargets) || e.target.closest(hoverTargets))) {
        follower.classList.add("hover");
      }
    }, true);
    document.addEventListener("mouseleave", (e) => {
      if (e.target.matches && (e.target.matches(hoverTargets) || e.target.closest(hoverTargets))) {
        follower.classList.remove("hover");
      }
    }, true);
  }

  /* ─── Mobile Menu ────────────────────────── */
  const menu = document.getElementById("mobile-menu");
  const burger = document.getElementById("hamburger");

  if (burger && menu) {
    function toggleMenu() {
      const isOpen = menu.classList.toggle("open");
      burger.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
    }

    burger.addEventListener("click", toggleMenu);

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (menu.classList.contains("open") && !menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ─── Navbar Active Section Tracking ─────── */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("data-section") === id);
          });
        }
      });
    },
    { root: mainEl, threshold: 0.35 }
  );

  sections.forEach((s) => sectionObserver.observe(s));

  /* ─── Navbar scroll state ────────────────── */
  const navbar = document.getElementById("navbar");
  let navScrolled = false;

  if (mainEl && navbar) {
    mainEl.addEventListener("scroll", () => {
      const scrolled = mainEl.scrollTop > 60;
      if (scrolled !== navScrolled) {
        navScrolled = scrolled;
        navbar.classList.toggle("scrolled", scrolled);
      }
    }, { passive: true });
  }

  /* ─── Parallax Layers ────────────────────── */
  const parallaxLayers = document.querySelectorAll(".parallax-layer");

  if (!prefersReduced && parallaxLayers.length > 0 && mainEl) {
    let parallaxTicking = false;
    mainEl.addEventListener("scroll", () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(() => {
        const scrollTop = mainEl.scrollTop;
        parallaxLayers.forEach((el) => {
          const speed = parseFloat(el.dataset.speed || "0.2");
          el.style.transform = `translateY(${scrollTop * speed * -0.35}px)`;
        });
        parallaxTicking = false;
      });
    }, { passive: true });
  }

  if (mainEl) {
    let ratioTicking = false;
    mainEl.addEventListener("scroll", () => {
      if (ratioTicking) return;
      ratioTicking = true;
      requestAnimationFrame(() => {
        const ratio = Math.min(mainEl.scrollTop / 220, 1);
        document.documentElement.style.setProperty("--scroll-ratio", ratio.toString());
        ratioTicking = false;
      });
    }, { passive: true });
  }

  /* ─── Particle Canvas ────────────────────── */
  const canvas = document.getElementById("particle-canvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let particles = [];
  let particleRAF = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initParticles() {
    if (!canvas || !ctx || prefersReduced) return;
    const count = Math.min(55, Math.floor(window.innerWidth / 22));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.45 + 0.15,
      });
    }
    if (particleRAF) cancelAnimationFrame(particleRAF);
    drawParticles();
  }

  function drawParticles() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
      ctx.fill();
    }

    // Connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        if (dist < 14400) { // 120^2
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${0.06 * (1 - Math.sqrt(dist) / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    particleRAF = requestAnimationFrame(drawParticles);
  }

  /* ─── GSAP Scroll Animations ─────────────── */
  function initGSAP() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      // GSAP failed to load — make everything visible as fallback
      document.querySelectorAll("[data-animate]").forEach((el) => {
        el.style.opacity = "1";
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Configure ScrollTrigger for the <main> scroll container
    ScrollTrigger.defaults({ scroller: mainEl });

    if (prefersReduced) {
      gsap.set("[data-animate]", { opacity: 1, clearProps: "transform" });
      return;
    }

    // ── Animate [data-animate] elements ──
    // CRITICAL: Use gsap.fromTo() because CSS sets [data-animate] { opacity: 0 }
    // gsap.from() would read current opacity (0) as end state → elements stay invisible
    gsap.utils.toArray("[data-animate]").forEach((el) => {
      const type = el.getAttribute("data-animate") || "fade-up";
      const delay = parseFloat(el.getAttribute("data-delay") || "0");

      let fromVars = { opacity: 0 };
      let toVars = {
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: delay,
        clearProps: "transform",
      };

      switch (type) {
        case "fade-up":
          fromVars.y = 50;
          toVars.y = 0;
          break;
        case "fade-left":
          fromVars.x = 60;
          toVars.x = 0;
          break;
        case "fade-right":
          fromVars.x = -60;
          toVars.x = 0;
          break;
        case "scale":
          fromVars.scale = 0.88;
          toVars.scale = 1;
          break;
        default:
          fromVars.y = 40;
          toVars.y = 0;
      }

      gsap.fromTo(el, fromVars, {
        ...toVars,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });

    // ── Skill Bars ──
    gsap.utils.toArray(".skill-bar span").forEach((bar) => {
      ScrollTrigger.create({
        trigger: bar,
        start: "top 92%",
        onEnter: () => bar.classList.add("animated"),
      });
    });

    // ── Progress Fills (strengths) ──
    gsap.utils.toArray(".progress-fill").forEach((fill) => {
      const w = fill.getAttribute("data-width");
      if (w) fill.style.setProperty("--w", w);
      ScrollTrigger.create({
        trigger: fill,
        start: "top 92%",
        onEnter: () => fill.classList.add("animated"),
      });
    });

    // ── Stat Counter Animation ──
    gsap.utils.toArray(".stat-value").forEach((el) => {
      const target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
        onUpdate: () => {
          el.textContent = Math.ceil(obj.val);
        },
      });
    });
  }

  /* ─── Logo Parallax Tilt ─────────────────── */
  const logoEl = document.getElementById("logo");
  const logoText = logoEl ? logoEl.querySelector(".logo-text") : null;
  if (logoEl && logoText && !prefersReduced) {
    logoEl.addEventListener("mousemove", (e) => {
      const rect = logoEl.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      logoText.style.transform = `rotateX(${y * -10}deg) rotateY(${x * 14}deg) translateZ(6px)`;
    });
    logoEl.addEventListener("mouseleave", () => {
      logoText.style.transition = "transform 0.5s ease";
      logoText.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
      setTimeout(() => { logoText.style.transition = ""; }, 500);
    });
  }

  /* ─── Profile 3D Tilt ────────────────────── */
  const profileTilt = document.getElementById("profile-tilt");
  if (profileTilt && !prefersReduced) {
    profileTilt.addEventListener("mousemove", (e) => {
      const rect = profileTilt.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      profileTilt.style.transform = `rotateX(${y * -12}deg) rotateY(${x * 16}deg)`;
    });
    profileTilt.addEventListener("mouseleave", () => {
      profileTilt.style.transition = "transform 0.5s ease";
      profileTilt.style.transform = "rotateX(0) rotateY(0)";
      setTimeout(() => { profileTilt.style.transition = ""; }, 500);
    });
  }

  /* ─── Contact Form ───────────────────────── */
  const contactForm = document.getElementById("contact-form");
  const FORM_SUBMIT_URL = "https://formsubmit.co/ajax/f7cb0d35017d7a2bef0f4a741ea90add";
  const formStatus = document.querySelector(".form-status");
  let statusTimeout = null;

  function showFormStatus(type, message) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove("status-success", "status-error", "status-visible");
    if (type === "success") {
      formStatus.classList.add("status-success");
    } else if (type === "error") {
      formStatus.classList.add("status-error");
    }
    requestAnimationFrame(() => {
      formStatus.classList.add("status-visible");
    });
    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      formStatus.classList.remove("status-visible");
    }, type === "error" ? 4000 : 3600);
  }

  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.querySelector("span") : null;
    const defaultLabel = submitLabel ? submitLabel.textContent : "Sending";

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!submitBtn || !submitLabel) return;
      const formData = new FormData(contactForm);
      formData.set("_subject", `Portfolio message from ${formData.get("name") || "visitor"}`);
      formData.set("_replyto", formData.get("email"));
      formData.set("message_type", formData.get("project"));

      submitBtn.disabled = true;
      submitLabel.textContent = "Sending...";
      showFormStatus("", "Sending your message...");
      try {
        const response = await fetch(FORM_SUBMIT_URL, {
          method: "POST",
          body: formData,
        });
        const payload = await response.json();
        if (!response.ok || payload.success === false) {
          throw new Error("Submission failed");
        }
        showFormStatus("success", "Message sent! I will reply shortly.");
        contactForm.reset();
      } catch (error) {
        console.error("Contact form error", error);
        showFormStatus("error", "Oops! The message didn't go through. Try again or email practicewithcharlie@gmail.com");
      } finally {
        submitBtn.disabled = false;
        submitLabel.textContent = defaultLabel;
      }
    });
  }

  /* ─── Smooth Scroll (using main scroll container) ── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target || !mainEl) return;
      e.preventDefault();

      // Calculate target position relative to main scroll container
      const mainRect = mainEl.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset = targetRect.top - mainRect.top + mainEl.scrollTop;

      mainEl.scrollTo({ top: offset, behavior: "smooth" });
    });
  });

  /* ─── Window Resize ──────────────────────── */
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      if (!prefersReduced) initParticles();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    }, 250);
  });

  /* ─── Initialize ─────────────────────────── */
  window.addEventListener("DOMContentLoaded", () => {
    resizeCanvas();
    if (!prefersReduced) initParticles();
    typeText();
  });

  window.addEventListener("load", () => {
    initGSAP();
    // Short delay so ScrollTrigger measures after layout settles
    setTimeout(() => {
      hideLoader();
    }, 400);
  });

  // Failsafe: hide loader after 3s no matter what
  setTimeout(hideLoader, 3000);

})();
