window.onload = function() {
  let carouselControls = document.querySelector(".carousel-controls");
  let carouselSlides = document.querySelectorAll(".carousel-slide");
  let navBar = document.querySelector(".header-nav");
  let carouselImages = [
    "https://source.unsplash.com/-XGhtJXY-yY/2500x2000", 
    "https://source.unsplash.com/xvE9q-Z7U_o/2500x2000",
    "https://source.unsplash.com/rWrBskhjlg4/2500x2000",
    "https://source.unsplash.com/cvfHyRTBepA/2500x2000",
    "https://source.unsplash.com/mNZ-GvOQUUY/2500x2000"
  ]
  let isChangingSlide = false;
  let whichSlide = 1;
  Array.from(carouselSlides).forEach((slide, i) => {
    let div = document.createElement("div");
    let img = document.createElement("img");
    div.classList.add("carousel-slide-border");
    img.src = carouselImages[i];
    img.alt = "Summer Collection";
    slide.appendChild(div);
    slide.appendChild(img);
  });
  function animateCarousel(direction) {
    let firstSlide = document.querySelector(".carousel-slide");
    firstSlide.classList.toggle("animate-slide");
    firstSlide.children[0].classList.toggle("animate-border");
    setTimeout(() => {
      firstSlide.children[0].classList.toggle("animate-border");
      carouselControl(direction);
    }, 450);
  }
  function carouselControl(direction) {
    let currentSlide = 0;
    let carouselSlides = document.querySelectorAll(".carousel-slide");
    if(direction === "next") {
      carouselSlides[currentSlide].className = "carousel-slide";
      let showSlide = carouselSlides[currentSlide].cloneNode(true);
      carouselSlides[currentSlide].parentNode.appendChild(showSlide);
      carouselSlides[currentSlide].parentNode.removeChild(carouselSlides[currentSlide]);
      carouselSlides[currentSlide + 1].className = "carousel-slide show";
      whichSlide = ((whichSlide) % carouselSlides.length) + 1;
    }
    else if(direction === "prev") {
      let firstChild = carouselSlides[currentSlide].parentNode.children[1]
      let showSlide = carouselSlides[carouselSlides.length - 1].cloneNode(true);
      carouselSlides[currentSlide].className = "carousel-slide";
      showSlide.className = "carousel-slide show";
      carouselSlides[currentSlide].parentNode.insertBefore(showSlide, firstChild);
      carouselSlides[currentSlide].parentNode.removeChild(carouselSlides[carouselSlides.length - 1]);
      whichSlide = ((whichSlide + carouselSlides.length - 1) % carouselSlides.length);
      whichSlide = whichSlide === 0 ? carouselSlides.length : whichSlide;
    }
    document.querySelector(".carousel-counter-current").textContent = "0" + whichSlide;
    isChangingSlide = false;
  }
  navBar.addEventListener("click", function(e) {
    let menuButton = e.target.closest(".menu__mobile");
    if(menuButton) {
      document.querySelector(".header-nav .menu").classList.toggle("menu__open");
    }
  });
  carouselControls.addEventListener("click", function(e) {
    let carouselButton = e.target.closest(".carousel-button");
    if(carouselButton && !isChangingSlide) {
      let buttonDirection = carouselButton.classList.contains("carousel-button-prev") ? "prev" : "next";
      isChangingSlide = true;
      animateCarousel(buttonDirection);
    }
  });
};