(() => {

  let MAX_SHOWN = 10;
  function setMaxTiles() {
    MAX_SHOWN = 10;
    if (window.innerWidth < 1345) {
      MAX_SHOWN = 8;
    }
    if (window.innerWidth < 1050) {
      MAX_SHOWN = 6;
    }
    if (window.innerWidth < 768) {
      MAX_SHOWN = 10;
    }
    if (window.innerWidth < 760) {
      MAX_SHOWN = 8;
    }
    if (window.innerWidth < 614) {
      MAX_SHOWN = 9;
    }
    if (window.innerWidth < 468) {
      MAX_SHOWN = 6;
    }

    return MAX_SHOWN;
  }
  postData("offersdata", "/metadata?type=industry", false)
  .then((data) => {
    const industryData = data.industry;
  industryData.sort((a, b) => a.name.localeCompare(b.name));
    generateTemplate("dealsbyCategoryindustryTemplate", "dealsbyCategoryindustryPlaceholder", industryData);
    document.getElementById("dealsbyCategoryindustryPlaceholder").addEventListener("click", function (event) {
      event.preventDefault();
      const title = event.target.id;
      if (title !== "dealsbyCategoryindustryPlaceholder") {
        const url = document.querySelector('[data-searchurl]') ? document.querySelector('[data-searchurl]').dataset.searchurl + "?category=" + encodeURIComponent(title) : "";
        window.location.href = url;
      }
    });
    sections.forEach(setupShowMore);
  })
  .catch((error) => {
    removeSection("hide-deals-by-category");
    console.error(error);
  });

  Handlebars.registerHelper("ifTenth", function (index, options) {
    if (index == MAX_SHOWN) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });


  function setupShowMore(containerEl) {
    const categoryButton = containerEl.querySelector('[data-show-more-button]');
    const categoryLabel = categoryButton.querySelector('[data-show-more-label]');
    let labelClosed = categoryButton.textContent.trim();
    let labelExpanded = labelClosed;
    if (categoryLabel && categoryLabel.dataset && categoryLabel.dataset.label) {
      labelClosed = categoryLabel.dataset.label;
      if (categoryLabel.dataset.labelExpanded) {
        labelExpanded = categoryLabel.dataset.labelExpanded;
      } else {
        labelExpanded = labelClosed;
      }
    }
    const iconRotate = containerEl.querySelector('[data-show-more-icon]');

    // reset in case of resize
    iconRotate.style.transform = '';
    categoryLabel.textContent = labelClosed;

    let categories = containerEl.querySelector('[data-show-more-container]').querySelectorAll(':scope > *');
    let categoryCount = categories.length;
    // for (let c = 0; c < MAX_SHOWN; c++) {
    //   const cat = categories[c];
    //   cat.classList.remove('default-hidden', 'hidden-tile');
    //   cat.ariaHidden = 'false';
    // }
    // for (let c = MAX_SHOWN; c < categoryCount; c++) {
    //   const cat = categories[c];
    //   cat.classList.add('default-hidden', 'hidden-tile');
    //   cat.ariaHidden = 'true';
    // }

    categories.forEach(cat => {
      cat.classList.remove('default-hidden', 'hidden-tile');
      cat.ariaHidden = 'false';
    });

    function expandAndContractList() {
     
      const inner = containerEl.querySelector('[data-show-more-container]');

      if (inner.classList.contains('expanded')) {
        inner.classList.remove('expanded');
      } else {
        inner.classList.add('expanded');
      //  setMaxTiles();
      //  document.querySelectorAll(".category-tile-link")[MAX_SHOWN].focus();
      }

      categories.forEach((el, idx) => {
        if (!el.classList.contains('default-hidden') && el.classList.contains('hidden-tile')) {
          el.classList.add('default-hidden');
          el.ariaHidden = 'true';
        } else {
          el.classList.remove('default-hidden');
          el.ariaHidden = 'false';
         /* if (idx === 10) {
            el.focus();
          }*/
        }
      });

      if (!iconRotate.style.transform) {
        iconRotate.style.transform = 'rotate(180deg)';
        categoryLabel.textContent = labelExpanded;
      } else {
        iconRotate.style.transform = '';
        categoryLabel.textContent = labelClosed;
        containerEl.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    }

    if (categoryButton.dataset.clickInit !== "true") {
      // categoryButton.addEventListener('click', expandAndContractList);
      categoryButton.addEventListener('click', function(){
        setMaxTiles();
        document.querySelectorAll(".category-tile-link")[MAX_SHOWN].focus();
      })
      categoryButton.dataset.clickInit = "true";
    }

    // dynamically adjust the titles to 2-lines
    // containerEl.querySelectorAll('.category-title').forEach(forceTitleToTwoLines);
  }

  const sections = document.querySelectorAll('[data-show-more-section]');
  setMaxTiles();

  var currentWidth = $(window).width();
  $(window).on('resize', debounce(function () {
    var activeWidth = $(window).width();

    if (currentWidth !== activeWidth) {
      setMaxTiles();
      sections.forEach(setupShowMore);
    }
  }, 250));

  $(window).on('orientationchange', debounce(function () {
    setMaxTiles();
    sections.forEach(setupShowMore);
  }, 250));
})();