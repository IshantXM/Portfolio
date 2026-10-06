/* ==========================================================================
   Ishant Mohan — Portfolio & Resume Interactive Engine
   Three.js 3D Ambient Mesh · Mouse Physics · Trailing Cursor · Modals
   ========================================================================== */

(function () {
  'use strict';

  // --- 1. Theme Toggle (Light / Dark Mode) ---
  const themeToggle = document.getElementById('themeToggle');
  const storedTheme = localStorage.getItem('ishant-portfolio-theme');
  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('ishant-portfolio-theme', isDark ? 'dark' : 'light');
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    if (!themeToggle) return;
    const isDark = document.documentElement.classList.contains('dark');
    themeToggle.innerHTML = isDark
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
  updateThemeIcon();

  // --- 2. Three.js Background Canvas ---
  let scene, camera, renderer;
  let particleMesh, coreMesh;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let currentScrollY = 0;

  function initThree() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 4.8;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Central wireframe polyhedron
      const coreGeometry = new THREE.IcosahedronGeometry(1.6, 2);
      const isDark = document.documentElement.classList.contains('dark');
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: isDark ? 0x666666 : 0x222222,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      });
      coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
      scene.add(coreMesh);

      // Ambient particle cloud
      const particleCount = 1400;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 16;
      }
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.022,
        color: 0xc84528, // Ember accent
        transparent: true,
        opacity: 0.4
      });
      particleMesh = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleMesh);

      window.addEventListener('resize', onWindowResize);
      document.addEventListener('mousemove', onMouseMove);
      window.addEventListener('scroll', () => { currentScrollY = window.scrollY; }, { passive: true });

      animateThree();
    } catch (e) {
      console.warn("WebGL Three.js canvas initialization skipped:", e);
    }
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function onMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }

  function animateThree() {
    requestAnimationFrame(animateThree);
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;

    if (coreMesh) {
      coreMesh.rotation.x += 0.0015;
      coreMesh.rotation.y += 0.0025 + (currentScrollY * 0.0003);
      coreMesh.position.x = targetX * 1.0;
      coreMesh.position.y = -targetY * 1.0 - (currentScrollY * 0.0008);
    }

    if (particleMesh) {
      particleMesh.rotation.y += 0.0006;
      particleMesh.position.x = targetX * 0.4;
      particleMesh.position.y = -targetY * 0.4;
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  }

  // --- 3. Fluid Trailing Cursor Physics ---
  const dot1 = document.getElementById('cursorDot1');
  const dot2 = document.getElementById('cursorDot2');
  let cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2;
  let ringX = cursorX, ringY = cursorY;

  if (dot1 && dot2 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      dot1.style.transform = `translate3d(${cursorX - 4}px, ${cursorY - 4}px, 0)`;
    });

    function renderCursorRing() {
      ringX += (cursorX - ringX) * 0.16;
      ringY += (cursorY - ringY) * 0.16;
      dot2.style.transform = `translate3d(${ringX - 14}px, ${ringY - 14}px, 0)`;
      requestAnimationFrame(renderCursorRing);
    }
    renderCursorRing();

    // Scale ring on interactive elements
    const hoverTargets = 'a, button, .terminal-block, .project-card, .channel-card, .btn-pill';
    document.querySelectorAll(hoverTargets).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot2.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0) scale(1.6)`;
        dot2.style.borderColor = 'var(--ember)';
        dot2.style.opacity = '0.5';
      });
      el.addEventListener('mouseleave', () => {
        dot2.style.borderColor = 'var(--ink)';
        dot2.style.opacity = '0.25';
      });
    });
  }

  // --- 4. Navbar Scroll & Navigation ---
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Scrollspy active indicator
    let currentId = '';
    const scrollMid = window.scrollY + 200;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollMid >= top && scrollMid < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // --- 5. Fullscreen Mobile Menu ---
  const menuBtn = document.getElementById('menuBtn');
  const fullMenu = document.getElementById('fullMenu');
  const menuLinks = document.querySelectorAll('.menu-link');

  if (menuBtn && fullMenu) {
    menuBtn.addEventListener('click', () => {
      fullMenu.classList.toggle('active');
      document.body.style.overflow = fullMenu.classList.contains('active') ? 'hidden' : '';
    });

    menuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        fullMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- 6. Interactive Modal (PDF & Project Previews) ---
  const iframeModal = document.getElementById('iframeModal');
  const modalIframe = document.getElementById('modalIframe');
  const modalTitle = document.getElementById('modalTitle');
  const closeModalBtn = document.getElementById('closeModal');

  window.openModal = function (url, title) {
    if (!iframeModal || !modalIframe) return;
    if (modalTitle) modalTitle.textContent = title || 'Document Preview';
    modalIframe.src = url;
    iframeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    if (!iframeModal) return;
    iframeModal.classList.remove('active');
    if (modalIframe) modalIframe.src = '';
    document.body.style.overflow = '';
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', window.closeModal);
  }

  if (iframeModal) {
    iframeModal.addEventListener('click', (e) => {
      if (e.target === iframeModal) window.closeModal();
    });
  }

  // ESC key dismisses both menu and modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeModal();
      if (fullMenu && fullMenu.classList.contains('active')) {
        fullMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Attach modal openers
  document.querySelectorAll('[data-open-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.getAttribute('data-modal-url') || 'Official.pdf';
      const title = btn.getAttribute('data-modal-title') || 'Official Resume — Ishant Mohan';
      window.openModal(url, title);
    });
  });

  // Attach terminal click previews
  document.querySelectorAll('.terminal-block[data-url]').forEach((card) => {
    card.addEventListener('click', () => {
      const url = card.getAttribute('data-url');
      const title = card.getAttribute('data-title') || 'Project Preview';
      window.openModal(url, title);
    });
  });

  // Document Ready Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initThree();
  });

})();
