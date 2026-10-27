
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const resetPageScroll = () => {
  const previous = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.style.scrollBehavior = previous;
};

if (!window.location.hash) {
  resetPageScroll();
}

const introScreen = document.querySelector("#intro-screen");

if (introScreen) {
  const hideIntro = () => {
    introScreen.classList.add("is-hidden");
    document.body.style.overflow = "";

    if (!window.location.hash) {
      resetPageScroll();
    }
  };

  if (reducedMotion.matches) {
    hideIntro();
  } else {
    document.body.style.overflow = "hidden";

    if (!window.location.hash) {
      resetPageScroll();
    }

    window.setTimeout(() => {
      introScreen.classList.add("is-leaving");
    }, 1600);

    introScreen.addEventListener("transitionend", (event) => {
      if (
        event.target === introScreen &&
        event.propertyName === "transform"
      ) {
        hideIntro();
      }
    });

    window.setTimeout(hideIntro, 3200);
  }
}

const animatedName = document.querySelector("#animated-name");

if (animatedName) {
  animatedName.setAttribute("aria-label", "Lucas");

  animatedName.innerHTML = [...animatedName.textContent.trim()]
    .map((letter, index) => `
      <span class="letter" aria-hidden="true">
        <span class="glyph" style="--i:${index}">${letter}</span>
      </span>
    `).join("");

  const elements = [...animatedName.querySelectorAll(".letter")];

  const resetLetters = () => {
    elements.forEach((letter) => {
      letter.style.setProperty("--move-x", "0px");
      letter.style.setProperty("--move-y", "0px");
      letter.style.setProperty("--angle", "0deg");
    });
  };

  document.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || event.pointerType === "touch") {
      return;
    }

    elements.forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - event.clientX;
      const dy = rect.top + rect.height / 2 - event.clientY;
      const distance = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 1 - distance / 220);

      letter.style.setProperty(
        "--move-x",
        `${(dx / distance) * force * 22}px`
      );

      letter.style.setProperty(
        "--move-y",
        `${(dy / distance) * force * 12}px`
      );

      letter.style.setProperty(
        "--angle",
        `${(dx / distance) * force * 6}deg`
      );
    });
  });

  document.documentElement.addEventListener("pointerleave", resetLetters);

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) resetLetters();
  });
}

const photoCard = document.querySelector("#photo-card");
const photo = document.querySelector("#lucas-photo");
const caption = document.querySelector("#photo-caption");

const photos = [
  {
    src: "images/lucas.jpeg",
    text: "Ohhhhhh yeahhh"
  },
  {
    src: "images/lucas-fun.jpeg",
    text: "404: serious face not found"
  }
];

photos.forEach((item) => {
  const img = new Image();
  img.src = item.src;
});

let photoIndex = 0;
let isChanging = false;

if (photoCard && photo && caption) {
  photoCard.addEventListener("click", () => {
    if (isChanging) return;

    isChanging = true;

    const nextIndex = (photoIndex + 1) % photos.length;
    const duration = reducedMotion.matches ? 0 : 250;

    photoCard.classList.add("is-changing");

    window.setTimeout(() => {
      photoIndex = nextIndex;

      photo.src = photos[photoIndex].src;
      photo.alt = `Photo ${photoIndex + 1} de Lucas Rodrigues`;
      caption.textContent = photos[photoIndex].text;

      photoCard.classList.toggle(
        "is-alt",
        photoIndex === 1
      );

      requestAnimationFrame(() => {
        photoCard.classList.remove("is-changing");

        window.setTimeout(() => {
          isChanging = false;
        }, duration + 10);
      });
    }, duration);
  });
}

const aboutSection = document.querySelector(".about-motion");
const aboutCards = [...document.querySelectorAll(".about-card")];

const mobileScreen = window.matchMedia("(max-width: 768px)");

if (aboutSection && aboutCards.length === 3) {
  let ticking = false;

  const updateAbout = () => {
    ticking = false;

    if (mobileScreen.matches) {
      return;
    }

    const rect = aboutSection.getBoundingClientRect();

    const distance = Math.max(
      1,
      rect.height - window.innerHeight
    );

    const progress = reducedMotion.matches
      ? 1
      : Math.max(0, Math.min(1, -rect.top / distance));

    const eased = 1 - Math.pow(1 - progress, 3);
    const cardWidth = aboutCards[0].offsetWidth;

    const availableSpace =
      window.innerWidth / 2 -
      cardWidth / 2 -
      window.innerWidth * 0.06 -
      15;

    const spread = Math.max(
      0,
      Math.min(410, availableSpace)
    );

    const start = [
      [-30, 10, -12],
      [0, 0, 2],
      [30, 10, 12]
    ];

    const end = [
      [-spread, -15, -9],
      [0, 25, 0],
      [spread, -15, 9]
    ];

    aboutCards.forEach((card, index) => {
      const values = start[index].map((value, axis) => {
        return value + (end[index][axis] - value) * eased;
      });

      card.style.setProperty("--card-x", `${values[0]}px`);
      card.style.setProperty("--card-y", `${values[1]}px`);
      card.style.setProperty("--card-angle", `${values[2]}deg`);
    });
  };

  const requestAboutUpdate = () => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(updateAbout);
  };

  window.addEventListener(
    "scroll",
    requestAboutUpdate,
    { passive: true }
  );

  window.addEventListener("resize", requestAboutUpdate);
  mobileScreen.addEventListener("change", requestAboutUpdate);
  reducedMotion.addEventListener("change", requestAboutUpdate);

  aboutCards.forEach((card) => {
    card.addEventListener("click", () => {
      aboutCards.forEach((item) => {
        item.style.zIndex = "";
      });

      card.style.zIndex = "10";

      const flipped = card.classList.toggle("is-flipped");

      card.setAttribute(
        "aria-pressed",
        String(flipped)
      );
    });
  });

  updateAbout();
}

const skillElements = document.querySelectorAll(".skill");

skillElements.forEach((skill) => {
  const name = skill.dataset.name;

  const level = Math.max(
    1,
    Math.min(5, Number(skill.dataset.level) || 1)
  );

  skill.innerHTML = `
    <span class="skill-name">${name}</span>
    <div class="skill-rating" aria-label="${name} : niveau ${level} sur 5">
      <div class="skill-bars" aria-hidden="true">
        ${Array.from({ length: 5 }, (_, index) => `
          <span class="skill-bar ${index < level ? "filled" : ""}"></span>
        `).join("")}
      </div>
      <span class="skill-number">${level}/5</span>
    </div>
  `;
});

const experienceToggle = document.querySelector(".experience-toggle");
const experienceDetails = document.querySelector("#experience-details");
const asiaDetailsButton = document.querySelector("#asia-details-button");
const asiaDetails = document.querySelector("#asia-details");

const updateActionLabels = () => {
  const fr = document.documentElement.lang === "fr";

  if (experienceToggle) {
    const expanded =
      experienceToggle.getAttribute("aria-expanded") === "true";

    const label = experienceToggle.querySelector(
      "span:first-child"
    );

    if (label) {
      label.textContent = expanded
        ? fr ? "FERMER" : "CLOSE EXPERIENCE"
        : fr ? "DÉCOUVRIR MON EXPÉRIENCE" : "EXPLORE EXPERIENCE";
    }
  }

  if (asiaDetailsButton) {
    const expanded =
      asiaDetailsButton.getAttribute("aria-expanded") === "true";

    const label = asiaDetailsButton.querySelector(
      "span:first-child"
    );

    if (label) {
      label.textContent = expanded
        ? fr ? "FERMER" : "CLOSE DETAILS"
        : fr ? "DÉCOUVRIR LE PROJET" : "DISCOVER PROJECT";
    }
  }
};

if (experienceToggle && experienceDetails) {
  experienceToggle.addEventListener("click", () => {
    const opening = experienceDetails.hidden;

    experienceDetails.hidden = !opening;

    experienceToggle.setAttribute(
      "aria-expanded",
      String(opening)
    );

    updateActionLabels();
  });
}

if (asiaDetailsButton && asiaDetails) {
  asiaDetailsButton.addEventListener("click", () => {
    const opening = asiaDetails.hidden;

    asiaDetails.hidden = !opening;

    asiaDetailsButton.setAttribute(
      "aria-expanded",
      String(opening)
    );

    updateActionLabels();
  });
}

const careerButtons = [
  ...document.querySelectorAll(".career-toggle")
];

const updateCareerLabels = () => {
  const fr = document.documentElement.lang === "fr";

  document.querySelectorAll(".career-main").forEach((item) => {
    const position = item.querySelector("span");
    if (!position) return;

    const role = item.closest(".career-item")?.querySelector(
      ".career-details"
    )?.id;

    if (role === "career-asptt") {
      position.textContent = fr
        ? "Stagiaire développeur web"
        : "Web Developer Intern";
    }

    if (role === "career-scadif") {
      position.textContent = fr
        ? "Stagiaire ingénierie réseaux"
        : "Network Engineering Intern";
    }
  });

  const asptt = document.querySelector("#career-asptt p");
  const scadif = document.querySelector("#career-scadif p");

  if (asptt) {
    asptt.textContent = fr
      ? "Participation au développement d'un nouveau site web, apprentissage de JavaScript et création d'une calculatrice."
      : "Participated in the development of a new website, learned more about JavaScript and built a JavaScript calculator.";
  }

  if (scadif) {
    scadif.textContent = fr
      ? "Configuration de switchs réseau, interventions sur des postes informatiques et participation aux réunions de l'équipe."
      : "Configured network switches, worked on computer workstations and took part in team meetings.";
  }

  const heading = document.querySelector(
    ".career-history-heading span:first-child"
  );

  if (heading) {
    heading.textContent = fr
      ? "MES EXPÉRIENCES PRÉCÉDENTES"
      : "PREVIOUS EXPERIENCES";
  }
};

careerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("aria-controls");
    const details = document.getElementById(id);

    if (!details) return;

    const opening = details.hidden;

    careerButtons.forEach((other) => {
      if (other === button) return;

      const otherDetails = document.getElementById(
        other.getAttribute("aria-controls")
      );

      if (otherDetails) {
        otherDetails.hidden = true;
        other.setAttribute("aria-expanded", "false");
      }
    });

    details.hidden = !opening;
    button.setAttribute("aria-expanded", String(opening));
  });
});

const projectsSection = document.querySelector(".projects-section");
const asiaPreview = document.querySelector("#asia-preview");

if (projectsSection) {
  const elements = [
    ...projectsSection.querySelectorAll(".project-reveal")
  ];

  if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
  ) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    projectsSection.classList.add("has-motion");
  }
}

if (asiaPreview) {
  asiaPreview.addEventListener("pointermove", (event) => {
    if (
      reducedMotion.matches ||
      event.pointerType === "touch" ||
      window.innerWidth <= 768
    ) {
      return;
    }

    const rect = asiaPreview.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    asiaPreview.style.setProperty("--tilt-x", `${-y * 12}deg`);
    asiaPreview.style.setProperty("--tilt-y", `${x * 12}deg`);
  });

  asiaPreview.addEventListener("pointerleave", () => {
    asiaPreview.style.setProperty("--tilt-x", "0deg");
    asiaPreview.style.setProperty("--tilt-y", "0deg");
  });
}

const portfolioNavLinks = [
  ...document.querySelectorAll(".nav-link")
];

const portfolioSections = [
  ...document.querySelectorAll(
    "#accueil, #about, #skills, #experience, #projects, #contact"
  )
];

const progressFill = document.querySelector("#progress-fill");

let navTicking = false;

const updateNavigation = () => {
  const scrollPosition = window.scrollY;
  const viewportHeight = window.innerHeight;

  const documentHeight =
    document.documentElement.scrollHeight - viewportHeight;

  const progress = documentHeight > 0
    ? Math.min(1, Math.max(0, scrollPosition / documentHeight))
    : 0;

  if (progressFill) {
    progressFill.style.transform = `scaleX(${progress})`;
  }

  const activationPoint =
    scrollPosition + viewportHeight * 0.4;

  let activeSection = portfolioSections[0]?.id;

  portfolioSections.forEach((section) => {
    if (activationPoint >= section.offsetTop) {
      activeSection = section.id;
    }
  });

  portfolioNavLinks.forEach((link) => {
    const active =
      link.getAttribute("href") === `#${activeSection}`;

    link.classList.toggle("is-active", active);

    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  navTicking = false;
};

const requestNavigationUpdate = () => {
  if (navTicking) return;

  navTicking = true;
  requestAnimationFrame(updateNavigation);
};

window.addEventListener(
  "scroll",
  requestNavigationUpdate,
  { passive: true }
);

window.addEventListener("resize", requestNavigationUpdate);

updateNavigation();

const contactTitle = document.querySelector("#contact-title");
const contactButton = document.querySelector("#contact-button");

const buildContactLetters = (lang) => {
  if (!contactTitle) return;

  const words = lang === "fr"
    ? ["ON SE", "PARLE ?"]
    : ["LET'S", "TALK."];

  const lines = [
    ...contactTitle.querySelectorAll(":scope > span")
  ];

  lines.forEach((line, index) => {
    line.innerHTML = [...words[index]].map((letter) => {
      if (letter === " ") {
        return `<span class="contact-letter" aria-hidden="true">&nbsp;</span>`;
      }

      return `<span class="contact-letter" aria-hidden="true">${letter}</span>`;
    }).join("");
  });

  contactTitle.setAttribute(
    "aria-label",
    lang === "fr" ? "On se parle ?" : "Let's talk"
  );
};

const resetContactLetters = () => {
  document.querySelectorAll(".contact-letter").forEach((letter) => {
    letter.style.setProperty("--contact-x", "0px");
    letter.style.setProperty("--contact-y", "0px");
    letter.style.setProperty("--contact-angle", "0deg");
  });
};

if (contactTitle) {
  document.addEventListener("pointermove", (event) => {
    if (
      reducedMotion.matches ||
      event.pointerType === "touch"
    ) {
      return;
    }

    contactTitle.querySelectorAll(".contact-letter").forEach((letter) => {
      const rect = letter.getBoundingClientRect();
      const dx = rect.left + rect.width / 2 - event.clientX;
      const dy = rect.top + rect.height / 2 - event.clientY;
      const distance = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 1 - distance / 250);

      letter.style.setProperty(
        "--contact-x",
        `${(dx / distance) * force * 25}px`
      );

      letter.style.setProperty(
        "--contact-y",
        `${(dy / distance) * force * 18}px`
      );

      letter.style.setProperty(
        "--contact-angle",
        `${(dx / distance) * force * 8}deg`
      );
    });
  });

  document.documentElement.addEventListener(
    "pointerleave",
    resetContactLetters
  );

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) resetContactLetters();
  });
}

if (contactButton) {
  contactButton.addEventListener("pointermove", (event) => {
    if (
      reducedMotion.matches ||
      event.pointerType === "touch"
    ) {
      return;
    }

    const rect = contactButton.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;

    contactButton.style.setProperty(
      "--button-x",
      `${x * 0.25}px`
    );

    contactButton.style.setProperty(
      "--button-y",
      `${y * 0.25}px`
    );
  });

  contactButton.addEventListener("pointerleave", () => {
    contactButton.style.setProperty("--button-x", "0px");
    contactButton.style.setProperty("--button-y", "0px");
  });

  contactButton.addEventListener("click", () => {
    const subject = encodeURIComponent(
      "Hello Lucas - Portfolio"
    );

    window.location.href =
      `mailto:lrodriguespro@outlook.fr?subject=${subject}`;
  });
}

const copyEmailButton = document.querySelector("#copy-email");
const copyFeedback = document.querySelector("#copy-feedback");
const emailAddress = "lrodriguespro@outlook.fr";

let copyFeedbackTimer;

if (copyEmailButton && copyFeedback) {
  copyEmailButton.addEventListener("click", async () => {
    let copied = false;

    try {
      await navigator.clipboard.writeText(emailAddress);
      copied = true;
    } catch (error) {
      const field = document.createElement("textarea");

      field.value = emailAddress;
      field.style.position = "fixed";
      field.style.opacity = "0";

      document.body.appendChild(field);
      field.select();

      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }

      field.remove();
    }

    const fr = document.documentElement.lang === "fr";

    copyFeedback.textContent = copied
      ? fr ? "COPIÉ ! ✓" : "COPIED! ✓"
      : fr ? "COPIE IMPOSSIBLE" : "COPY FAILED";

    copyFeedback.classList.add("is-visible");
    copyEmailButton.classList.toggle("is-copied", copied);

    clearTimeout(copyFeedbackTimer);

    copyFeedbackTimer = window.setTimeout(() => {
      copyFeedback.classList.remove("is-visible");
      copyEmailButton.classList.remove("is-copied");
    }, 2200);
  });
}

const customCursor = document.querySelector("#custom-cursor");
const cursorText = document.querySelector("#cursor-text");

const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
);

if (customCursor && cursorText) {
  let cursorX = -100;
  let cursorY = -100;
  let targetX = -100;
  let targetY = -100;
  let cursorFrame = 0;

  const animateCursor = () => {
    cursorX += (targetX - cursorX) * 0.22;
    cursorY += (targetY - cursorY) * 0.22;

    customCursor.style.transform =
      `translate3d(${cursorX}px,${cursorY}px,0) translate(-50%,-50%)`;

    cursorFrame = requestAnimationFrame(animateCursor);
  };

  const enableCursor = () => {
    return finePointer.matches && !reducedMotion.matches;
  };

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !enableCursor()) {
      return;
    }

    targetX = event.clientX;
    targetY = event.clientY;

    customCursor.classList.add("is-visible");

    if (!cursorFrame) {
      cursorFrame = requestAnimationFrame(animateCursor);
    }
  });

  document.addEventListener("pointerover", (event) => {
    if (!enableCursor()) return;

    const target = event.target.closest(
      "[data-cursor], a, button"
    );

    if (!target) {
      customCursor.classList.remove("is-hovering");
      cursorText.textContent = "";
      return;
    }

    const label = target.dataset.cursor ||
      (target.tagName === "A" ? "OPEN" : "CLICK");

    cursorText.textContent = label;
    customCursor.classList.add("is-hovering");
  });

  document.addEventListener("pointerout", (event) => {
    const from = event.target.closest(
      "[data-cursor], a, button"
    );

    const to = event.relatedTarget?.closest?.(
      "[data-cursor], a, button"
    );

    if (from && from !== to) {
      customCursor.classList.remove("is-hovering");
      cursorText.textContent = "";
    }
  });

  document.documentElement.addEventListener("pointerleave", () => {
    customCursor.classList.remove("is-visible");
    customCursor.classList.remove("is-hovering");
    cursorText.textContent = "";
  });

  const checkCursorMode = () => {
    if (!enableCursor()) {
      customCursor.classList.remove("is-visible");
    }
  };

  finePointer.addEventListener("change", checkCursorMode);
  reducedMotion.addEventListener("change", checkCursorMode);
}

const languageButtons = document.querySelectorAll(".lang-btn");

const portfolioTranslations = [
  [".intro", "HELLO, I'M", "SALUT, JE SUIS"],
  [".job", "Apprentice Software Engineer • Sage", "Développeur en alternance • Sage"],
  [".hero-note p", "I build things for the web.", "Je crée des choses pour le web."],
  [".hero-note span", "And sometimes break them.", "Et parfois, je casse tout."],
  [".scroll-indicator > span:first-child", "SCROLL TO EXPLORE", "DÉFILER POUR EXPLORER"],

  ['.nav-link[href="#accueil"]', "HOME", "ACCUEIL"],
  ['.nav-link[href="#about"]', "ABOUT", "À PROPOS"],
  ['.nav-link[href="#skills"]', "SKILLS", "COMPÉTENCES"],
  ['.nav-link[href="#experience"]', "EXPERIENCE", "EXPÉRIENCE"],
  ['.nav-link[href="#projects"]', "WORK", "PROJETS"],
  ['.nav-link[href="#contact"]', "CONTACT", "CONTACT"],

  [".about-top span:first-child", "01 / GET TO KNOW ME", "01 / FAISONS CONNAISSANCE"],
  [".about-top span:last-child", "SCROLL TO EXPLORE ↓", "DÉFILE POUR EXPLORER ↓"],
  [".about-heading span", "JUST CODE.", "DU CODE."],

  [".about-card:nth-child(1) .about-front small:first-of-type", "01 / THE PERSON", "01 / QUI JE SUIS"],
  [".about-card:nth-child(1) .about-front strong", "THAT'S ME.", "C'EST MOI."],
  [".about-card:nth-child(1) .about-front small:last-of-type", "22 YEARS OLD ↗", "22 ANS ↗"],
  [".about-card:nth-child(1) .about-back strong", "HEY, I'M LUCAS.", "MOI, C'EST LUCAS."],
  [".about-card:nth-child(1) .about-back > span", "I'm 22, passionate and enthusiastic. I put my heart into what I do and I'm always looking to grow.", "J'ai 22 ans, je suis passionné et enthousiaste. Je m'investis à fond dans ce que je fais et j'aime apprendre."],

  [".about-card:nth-child(2) .about-front small:first-of-type", "02 / MY JOURNEY", "02 / MON PARCOURS"],
  [".about-card:nth-child(2) .about-front strong", "AT SAGE.", "CHEZ SAGE."],
  [".about-card:nth-child(2) .about-front small:last-of-type", "DEV & SCRUM ↗", "DEV & SCRUM ↗"],
  [".about-card:nth-child(2) .about-back strong", "TWO ROLES.", "DEUX RÔLES."],
  [".about-card:nth-child(2) .about-back > span", "Almost three years at Sage as an apprentice developer and Scrum Master for my team. Two roles I truly enjoy.", "Bientôt trois ans chez Sage comme développeur en alternance et Scrum Master de mon équipe. Deux rôles que j'adore."],

  [".about-card:nth-child(3) .about-front small:first-of-type", "03 / OFF THE CLOCK", "03 / HORS DU BOULOT"],
  [".about-card:nth-child(3) .about-front strong", "GOOD VIBES.", "GOOD VIBES."],
  [".about-card:nth-child(3) .about-front small:last-of-type", "BASKETBALL & MORE ↗", "BASKET & PLUS ↗"],
  [".about-card:nth-child(3) .about-back strong", "BEYOND WORK.", "EN DEHORS DU BOULOT."],
  [".about-card:nth-child(3) .about-back > span", "Basketball, video games and good times with friends. It's the little things that make life fun.", "Le basket, les jeux vidéo et les bons moments entre amis. Ce sont les petites choses qui rendent la vie belle."],
  [".about-bottom", "A LITTLE BIT OF ME, ONE CARD AT A TIME.", "UN PEU DE MOI, UNE CARTE À LA FOIS."],

  [".skills-header span:first-child", "02 / SKILLS & EXPERTISE", "02 / COMPÉTENCES"],
  [".skills-header span:last-child", "ALWAYS LEARNING ✳", "TOUJOURS EN TRAIN D'APPRENDRE ✳"],
  [".skills-title span", "I KNOW.", "JE MAÎTRISE."],
  [".skills-description", "A mix of code, creativity, teamwork and a little help from AI.", "Un mélange de code, de créativité, de travail en équipe et d'intelligence artificielle."],
  [".skills-footer span:first-child", "LEARNING NEVER STOPS.", "ON N'ARRÊTE JAMAIS D'APPRENDRE."],

  [".experience-top span:first-child", "03 / EXPERIENCE", "03 / EXPÉRIENCE"],
  [".experience-top span:last-child", "LEARNING BY DOING ✳", "APPRENDRE EN PRATIQUANT ✳"],
  [".experience-heading h2 span", "REAL WORLD.", "LE MONDE PRO."],
  [".experience-heading p", "Almost three years of learning, building and growing at Sage. Two roles that genuinely matter to me.", "Bientôt trois ans à apprendre, développer et évoluer chez Sage. Deux rôles qui me tiennent vraiment à cœur."],
  [".experience-card-top > span:first-child", "01 / CURRENT ROLE", "01 / POSTE ACTUEL"],
  [".experience-status", "● CURRENT", "● EN POSTE"],
  [".experience-job-title", "Apprentice Software Engineer", "Développeur logiciel en alternance"],
  [".experience-role", "Software Development & Scrum Master", "Développement logiciel & Scrum Master"],
  [".experience-details > div:first-child strong", "SOFTWARE ENGINEERING", "DÉVELOPPEMENT LOGICIEL"],
  [".experience-details > div:first-child p", "Developing software with Delphi / Pascal as an Apprentice Software Engineer at Sage. A role I take to heart.", "Je développe des logiciels en Delphi / Pascal chez Sage dans le cadre de mon alternance. Un métier qui me passionne."],
  [".experience-details > div:last-child p", "Acting as Scrum Master within my team, putting my Scrum training into practice and helping the team work together.", "Je suis Scrum Master dans mon équipe. Je mets mes formations en pratique et je contribue à la collaboration de l'équipe."],
  [".experience-cv-link span:first-child", "VIEW MY RESUME", "CONSULTER MON CV"],
  [".experience-bottom span:first-child", "MORE THAN JUST WRITING CODE.", "BIEN PLUS QUE DU CODE."],

  [".projects-top span:first-child", "04 / SELECTED WORK", "04 / MES PROJETS"],
  [".projects-top span:last-child", "MADE WITH CURIOSITY ✳", "CRÉÉS AVEC CURIOSITÉ ✳"],
  [".projects-title span", "IDEAS.", "IDÉES."],
  [".project-index", "01 / PERSONAL PROJECT", "01 / PROJET PERSONNEL"],
  [".project-description", "A web app to organize our six-month trip across Asia. A personal project inspired by a real adventure.", "Une application web pour organiser notre voyage de six mois en Asie. Un projet personnel né d'une vraie aventure."],
  [".project-details > span", "THE STORY", "L'HISTOIRE"],
  [".project-details p:first-of-type", "The idea is simple: bring together everything we want to do during our adventure in Asia.", "L'idée est simple : réunir au même endroit tout ce qu'on veut faire pendant notre aventure en Asie."],
  [".project-details p:last-of-type", "A project combining web development, organization and a desire to discover the world.", "Un projet qui mélange développement web, organisation et envie de découvrir le monde."],
  [".projects-footer", "MORE TO COME. THIS IS JUST THE BEGINNING.", "D'AUTRES PROJETS ARRIVENT. CE N'EST QUE LE DÉBUT."],

  [".contact-top span:first-child", "05 / CONTACT", "05 / CONTACT"],
  [".contact-top span:last-child", "HAVE AN IDEA? ✳", "UNE IDÉE ? ✳"],
  [".contact-intro", "GOT SOMETHING IN MIND?", "TU AS UNE IDÉE EN TÊTE ?"],
  [".contact-description", "Got an idea, a project, or just want to say hi? My inbox is open.", "Une idée, un projet ou simplement envie de discuter ? Tu peux m'écrire !"],
  [".contact-footer a", "BACK TO TOP ↑", "RETOUR EN HAUT ↑"]
];

const headingTranslations = [
  [".about-heading", "MORE THAN", "BIEN PLUS QUE"],
  [".skills-title", "THE THINGS", "CE QUE"],
  [".experience-heading h2", "IN THE", "DANS"],
  [".projects-title", "NOT JUST", "PLUS QUE DES"]
];

const categoryTranslations = [
  ["01 / WEB DEVELOPMENT", "01 / DÉVELOPPEMENT WEB"],
  ["02 / SOFTWARE ENGINEERING", "02 / DÉVELOPPEMENT LOGICIEL"],
  ["03 / AGILE & TEAMWORK", "03 / AGILE & ÉQUIPE"],
  ["04 / AI & WORKFLOW", "04 / IA & MÉTHODES DE TRAVAIL"]
];

const translateLeadingText = (selector, value) => {
  const element = document.querySelector(selector);

  if (!element) return;

  const node = [...element.childNodes].find(
    (child) => child.nodeType === Node.TEXT_NODE
  );

  if (node) {
    node.textContent = `\n ${value}\n `;
  }
};

const setPortfolioLanguage = (lang) => {
  const fr = lang === "fr";

  document.documentElement.lang = lang;

  portfolioTranslations.forEach(([selector, en, french]) => {
    const element = document.querySelector(selector);

    if (element) {
      element.textContent = fr ? french : en;
    }
  });

  headingTranslations.forEach(([selector, en, french]) => {
    translateLeadingText(selector, fr ? french : en);
  });

  document.querySelectorAll(".skills-category span").forEach(
    (element, index) => {
      const translation = categoryTranslations[index];

      if (translation) {
        element.textContent = fr
          ? translation[1]
          : translation[0];
      }
    }
  );

  buildContactLetters(lang);
  updateActionLabels();
  updateCareerLabels();

  const contactButtonLabel = document.querySelector(
    "#contact-button span:first-child"
  );

  if (contactButtonLabel) {
    contactButtonLabel.textContent = fr
      ? "ÉCRIS-MOI"
      : "SAY HELLO";
  }

  if (copyFeedback?.classList.contains("is-visible")) {
    if (
      copyFeedback.textContent.includes("✓")
    ) {
      copyFeedback.textContent = fr
        ? "COPIÉ ! ✓"
        : "COPIED! ✓";
    }
  }

  const introSubtitle = document.querySelector(
    ".intro-screen-subtitle"
  );

  if (introSubtitle) {
    introSubtitle.textContent = fr
      ? "RAVI DE TE RENCONTRER ✳"
      : "NICE TO MEET YOU ✳";
  }

  languageButtons.forEach((button) => {
    const selected = button.dataset.lang === lang;

    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  try {
    localStorage.setItem("portfolio-language", lang);
  } catch (error) {
  }

  requestNavigationUpdate();
};

let savedLanguage = "en";

try {
  savedLanguage =
    localStorage.getItem("portfolio-language") === "fr"
      ? "fr"
      : "en";
} catch (error) {
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setPortfolioLanguage(button.dataset.lang);
  });
});

setPortfolioLanguage(savedLanguage);
