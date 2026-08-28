class FooterLinkAccordion {
  constructor(group) {
    this.group = group;
    this.trigger = this.group.querySelector("h4");
    this.dropdown = this.group.querySelector(
      ".footer__main-links__link-group__dropdown"
    );
    this.links = this.group.querySelectorAll("a, button");
    this.isMobile = false;
    this.isOpen = false;

    this.trigger.addEventListener("click", this.toggleOpen.bind(this));
    this.trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.toggleOpen();
      }
    });

    this.setupMobile();
    window.addEventListener("resize", this.setupMobile.bind(this));
  }

  setupMobile() {
    if (window.innerWidth < 992 && !this.isMobile) {
      this.isMobile = true;
      this.trigger.tabIndex = 0;
      this.trigger.setAttribute("role","button");
      this.trigger.setAttribute("aria-expanded","false");
      if (!this.isOpen) {
        this.links.forEach((link) => {
          link.tabIndex = -1;
        });
      }
    } else if (window.innerWidth >= 992 && this.isMobile) {
      this.isMobile = false;
      this.trigger.removeAttribute("role","button");
      this.trigger.removeAttribute("aria-expanded");
      this.trigger.tabIndex = -1;
      this.links.forEach((link) => {
        link.tabIndex = 0;
      });
    }
    const noAnchorElement = document.getElementsByClassName('noAnchor');
    for (let i = 0; i < noAnchorElement.length; i++) {
      const element = noAnchorElement[i];
      element.setAttribute('tabindex', '-1');
    }
  }

  toggleOpen() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
   
      this.trigger.classList.add("open");
      if( this.isMobile == true){
      this.trigger.setAttribute("aria-expanded", "true");}
   this.dropdown.classList.add("open");
    
    this.links.forEach((link, i) => {
      link.tabIndex = 0;
    /*  if (i === 0) {
        link.focus();
      }*/
    });
    const noAnchorElement = document.getElementsByClassName('noAnchor');
    for (let i = 0; i < noAnchorElement.length; i++) {
      const element = noAnchorElement[i];
      element.setAttribute('tabindex', '-1');
    }
    this.isOpen = true;
  }

  close() {
    this.trigger.classList.remove("open");
    if( this.isMobile == true){ 
    this.trigger.setAttribute("aria-expanded", "false");}
    this.dropdown.classList.remove("open");
    
    this.links.forEach((link) => {
      link.tabIndex = -1;
    });
    const noAnchorElement = document.getElementsByClassName('noAnchor');
    for (let i = 0; i < noAnchorElement.length; i++) {
      const element = noAnchorElement[i];
      element.setAttribute('tabindex', '-1');
    }
    this.isOpen = false;
  }
}

document
  .querySelectorAll(".footer__main-links__link-group")
  .forEach((group) => {
    new FooterLinkAccordion(group);
  });

document.addEventListener("DOMContentLoaded",function(){
  const noAnchorElement = document.getElementsByClassName('noAnchor');
for (let i = 0; i < noAnchorElement.length; i++) {
  const element = noAnchorElement[i];
  element.setAttribute('tabindex', '-1');
}
})
