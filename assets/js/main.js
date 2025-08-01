
(function () {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true)
  const navbarlinksActive = () => {
    let position = window.scrollY + 200
    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return
      let section = select(navbarlink.hash)
      if (!section) return
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active')
      } else {
        navbarlink.classList.remove('active')
      }
    })
  }
  window.addEventListener('load', navbarlinksActive)
  onscroll(document, navbarlinksActive)

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos,
      behavior: 'smooth'
    })
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function (e) {
    select('body').classList.toggle('mobile-nav-active')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function (e) {
    if (select(this.hash)) {
      e.preventDefault()

      let body = select('body')
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Preloader
   */
  let preloader = select('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove()
    });
  }

  /**
   * Hero type effect
   */
  const typed = select('.typed')
  if (typed) {
    let typed_strings = typed.getAttribute('data-typed-items')
    typed_strings = typed_strings.split(',')
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Skills animation
   */
  let skilsContent = select('.skills-content');
  if (skilsContent) {
    new Waypoint({
      element: skilsContent,
      offset: '80%',
      handler: function (direction) {
        let progress = select('.progress .progress-bar', true);
        progress.forEach((el) => {
          el.style.width = el.getAttribute('aria-valuenow') + '%'
        });
      }
    })
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item'
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function (e) {
        e.preventDefault();
        portfolioFilters.forEach(function (el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function () {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Initiate portfolio details lightbox 
   */
  const portfolioDetailsLightbox = GLightbox({
    selector: '.portfolio-details-lightbox',
    width: '90%',
    height: '90vh'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  // Dynamic Portfolio

  document.addEventListener("DOMContentLoaded", () => {
    const portfolioItems = [

      {
        id: "akki",
        img: "assets/img/portfolio/app/akki6.png",
        title: "AKKI",
        category: "App",
        filter: "filter-app"
      },
      {
        id: "yai",
        img: "assets/img/portfolio/app/YAI Angular Ionic.png",
        title: "YAI - life bot",
        category: "App",
        filter: "filter-app"
      },
      {
        id: "react-app",
        img: "assets/img/portfolio/app/phsyco.png",
        title: "react-app",
        category: "App",
        filter: "filter-app"
      },
      {
        id: "ospp",
        img: "assets/img/portfolio/web/ospp.png",
        title: "OSPP - Landing page",
        category: "Web",
        filter: "filter-web"
      },
      {
        id: "IA",
        img: "assets/img/portfolio/web/insurance.png",
        title: "Insurance App",
        category: "Web",
        filter: "filter-web"
      },
      {
        id: "ecom",
        img: "assets/img/portfolio/web/myDawa.png",
        title: "Telehealth Ecommerce App",
        category: "Web",
        filter: "filter-web"
      },
      {
        id: "sb",
        img: "assets/img/portfolio/web/smartbalancer.png",
        title: "Smart Balancer App",
        category: "Web",
        filter: "filter-web"
      },
      {
        id: "softo",
        img: "assets/img/portfolio/web/softoteam.png",
        title: "Softoteam Landing Page",
        category: "Web",
        filter: "filter-web"
      },
      {
        id: "webmantis",
        img: "assets/img/portfolio/web/webmantis.png",
        title: "Webmantis Landing Page",
        category: "Web",
        filter: "filter-web"
      },

    ];

    const container = document.getElementById("portfolio-items");

    if (container) {
      portfolioItems.forEach(item => {
        const div = document.createElement("div");
        div.className = `col-lg-4 col-md-6 portfolio-item ${item.filter}`;
        div.innerHTML = `
        <div class="portfolio-wrap">
          <img src="${item.img}" class="img-fluid" alt="${item.title}">
          <div class="portfolio-info">
            <h4>${item.title}</h4>
            <p>${item.category}</p>
            <div class="portfolio-links">
              <a href="${item.img}" data-gallery="portfolioGallery" class="portfolio-lightbox" title="${item.title}">
                <i class="bx bx-plus"></i>
              </a>
              <a href="portfolio-details.html" class="portfolio-details-lightbox" data-glightbox="type: external" title="Portfolio Details" data-id="${item.id}" '>
                <i class="bx bx-link"></i>
              </a>
            </div>
          </div>
        </div>
      `;
        container.appendChild(div);
      });
      // Now attach event listeners after DOM elements are inserted
      const detailLinks = document.querySelectorAll(".portfolio-details-lightbox");
      detailLinks.forEach(link => {
        link.addEventListener("click", function () {
          const projectId = this.getAttribute("data-id");
          setSelectedProject(projectId);
        });
      });
    }
  });


  function setSelectedProject(id) {
    localStorage.setItem("selectedProjectId", id);
  }


  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  });

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();


  function calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  // Set the DOB here (format: YYYY-MM-DD)
  const dob = "2001-03-20";
  const age = calculateAge(dob);

  // Inject into the DOM when page loads
  window.addEventListener("DOMContentLoaded", function () {
    const ageElement = document.getElementById("age");
    if (ageElement) {
      ageElement.textContent = age;
    }
  });


  const projectDetails = [
    {
      id: "akki",
      title: "AKKI",
      category: "App",
      client: "TechX",
      date: "Aug 2025",
      url: "https://akki.example.com",
      description: "AKKI is a productivity tool designed for task automation.",
      images: [
        "assets/img/portfolio/app/akki6.png",
        "assets/img/portfolio/app/akki2.png",
        "assets/img/portfolio/app/akki3.png"
      ]
    },
    {
      id: "yai",
      title: "YAI - life bot",
      category: "App",
      client: "YAI Inc",
      date: "Jul 2025",
      url: "https://yai.example.com",
      description: "YAI is an AI-powered assistant for life coaching.",
      images: [
        "assets/img/portfolio/app/YAI Angular Ionic.png"
      ]
    }
    // ... more project detail entries
  ];

  document.addEventListener("DOMContentLoaded", function () {
    const selectedId = localStorage.getItem("selectedProjectId");
    const project = projectDetails.find(p => p.id === selectedId);
    if (!project) return;

    // Update image slider
    const swiperWrapper = document.querySelector(".portfolio-details-slider .swiper-wrapper");
    swiperWrapper.innerHTML = project.images.map(img => `
      <div class="swiper-slide">
        <img src="${img}" alt="${project.title}">
      </div>
    `).join('');

    new Swiper(".portfolio-details-slider", {
      speed: 400,
      loop: true,
      pagination: {
        el: ".swiper-pagination",
        type: "bullets",
        clickable: true
      }
    });

    // Fill in the info
    document.querySelector(".portfolio-info ul").innerHTML = `
      <li><strong>Category</strong>: ${project.category}</li>
      <li><strong>Client</strong>: ${project.client}</li>
      <li><strong>Project date</strong>: ${project.date}</li>
      <li><strong>Project URL</strong>: <a href="${project.url}" target="_blank">${project.url}</a></li>
    `;

    document.querySelector(".portfolio-description h2").innerText = project.title;
    document.querySelector(".portfolio-description p").innerText = project.description;
  });

})()
