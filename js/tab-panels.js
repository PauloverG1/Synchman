(() => {
  const tabMobileButton = document.getElementById("tab-mobile-button");
  const siteSearchTabs = document.getElementById("site-search-tabs");
  const mobileHeading = document.getElementById("mobile-tab-heading");
  const mobileTabsAccordion = document.querySelector(
    ".pagefx-accordion.no-bind"
  );
  const mobileTabsAccordionTrigger = mobileTabsAccordion
    ? mobileTabsAccordion.querySelector(".pagefx-accordion__trigger")
    : null;
  const mobileTabsAccordionTarget = mobileTabsAccordion
    ? mobileTabsAccordion.querySelector(".pagefx-accordion__target")
    : null;

  const mobileTabButtons = mobileTabsAccordionTarget
    ? mobileTabsAccordionTarget.querySelectorAll(".tab")
    : null;

  function setupTabs() {
    document.querySelectorAll(".tab-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const sidebar = button.parentElement;
        const tabs = sidebar.parentElement;
        const tabNumber = button.dataset.forTab;
        const tabActivate = tabs.querySelector(
          `.tab-content[data-tab="${tabNumber}"]`
        );

        if (siteSearchTabs) {
          siteSearchTabs.classList.remove("active");
          siteSearchTabs.ariaHidden = "true";
          if (tabMobileButton) tabMobileButton.classList.remove("active");
          siteSearchTabs.ariaExpanded = "false";
          if (mobileHeading) mobileHeading.innerText = e.target.innerText;
        }

        sidebar.querySelectorAll(".tab-btn").forEach((button) => {
          button.classList.remove("tab-btn-active");
          button.setAttribute("aria-selected", "false");
        });
        tabs.querySelectorAll(".tab-content").forEach((tab) => {
          tab.classList.remove("tab-content-active");
          tab.ariaHidden = "true";
        });
        button.classList.add("tab-btn-active");
        button.setAttribute("aria-selected", "true");
        tabActivate.classList.add("tab-content-active");
        tabActivate.ariaHidden = "false";
      });
    });
  }

  if (mobileTabsAccordion) {
    mobileTabsAccordion.addEventListener("click", (e) => {
      if (e.currentTarget.classList.contains("active")) {
        closeMobileTabsAccordion();
      } else {
        openMobileTabsAccordion();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    window.addEventListener("click", (e) => {
      if (!siteSearchTabs || !tabMobileButton) return;

      if (
        !e.target.closest(".navigation") &&
        !e.target.closest("#tab-mobile-button") &&
        !e.target.closest("#site-search-tabs") &&
        !e.target.closest(".swiper") &&
        siteSearchTabs.classList.contains("active")
      ) {
        siteSearchTabs.classList.remove("active");
        siteSearchTabs.ariaHidden = "true";
        tabMobileButton.classList.remove("active");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".mobile-controls") && mobileTabsAccordion) {
      closeMobileTabsAccordion();
    }
  });

  if (mobileTabButtons) {
    mobileTabButtons.forEach((button) => {
      button.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.currentTarget.click();
        }
      });
    });
  }

  function openMobileTabsAccordion() {
    mobileTabsAccordion.classList.add("active");
    mobileTabsAccordionTrigger.classList.add("active");
    mobileTabsAccordionTrigger.setAttribute("aria-expanded", "true");
    mobileTabsAccordionTarget.classList.add("active");
    mobileTabButtons.forEach((button) => {
      button.setAttribute("tabindex", "0");
    });
  }

  function closeMobileTabsAccordion() {
    mobileTabsAccordion.classList.remove("active");
    mobileTabsAccordionTrigger.classList.remove("active");
    mobileTabsAccordionTrigger.setAttribute("aria-expanded", "false");
    mobileTabsAccordionTarget.classList.remove("active");
    mobileTabButtons.forEach((button) => {
      button.setAttribute("tabindex", "-1");
    });
  }

  function toggleMobileMenu() {
    if (siteSearchTabs.classList.contains("active")) {
      siteSearchTabs.classList.remove("active");
      siteSearchTabs.ariaHidden = "true";
      tabMobileButton.classList.remove("active");
    } else {
      siteSearchTabs.classList.add("active");
      siteSearchTabs.ariaHidden = "false";
      tabMobileButton.classList.add("active");
      siteSearchTabs.ariaExpanded = "true";
    }
  }
  if (tabMobileButton)
    tabMobileButton.addEventListener("click", toggleMobileMenu);
})();
