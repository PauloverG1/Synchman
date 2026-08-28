const numberOfSlides = document.querySelectorAll(".glide__slide").length;

let glide;

if (numberOfSlides > 1) {
  glide = new Glide(".glide", {
    type: "carousel",
    autoplay: 5000,
    hoverpause: true,
    keyboard: true,
    gap: 0
  });
} else {
  glide = new Glide(".glide", {
    type: "carousel",
    autoplay: false,
    hoverpause: false,
    keyboard: false,
    gap: 0,
    swipeThreshold: false,
    dragThreshold: false
  });

  if (document.querySelector(".glide__bullets")) {
    document.querySelector(".glide__bullets").style.display = "none";
  }
}

glide.mount();
if (numberOfSlides === 1)
  document.querySelector(".glide--swipeable").style.cursor = "default";

// making the bullets change to active instantly upon click as opposed to when the animation is complete
glide.on("move", function (event) {
  document.querySelectorAll(".glide__bullet").forEach(function (bullet) {
    bullet.classList.remove("glide__bullet--active");
  });
 
  var currentBullet = document.querySelector(
    '.glide__bullet[data-glide-dir="=' + glide.index + '"]'
  );
  if (currentBullet) {
    currentBullet.classList.add("glide__bullet--active");
  }
});

function updateLinkTabIndexes() {
  const slides = document.querySelectorAll(".glide__slide");

  slides.forEach((slide) => {
    const links = slide.querySelectorAll("a");
	
    if (slide.classList.contains("glide__slide--active")) {    
      const offerSlide=slide.querySelector(".hero-carousel-slide-copy");  
      var element = document.querySelector(".hero");
      var bounding = element.getBoundingClientRect();
      if( bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)){
        if((offerSlide.hasAttribute(['data-sfddloffers'])) && (offerSlide.hasAttribute(['data-edited'])=== false)){
          const syfOfferId = offerSlide.getAttribute("data-sfddlOffers");
          _SFDDL.Homeoffers.offerIds = syfOfferId;
          console.log( "_SFDDL.Homeoffers.offerIds:"+ _SFDDL.Homeoffers.offerIds);
    let utagEvent = new CustomEvent("syfbannerevent");
    window.dispatchEvent(utagEvent);
    offerSlide.setAttribute("data-edited" ,"true");
        }
      }
	  slide.setAttribute('aria-hidden', false);
      links.forEach((link) => {
        link.setAttribute("tabindex", 0);		
      });

    } else {
	  slide.setAttribute('aria-hidden', true);
      links.forEach((link) => {
        link.setAttribute("tabindex", -1);
      });
    }

  });
 
}

glide.on("run.after", updateLinkTabIndexes);
updateLinkTabIndexes();
