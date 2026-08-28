class AnimatedChevron {
  constructor(animatedChevron) {
    this.animatedChevron = animatedChevron;
    this.hoverArea = this.animatedChevron.closest("a");
    this.chevronStateChevron = this.animatedChevron.querySelector(
      "#chevronState_chevron"
    );
    this.arrowStateCircle =
      this.animatedChevron.querySelector("#arrowState_circle");
    this.arrowStateLineArrow = this.animatedChevron.querySelector(
      "#arrowState_lineArrow"
    );
    this.arrowStateChevron = this.animatedChevron.querySelector(
      "#arrowState_chevron"
    );
    this.startAnimation = this.startAnimation.bind(this);
    this.reverseAnimation = this.reverseAnimation.bind(this);

    this.init();
  }

  startAnimation() {
    gsap.to(this.chevronStateChevron, {
      duration: 0.2,
      d: this.arrowStateChevron.getAttribute("d"),
      ease: "power1.inOut"
    });

    gsap.to(this.arrowStateCircle, {
      duration: 0.2,
      opacity: 1,
      ease: "power1.inOut"
    });

    gsap.to(this.arrowStateLineArrow, {
      strokeDashoffset: 0,
      duration: 0.2,
      ease: "power1.inOut"
    });
  }

  reverseAnimation() {
    gsap.to(this.chevronStateChevron, {
      duration: 0.2,
      d: "M7.83301 28L15.6663 20L7.83301 12",
      ease: "power1.inOut"
    });

    gsap.to(this.arrowStateCircle, {
      duration: 0.2,
      opacity: 0,
      ease: "power1.inOut"
    });

    gsap.to(this.arrowStateLineArrow, {
      strokeDashoffset: 50,
      duration: 0.2,
      ease: "power1.inOut"
    });
  }

  init() {
    this.hoverArea.addEventListener("mouseenter", this.startAnimation);
    this.hoverArea.addEventListener("mouseleave", this.reverseAnimation);
  }
}

document.querySelectorAll(".animated-chevron").forEach((item) => {
  new AnimatedChevron(item);
});


// smooth scroll footnote

var footnotes = document.querySelectorAll('.footnote');
Array.from(footnotes).forEach(notes => {
    notes.addEventListener('click', function(e) {
        e.preventDefault();
        const destinationId = this.dataset.footnoteid;
        scrollToAction(destinationId);
  });
});

function scrollToAction(element) {
  const ele = document.getElementById(element);
  ele.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
 }