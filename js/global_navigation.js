// The following classes are instantiated:
// - GlobalNavigation
//   ├── UtilityBar
//   ├── GlobalNavSearchForm
//   ├── MultiAccessLogin
//   └── SubMenus[]
//       └── Marketplace
//           └── SubSubmenu ("Shop by category")
//       └── Financing
//       └── Banking
//       └── Business
//       └── About Us
//       └── Help

const mobileBreakpoint = 1080;

const iOSUser =
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

class UtilityBar {
  constructor(utilityBarElement) {
    this.listItemElements = utilityBarElement.querySelectorAll("li");
    this.anchorElements = utilityBarElement.querySelectorAll("a");
    this.activeAnchorIndex = 0;

    this.setUpEventListeners();
  }

  setUpEventListeners() {
    this.anchorElements.forEach((anchorElement, i) => {
      anchorElement.addEventListener("click", (event) => {
        this.setActiveLink(i);
      });
    });
  }

  setActiveLink(linkIndex) {
    this.activeAnchorIndex = linkIndex;

    this.listItemElements.forEach((listItemElement, i) => {
      if (i === linkIndex) {
        listItemElement.classList.add("selected");
      } else {
        listItemElement.classList.remove("selected");
      }
    });
  }
}

class MultiAccessLogin {
  constructor(loginArea) {
    this.loginArea = loginArea;
    this.noDropdown = this.loginArea.classList.contains("no-dropdown");
    this.loginButton = this.loginArea.querySelector("#login-button");
    
    // tabs containers
    this.tabs = this.loginArea.querySelectorAll(".login-menu__tab");
    this.tabPanels = Array.from(
      this.loginArea.querySelectorAll(".login-menu__tab-panel")
    );
    this.tabsContainer = this.loginArea.querySelector(
      ".login-menu__tabs-content"
    );
    this.customerLoginLinks = this.loginArea.querySelectorAll(
      ".customer-login-link"
    );
   


      this.scrollY = window.scrollY;

      // props to do with the search functionality
      this.loginMenuIsOpen = false;
      this.searchResultsAreOpen = false;
   
      
      this.searchResultsData = [];
      this.loginSearchForm = this.loginArea.querySelector(".standard-login-menu #login-search-form");
      this.loginSearchInput = this.loginArea.querySelector(".standard-login-menu #login-search-input");
	   this.loginSearchForm2 = this.loginArea.querySelector(".campaign-login-menu #login-search-form");
      this.loginSearchInput2 = this.loginArea.querySelector(".campaign-login-menu #login-search-input");
  
      this.consumerLinks = this.noDropdown
      ? []
      : this.loginArea
          .querySelector(".login-link-list.consumer")
          .querySelectorAll("a");
    this.businessLinks = this.noDropdown
      ? []
      : this.loginArea
          .querySelector(".login-link-list.business")
          .querySelectorAll("a");
          this.loginSearchErrorEl = this.loginSearchForm
        ? this.loginSearchForm.querySelector(".login-search-error")
        : null;
  
      this.noResultsErrorMessages = [
        "Uh-oh! Looks like we couldn’t find your brand account. Try changing your search a bit.",
        "Hmm… your brand account didn’t pop up. Maybe check your spelling or try different words?",
        "No luck finding your brand account! Try a simpler search or check your spelling.",
        "Whoops! We came up empty. Give it another shot with different terms."
      ];
      this.noResultsErrorIndex = 0;
  
      this.loginSearchResultsDiv = this.loginArea.querySelector(
        "#login-search-results"
      );
      this.loginSearchResultsDiv2 = this.loginArea.querySelector(
        ".campaign-login-menu #login-search-results"
      );
      this.loginSearchResultsUl = this.loginSearchResultsDiv
        ? this.loginSearchResultsDiv.querySelector("ul")
        : null;
       this.loginSearchResultsUl2 = this.loginSearchResultsDiv2
        ? this.loginSearchResultsDiv2.querySelector("ul")
        : null;
      this.loginSearchResultsCloseButton = this.loginSearchResultsDiv
        ? this.loginSearchResultsDiv.querySelector("#login-search-results-close")
        : null;
       /* this.loginSearchResultsCloseButton2 = this.loginSearchResultsDiv2
        ? this.loginSearchResultsDiv2.querySelector("#login-search-results-close")
        : null;*/
  
//      this.brandShortcuts = this.loginArea.querySelectorAll(".shortcut");

this.focusableElements = [
    ...this.tabs,
    ...this.consumerLinks,
    ...this.businessLinks,
      ...this.customerLoginLinks,
  // ...this.brandShortcuts,
  this.loginSearchInput,
  this.loginSearchInput2,
  document.querySelector("[name='submit-login-search']"),
  document.querySelector(".campaign-login-menu [name='submit-login-search']")
];
  //  this.loginMenuIsOpen = false;
   // this.pageFooterLoginTrigger = document.querySelector("[data-open-login]");

    if (this.focusableElements[0] !== null) {
      this.focusableElements.forEach((el) => {
        el.setAttribute("tabindex", "-1");
      });
    }
    this.recalculateStickyNavHeight();
        this.setUpEventListeners();
  }

  setUpEventListeners() { 
     //
    // Window
    //
    window.addEventListener("resize", () => {
        // set sticky nav height css variable
        // used in sizing the search results when viewport is short
        const stickyNavHeight =
          document.querySelector(".global-nav").offsetHeight;
        this.loginArea.style.setProperty(
          "--sticky-nav-height",
          stickyNavHeight + "px"
        );
      });
     //
    // Document
    //
    document.addEventListener("click", (event) => {
      const elementsAtPoint = document.elementsFromPoint(
      event.clientX,
      event.clientY
    );
    if (
      (!event.target.closest(".search-dropdown__popular__login-prompt") &&
        !event.target.closest(".login-area") &&
        !event.target.closest("[data-open-login]")) ||
      (event.target.classList.contains("login-dropdown") &&
        !elementsAtPoint.find((el) => el.classList.contains("login-shadow")))
    ) {
      this.closeLoginMenu();
    }
    });


	//
    // Login Area
    //

    this.loginArea.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (this.searchResultsAreOpen) {
          this.closeSearchResults();
        } else {
          this.closeLoginMenu();
          this.loginButton.focus();
        }
      }
    });

    /*Jhumur: Code Syncup*/

    this.loginArea.addEventListener("focusout", (event) => {
      if (!event.relatedTarget) return;
      if (!event.relatedTarget.closest(".login-area")) {
        this.closeLoginMenu();
      }
    });
	//
    // Login Button
    //
    this.loginButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = "http://localhost:3000/login";
    });
  /* if(this.pageFooterLoginTrigger!==null){
    this.pageFooterLoginTrigger.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo(0, 0);
      this.openLoginMenu();
    });
    }
*/
    if (this.noDropdown) {
      const anchor = this.loginButton.parentElement;
      anchor.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          event.target.click();
        }
      });
    }
	//
    // Customer Login Links
    //
    this.customerLoginLinks.forEach((link) => {
      link.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          event.target.closest(".customer-login-link").click();
        }
      });
    });
    // Tabs within the dropdown menu
    this.tabs.forEach((tab) => {
        tab.addEventListener("click", (event) => {
          this.animateMenuHeight(event.currentTarget);
        });
      });
 //
    // Search experience
    //
    if (this.loginSearchForm) {
      this.loginSearchForm.addEventListener("submit", (e) => {
        this.onLoginSearch(e, true);
      });
	  this.loginSearchForm2.addEventListener("submit", (e) => {
        this.onLoginSearch(e, true);
      });
this.loginSearchInput2.addEventListener(
        "input",
        this.onLoginSearch.bind(this)
      );

      this.loginSearchInput.addEventListener(
        "input",
        this.onLoginSearch.bind(this)
      );

      // focus and blur listeners counteract the iOS behavior of scrolling the page up when the keyboard is opened
      this.loginSearchInput.addEventListener("focus", () => {
        this.scrollY = window.scrollY;
      });

      this.loginSearchInput.addEventListener("blur", () => {
        if (
          this.scrollY !== window.scrollY &&
          window.innerWidth < mobileBreakpoint
        ) {
          window.scrollTo({ top: this.scrollY, behavior: "instant" });
        }
      });
      this.loginArea.querySelectorAll(".login-search-results-close").forEach((ele) =>{
  ele.addEventListener(
    "click",
    this.closeSearchResults.bind(this)
      );
 });
     
      

      this.loginSearchInput.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") {
          // If the search results are open, move focus to the last result
          if (this.searchResultsAreOpen) {
            const firstResult = this.loginSearchResultsUl.firstElementChild;
            if (firstResult) {
              firstResult.querySelector("a").focus();
            }
          }
        }
      });

      this.loginSearchInput2.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") {
          // If the search results are open, move focus to the last result
          if (this.searchResultsAreOpen) {
            const firstResult = this.loginArea.querySelector(`[data-search-results-container-for="${event.currentTarget.dataset.loginInputSearchBar}"]`).firstElementChild;
            if (firstResult) {
              firstResult.querySelector("a").focus();
            }
          }
        }
      });

      this.loginSearchResultsUl.addEventListener(
        "keydown",
        this.handleSearchResultsKeyboardNavigation.bind(this)
      );
      this.loginSearchResultsUl2.addEventListener(
        "keydown",
        this.handleSearchResultsKeyboardNavigation.bind(this)
      );
    }	 
    //
    // Other triggers throughtout the site that open the login menu
    //

    document.querySelectorAll("[data-open-login]").forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        this.openLoginMenu();
      });
    });
  }

  toggleLoginMenu() {
    window.location.href = "http://localhost:3000/login";
  }

  openLoginMenu() {
    window.location.href = "http://localhost:3000/login";
  }

  closeLoginMenu() {
    if (this.noDropdown) {
      return;
    }
    document
      .querySelector(".page-container")
      .classList.remove("mobile-login-open");
    document.body.classList.remove("mobile-login-open");
    this.loginArea.querySelector(".login-button").setAttribute("aria-expanded","false");
    this.loginArea.querySelector(".login-button").setAttribute("data-reason", "login-open");
   // document.querySelector("#login-button").setAttribute("data-reason", "login-open");
    this.loginArea.classList.remove("open");
    this.focusableElements.forEach((element) => {
      element.setAttribute("tabindex", "-1");
    });
    this.loginMenuIsOpen = false;
    this.closeSearchResults(false);
    setTimeout(() => {
      this.loginSearchInput.value = "";
      this.loginSearchInput2.value=""
    }, 200);
  }
  recalculateStickyNavHeight() {
    const stickyNavHeight = document.querySelector(".global-nav").offsetHeight;
    this.loginArea.style.setProperty(
      "--sticky-nav-height",
      stickyNavHeight + "px"
    );
  }
  animateMenuHeight(button) {
    const target = button.dataset.tab;
    const newPanel = this.tabPanels.find(
      (panel) => panel.dataset.tab === target
    );
    const activePanel = this.tabPanels.find((panel) =>
      panel.classList.contains("active")
    );

    if (newPanel !== activePanel) {
      activePanel.classList.remove("active");
      newPanel.classList.add("active");
      // Step 1: fix the current height
      this.tabsContainer.style.height = this.tabsContainer.scrollHeight + "px";
      this.tabsContainer.style.overflow = "hidden";

      // Step 2: force a reflow
      requestAnimationFrame(() => {
        // Step 3: update to new height
        this.tabsContainer.style.height = newPanel.scrollHeight + "px";
      });
      this.tabsContainer.addEventListener(
        "transitionend",
        () => {
          this.tabsContainer.style.height = "auto";
          this.tabsContainer.style.overflow = "auto";
        },
        { once: true }
      );
    }
  }

  onLoginSearch(e, triggeredBySubmit = false) {
    e.preventDefault();

    var currentTargetSearchDiv=e.currentTarget;
    var searchQuery;
    if(triggeredBySubmit == true){
       searchQuery = e.currentTarget.elements['login-search-input'].value
    }else{
       searchQuery = e.currentTarget.value.trim();
    }
    

    let hasError = false;

    if (triggeredBySubmit) {
      hasError = this.showLoginSearchError(searchQuery,currentTargetSearchDiv);
    }

    if (!hasError && searchQuery.length >= 2) {
     // this.loginSearchErrorEl.style.display = "none";
      document.querySelector(`[data-search-bar-error="${e.currentTarget.dataset.loginInputSearchBar}"]`).style.display="none";
     
      this.runQuery(searchQuery,currentTargetSearchDiv);
      
  
    } else if (hasError && searchQuery.length >= 2) {
      // do not run query, simply show error (being handled by showLoginSearchError)
    } else {
      this.searchResultsData = [];
     // this.loginSearchResultsUl.innerHTML = ""; 
     if(triggeredBySubmit){
      document.querySelector(`[data-search-results-container-for="${e.currentTarget.dataset.loginSearchBar}"] ul`).innerHTML=""; 
     }else{
      document.querySelector(`[data-search-results-container-for="${e.currentTarget.dataset.loginInputSearchBar}"] ul`).innerHTML=""; 
     }
    
    }

     // recalculate form height for positioning the search results above it
    // (Height of form changes with the length of error message)

    var formHeight ;
    if(triggeredBySubmit){
     formHeight=document.querySelector(`[data-search-form-wrapper="${e.currentTarget.dataset.loginSearchBar}"]`).offsetHeight;
    }else{
      formHeight=document.querySelector(`[data-search-form-wrapper="${e.currentTarget.dataset.loginInputSearchBar}"]`).offsetHeight;
    }
      // set css variable
      this.loginArea.style.setProperty(
        "--login-search-form-height",
        formHeight + "px"
      );
  }

  showLoginSearchError(searchQuery, e) {
    let errorMessage = null;

    if (searchQuery.length < 2) {
      errorMessage = "Please enter a search term with at least 2 characters.";
    }    else if (searchQuery === "No results") {
      errorMessage = this.noResultsErrorMessages[this.noResultsErrorIndex];

      this.noResultsErrorIndex =
        (this.noResultsErrorIndex + 1) % this.noResultsErrorMessages.length;
    } else if (this.searchResultsData =="" ) {
      if(e.dataset.loginSearchBar=="campaign-search-bar"){
        errorMessage =
        "Please choose an option from our partner list or start a new search.";
      }else{
      errorMessage =
        "This search isn’t coming up. Please try again.";
      }
    }

    if (errorMessage) {
      e.querySelector(".login-search-error").style.display = "block";
      e.querySelector(".login-search-error").textContent = errorMessage;
    }

    return errorMessage;
  }

  runQuery(query,currentTargetSearchDiv) {
    // TODO: Implement real query logic here

    // Some fake data
    if (query === "No results") {
      this.searchResultsData = [];
    } else {
      console.log("Fetch results for login search query:", query);
        this.searchResultsData=this.getFilteredData(allLoginBrands, query);
    }

    this.openSearchResults(currentTargetSearchDiv);
  }

  openSearchResults(e) {
    document.querySelector(`[data-search-results-container-for="${e.dataset.loginInputSearchBar}"] ul`).innerHTML="";
    //this.loginSearchResultsUl.innerHTML = "";

    document.querySelector(`[data-search-result-close="${e.dataset.loginInputSearchBar}"]`).setAttribute("tabindex", "0");
    this.searchResultsData.forEach((result, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.innerHTML = `<a href="${result.loginURL}" class="search-result-link syfclickevent" data-index="${i}" class="syfclickevent" data-reason="${result.name}" data-object="login-hero" data-type="link"><span>${result.name}</span><img src="/sites/syc/img/login-icon_external_link.png" height="" width="18" alt="External link icon"/></a>`;
      document.querySelector(`[data-search-results-container-for="${e.dataset.loginInputSearchBar}"] ul`).appendChild(li);
    });

    document.querySelector(`[data-search-results-container-for="${e.dataset.loginInputSearchBar}"]`).classList.add("open");
    this.searchResultsAreOpen = true;

    this.customerLoginLinks.forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });
    this.consumerLinks.forEach((link) => {
        link.setAttribute("tabindex", "-1");
      });
      document.querySelector(`[data-search-result-close="${e.dataset.loginInputSearchBar}"]`).style.display = "block";
    
  }
   getFilteredData(data, value) {
    var starswith = [];
    var contains = [];
    let lastIndex = 0;
    let startsArray = [];
    const encryptVal = value.replace("&","&amp;").replace("'","&#39;")
    data.map((x) => {
      if (x.name.toLowerCase().startsWith(encryptVal.toLowerCase())) {
        starswith.push(x);
        lastIndex += 1;
      } else if (x.name.toLowerCase().includes(encryptVal.toLowerCase())) {
        contains.push(x);
      }
    
    });
  
   
    //lastCloseMatchBrand = contains.length > 0 ? true : false;
    if (lastIndex > 0) {
    
      startsArray = JSON.parse(JSON.stringify(starswith));
      /*startsArray[lastIndex - 1].id = "last-close-match";
      startsArray[lastIndex - 1].divider = contains.length > 0 ? true : false;*/
    }
    return [...startsArray, ...contains];
  }

  closeSearchResults(focusInput = true) {
   if(focusInput == false){
    document.querySelectorAll(`[data-search-results-container-for]`).forEach(e=>{
      e.classList.remove("open");
      if(document.querySelector(`[data-search-result-close="${e.dataset.searchResultsContainerFor}"`)){
        document.querySelector(`[data-search-result-close="${e.dataset.searchResultsContainerFor}"`).setAttribute("tabindex","-1");
      }
     
     if(e.dataset.searchResultsContainerFor=="campaign-search-bar"){
      document.querySelector(`[data-search-result-close="${e.dataset.searchResultsContainerFor}"]`).style.display = "none";
     }
    })
   }else{
    document.querySelector(`[data-search-results-container-for="${focusInput.currentTarget.dataset.searchResultClose}"]`).classList.remove("open");
    focusInput.currentTarget.setAttribute("tabindex", "-1");
    if(focusInput.currentTarget.dataset.searchResultClose =="campaign-search-bar"){
      document.querySelector(`[data-search-result-close="${focusInput.currentTarget.dataset.searchResultClose}"]`).style.display = "none";
    }
  }

  this.loginArea.querySelectorAll("[data-search-bar-error]").forEach(e=>{e.style.display = "none";})
    this.searchResultsAreOpen = false;
    const searchResultLinks = document.querySelectorAll("[data-search-results-container-for] ul .search-result-link");
    searchResultLinks.forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });
    

   
    if (focusInput) {
      this.loginSearchInput.focus();
    }
  }

  handleSearchResultsKeyboardNavigation(event) {
    const links = event.currentTarget.querySelectorAll("a");

    if (event.target.classList.contains("search-result-link")) {
      const index = parseInt(event.target.dataset.index, 10);
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (index > 0) {
          links[index - 1].focus();
        } else {
          this.loginSearchResultsCloseButton.focus();
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (index < links.length - 1) {
          links[index + 1].focus();
        } else {
          this.loginSearchInput.focus();
        }
      }
    }
  }
}
class GlobalNavSearchForm {
  constructor(searchArea, loginArea, parentClass) {
	this.parentClass = parentClass;
    this.searchAreaEl = searchArea;
	this.loginArea = loginArea;
    this.gridCenter = document.querySelector(".grid-center");
    this.formWrapper = this.searchAreaEl.querySelector(".form-wrapper");
    this.formEl = this.formWrapper.querySelector("form");
    this.toggleButton = this.formWrapper.querySelector(".toggle-button");
    this.formInput = this.formWrapper.querySelector("input");
    this.searchInputDiv = this.formWrapper.querySelector("#search-input"); 
    this.submitButton = this.formWrapper.querySelector("button[type=submit]");
	this.searchDropdown = this.searchAreaEl.querySelector(".search-dropdown");
    this.searchDropdownPopular = this.searchDropdown.querySelector(
      ".search-dropdown__popular"
    );
    this.searchDropdownSuggestions = this.searchDropdown.querySelector(
      ".search-dropdown__suggestions"
    );
    this.loginPrompt = this.searchDropdownPopular.querySelector(
      ".search-dropdown__popular__login-prompt"
    );
    

    this.formIsOpen = false;
    this.windowWidth = window.innerWidth;
    this.YPos = window.scrollY;
    this.updateAriaHidden();     // Hiding aria-hidden attribute for mobile devices

    window.addEventListener("resize", () =>{
     this.windowWidth = window.innerWidth;
     this.updateAriaHidden();
    });

    if (this.windowWidth < mobileBreakpoint) {
      this.closeSearchForm();
      this.toggleButton.setAttribute("tabindex", "-1");
    }
	this.searchDropdown
      .querySelectorAll("a, .search-dropdown__popular__login-prompt")
      .forEach((link) => {
        link.setAttribute("tabindex", "-1");
      });

    if (this.windowWidth < mobileBreakpoint) {
      this.closeSearchForm();
      this.toggleButton.setAttribute("tabindex", "-1");
    }
    this.setUpEventListeners();
  }

  updateAriaHidden(){
     if (this.windowWidth < mobileBreakpoint){
      document.getElementById("search-input")?.removeAttribute("aria-hidden");
      document.querySelector("search-dropdown")?.removeAttribute("aria-hidden");
      document.querySelectorAll(".right-links li").forEach((li) => {
        li.removeAttribute("aria-hidden");
      });
    }
     else {
      document.getElementById("search-input")?.setAttribute("aria-hidden","true");
      document.querySelector("search-dropdown")?.setAttribute("aria-hidden","true");
    }
  }

  setUpEventListeners() {
	//
    // Document
    //
    document.addEventListener("focusin", (event) => {
      if (!event.target.closest(".search-area")) {
        this.closeSearchDropdown();
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".search-area")) {
        this.closeSearchDropdown();
      }
    }); 
	//
    // Window
    //
    window.addEventListener("resize", () => {
      if (
        this.windowWidth >= mobileBreakpoint &&
        window.innerWidth < mobileBreakpoint
      ) {
        // open the form if going to mobile view
		this.gridCenter.style.removeProperty("overflow");
        this.openSearchForm();
		this.closeSearchDropdown();
        this.toggleButton.setAttribute("tabindex", "-1");
        this.formInput.setAttribute("tabindex", "-1");
        this.submitButton.setAttribute("tabindex", "-1");
        this.windowWidth = window.innerWidth;
      } else if (
        this.windowWidth < mobileBreakpoint &&
        window.innerWidth >= mobileBreakpoint
      ) {
        // close the form if going to desktop view
        this.closeSearchForm();
		this.searchAreaEl.style.removeProperty("transition");
        this.closeSearchDropdown();
        this.toggleButton.setAttribute("tabindex", "0");
        this.windowWidth = window.innerWidth;
      }
    });

	//
    // Search Input
    //
    // On iOS, the keyboard will push the page up when the input is focused. This code keeps track of the scroll position when the input is focused and scrolls back to that position when the input is blurred.
    this.formInput.addEventListener("focus", () => {
      this.YPos = window.scrollY;
    //  if (this.formInput.value.length < 2) {
        this.openSearchDropdown();
     // }
    });

    this.formInput.addEventListener("blur", () => {
      if (
        this.YPos !== window.scrollY &&
        window.innerWidth < mobileBreakpoint
      ) {
        window.scrollTo(0, this.YPos);
      }
    });

	this.formInput.addEventListener("input", () => {
     // if (this.formInput.value.length < 2) {
        if(this.searchDropdown.classList.contains("open")) {
          this.displayPopularSearches();
        } else {
          this.openSearchDropdown();
        }
    /*  } else {
        // this.hidePopularSearches();
        //MKPL fix since we do not show results for brands
        this.closeSearchDropdown();
      }*/
    });

	//
    // Search area
    //
    this.searchAreaEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        this.closeSearchForm();
        this.toggleButton.focus();
      }
    });

    this.searchAreaEl.addEventListener("focusout", (event) => {
      if (
        !event.relatedTarget ||
        (!event.relatedTarget.closest(".search-area") &&
          window.innerWidth >= mobileBreakpoint)
      ) {
        this.closeSearchDropdown();
        this.closeSearchForm();
      }
    });	
    //
    // button that toggles search form open and closed (in desktop view)
    //
    this.toggleButton.addEventListener("click", (event) => {
      event.preventDefault();
      this.toggleSearchForm();
    });

	//
    // search form prevent default
	
	 this.formEl.addEventListener("submit", (event) => {
      event.preventDefault();
      //code for search functionality

      /*  SYFC-5437 |As per requirement- add search functionality for the search field in navbar |Page : all pages (globar navabr)| - Starts*/
      var dataString = this.formInput.value;

      var url = document.querySelector('.search-form').action;
      var searchUrl = url + "?keyword=" + encodeURIComponent(dataString);
      if (dataString !== null && dataString !== "") {
        addQueryParamOnClick(searchUrl,getUISCode(),true,window.location);
      }
      else {
        // this.toggleSearchForm();
      }

    });

	//
    // the login prompt that is the first suggestion under the search bar
    this.loginPrompt.addEventListener("click", () => {
      this.closeSearchDropdown();
      this.parentClass.closeMobileMenu();
      this.loginArea.openLoginMenu();	
    });
    this.loginPrompt.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        this.closeSearchDropdown();
        this.parentClass.closeMobileMenu();
        this.loginArea.openLoginMenu();
        this.loginArea.customerLoginLinks[0].focus();
      }
    });
  }

  toggleSearchForm() {
    if (!this.formIsOpen && this.windowWidth > mobileBreakpoint) {
      this.openSearchForm();
    } else if((this.windowWidth < mobileBreakpoint && !this.formIsOpen) || (this.formIsOpen)) {
      this.closeSearchForm();
    } 
  }

  openSearchForm() {
    // opening the form
    this.formWrapper.classList.add("open");
    this.toggleButton.setAttribute("aria-expanded", "true");

    document.querySelectorAll(".right-links li").forEach((li) => {
      li.setAttribute("tabindex", "-1");
      li.setAttribute("aria-hidden","true");
    });
    // input and submit button tabindex 0
    this.formInput.setAttribute("tabindex", "0");
    this.submitButton.setAttribute("tabindex", "0");

    this.searchAreaEl.classList.add("open");
    this.searchInputDiv.setAttribute("aria-hidden","false");
    this.searchDropdown.setAttribute("aria-hidden","false");
    this.formIsOpen = true;
	
	setTimeout(() => {
      if (this.windowWidth >= mobileBreakpoint) {
        this.gridCenter.style.overflow = "visible";
      }
    }, 500);
  }

  closeSearchForm() {
    // closing the form
    this.formWrapper.classList.remove("open");
    this.toggleButton.setAttribute("aria-expanded", "false");
    this.formIsOpen = false;
    if (this.windowWidth < mobileBreakpoint) {
      this.closeSearchDropdown();
    } else {
      this.hidePopularSearches();
    }
    
    document.querySelectorAll(".right-links li").forEach((li) => {
      if (
        li.classList.contains(".permanently-open-in-mobile") &&
        this.windowWidth < mobileBreakpoint
      ) {
        return;
      }

      li.querySelector("a").setAttribute("tabindex", "0");
      if (this.windowWidth >= mobileBreakpoint) {
        li.querySelector("a").setAttribute("aria-hidden","false");
      } 
      
    });
    this.formInput.blur();
    this.submitButton.blur();
    // input and submit button tabindex -1
    this.formInput.setAttribute("tabindex", "-1");
    this.submitButton.setAttribute("tabindex", "-1");
	
    if (this.windowWidth >= mobileBreakpoint) {
      this.gridCenter.style.overflow = "hidden";
    }

    setTimeout(() => {
      this.searchAreaEl.classList.remove("open");

      if (this.windowWidth >= mobileBreakpoint) {
        this.searchDropdown.setAttribute("aria-hidden","true");
        this.searchInputDiv.setAttribute("aria-hidden","true");
      }
    }, 500);
  }
  openSearchDropdown() {
    this.searchDropdown.classList.add("open");
    this.searchInputDiv.setAttribute("aria-expanded","true");
    //if (this.formInput.value.length < 2) {
      this.displayPopularSearches();
    //} 

    if (this.windowWidth < mobileBreakpoint) {
      this.searchAreaEl.style.transition = "margin-bottom 0.3s ease";
      this.searchAreaEl.style.marginBottom = "360px";
    }
  }

  closeSearchDropdown() {
    this.searchDropdown.classList.remove("open");
    this.searchInputDiv.setAttribute("aria-expanded","false");
    this.searchInputDiv.setAttribute("aria-expanded","false");
    this.hidePopularSearches();
    this.searchAreaEl.style.removeProperty("margin-bottom");
  }

  displayPopularSearches() {
    this.searchDropdownPopular.classList.add("open");
    this.searchInputDiv.setAttribute("aria-expanded","true");
    this.searchDropdownPopular
      .querySelectorAll("a, .search-dropdown__popular__login-prompt")
      .forEach((link) => {
        link.setAttribute("tabindex", "0");
      });
  }

  hidePopularSearches() {
    this.searchDropdown.classList.remove("open");
    this.searchInputDiv.setAttribute("aria-expanded","false");
    this.searchDropdownPopular.classList.remove("open");
    this.searchDropdownPopular
      .querySelectorAll("a, .search-dropdown__popular__login-prompt")
      .forEach((link) => {
        link.setAttribute("tabindex", "-1");
      });
  }

}

class SubSubmenu {
  constructor(subSubmenuItemEl,parentMenu) {
   this.parentMenu = parentMenu;
    this.subSubmenuItemEl = subSubmenuItemEl;
    this.subSubmenuTitleEl =
      subSubmenuItemEl.querySelector(".sub-submenu-title");
    this.subSubmenuId =
      this.subSubmenuTitleEl.getAttribute("data-subsubmenuid");
    this.subSubmenuEl = document.querySelector(
      '.sub-submenu[data-subsubmenuid="' + this.subSubmenuId + '"]'
    );
    this.subSubmenuLinks =
      this.subSubmenuEl.querySelectorAll(".sub-submenu-link");
    this.isSubSubmenuOpen = false;
    /*Jhumur: Code Syncup*/
    this.isTouchDevice = false;
    this.setUpEventListeners();
    this.closeSubSubmenu();

    this.subSubmenuItemEl.setAttribute("aria-expanded", "false");
  }

  setUpEventListeners() {
    window.addEventListener("touchstart", () => {
      this.isTouchDevice = true;
    });
    this.subSubmenuItemEl.addEventListener("mouseenter", () => {
      if (window.innerWidth > mobileBreakpoint && !this.isTouchDevice) {
        this.hoverOpenSubSubmenu();
      }
    });
   

    // by "aunts and uncles" I mean the other submenu links in the same content area as this subSubmenu but are not the direct parent. When we hover on aunts and uncles we will close this subSubmenu
    const auntsAndUncles = Array.from(
      this.subSubmenuItemEl
        .closest(".content")
        .querySelectorAll(".submenu-link")
    ).filter((link) => link !== this.subSubmenuTitleEl);

    auntsAndUncles.forEach((subMenu) => {
      subMenu.addEventListener("mouseenter", () => {
        this.hoverCloseSubSubmenu();
      });
 subMenu.addEventListener("focus", () => {
        this.hoverCloseSubSubmenu();
        this.closeSubSubmenu();
      });
     
      
    });
    /*auntsAndUncles.forEach((subMenu) => {
      subMenu.addEventListener("mouseleave", () => {
        this.hoverCloseSubSubmenu();
      });
    });*/


    // //Code added for hovering issue on subsubmenu 
  
   this.subSubmenuItemEl.addEventListener("mouseleave", () => {
      setTimeout(() => {
        if (!this.subSubmenuEl.matches(":hover") && !this.subSubmenuTitleEl.matches(":hover")) {
          this.hoverCloseSubSubmenu();
          }
         }, 150);
   });

    this.subSubmenuEl.addEventListener("mouseleave", () => {
       this.hoverCloseSubSubmenu();
    });

    this.subSubmenuTitleEl.addEventListener("mouseleave", () => {
setTimeout(() => {
  if (!this.subSubmenuEl.matches(":hover") && !this.subSubmenuTitleEl.matches(":hover")) {
    this.hoverCloseSubSubmenu();
    }
   }, 150);
 });



    this.subSubmenuTitleEl.addEventListener("click", () => {
      if (
             window.innerWidth < mobileBreakpoint ||
             (window.innerWidth >= mobileBreakpoint && this.isTouchDevice)
           ) {
             this.toggleSubSubmenuOpen();
           }
    });
   

    this.subSubmenuTitleEl.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        this.toggleSubSubmenuOpen();
      }
    });
this.subSubmenuTitleEl.addEventListener("focus", () => {
      this.hoverCloseSubSubmenu();
      this.closeSubSubmenu();
    });
  }

  toggleSubSubmenuOpen() {
    if (this.isSubSubmenuOpen) {
      this.closeSubSubmenu();
    } else {
      this.clickOpenSubSubmenu();
    }
  }

  hoverOpenSubSubmenu() {
    this.subSubmenuTitleEl
      .closest(".sub-submenu-item")
      .classList.add("hover-open");
    this.subSubmenuEl.classList.add("hover-open");
    this.setTabIndexOnSubSubmenuLinks("0");
    this.subSubmenuItemEl.setAttribute("aria-expanded", "true");
    this.isSubSubmenuOpen = true;
// close siblings
    this.parentMenu.subSubmenus.forEach((subSubmenu) => {
      if (subSubmenu !== this) {
        subSubmenu.closeSubSubmenu();
      }
    });
  }

  clickOpenSubSubmenu() {
    this.subSubmenuTitleEl
      .closest(".sub-submenu-item")
      .classList.add("click-open");
    this.subSubmenuEl.classList.add("click-open");
    this.setTabIndexOnSubSubmenuLinks("0");
    this.isSubSubmenuOpen = true;
    this.subSubmenuItemEl.setAttribute("aria-expanded", "true");
 // close siblings
    this.parentMenu.subSubmenus.forEach((subSubmenu) => {
      if (subSubmenu !== this) {
        subSubmenu.closeSubSubmenu();
      }
    });
  }

  hoverCloseSubSubmenu() {
    this.subSubmenuTitleEl
      .closest(".sub-submenu-item")
      .classList.remove("hover-open");
    this.subSubmenuEl.classList.remove("hover-open");

    if (!this.subSubmenuItemEl.classList.contains("click-open")) {
      this.subSubmenuItemEl.setAttribute("aria-expanded", "false");
      this.setTabIndexOnSubSubmenuLinks("-1");
      this.isSubSubmenuOpen = false;
    }
  }

  closeSubSubmenu() {
    this.subSubmenuTitleEl
      .closest(".sub-submenu-item")
      .classList.remove("click-open");
    this.subSubmenuTitleEl
      .closest(".sub-submenu-item")
      .classList.remove("hover-open");
    this.subSubmenuEl.classList.remove("click-open");
    this.subSubmenuEl.classList.remove("hover-open");
    this.setTabIndexOnSubSubmenuLinks("-1");
    this.subSubmenuItemEl.setAttribute("aria-expanded", "false");
    this.isSubSubmenuOpen = false;
  }

  setTabIndexOnSubSubmenuLinks(index) {
    this.subSubmenuLinks.forEach((link) => {
      link.setAttribute("tabindex", index);
    });
  }
}

class SubMenu {
  constructor(submenuItemEl, loginArea ,searchArea) {
    this.submenuItemEl = submenuItemEl;
    this.loginArea = loginArea;
	this.searchArea = searchArea;
    this.permanentlyOpenInMobile = submenuItemEl.classList.contains(
      "permanently-open-in-mobile"
    );
    this.submenuItemTitleEl = submenuItemEl.querySelector(
      ".submenu-item__title"
    );
    this.submenuEl = submenuItemEl.querySelector(".submenu");
   
     this.subSubmenus = [];
    if (this.submenuItemEl.querySelectorAll(".sub-submenu-item")) {
      this.submenuItemEl
        .querySelectorAll(".sub-submenu-item")
        .forEach((item) => {
          this.subSubmenus.push(new SubSubmenu(item, this));
        });
    }

    this.arrayOfClickableSubmenuLinks =
      this.submenuEl.querySelectorAll(".submenu-link");
    
    //this.listenForClickOut = this.listenForClickOut.bind(this);
    this.isSubmenuOpen = this.permanentlyOpenInMobile;

    if (this.isSubmenuOpen) {
      this.submenuItemEl.querySelector(".submenu-item__title ").setAttribute("aria-expanded", "true");
    } else {
      this.submenuItemEl.querySelector(".submenu-item__title ").setAttribute("aria-expanded", "false");
    }

    this.setUpEventListeners();

    this.setTabIndexOnSubmenuLinks("-1");

    if (this.permanentlyOpenInMobile && window.innerWidth < mobileBreakpoint) {
      this.makePermanentlyOpenInMobile();
    }
  }

  setUpEventListeners() {
    // listeners to open and close menus based on hovers, clicks, and focus

    //document.addEventListener("click", this.listenForClickOut);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.permanentlyOpenInMobile) {
        this.submenuItemEl.classList.remove("hover-open");
        this.submenuItemEl.classList.remove("click-open");
        this.closeSubmenu();
      }
    });
    window.addEventListener("resize", () => {
      // no hover behavior on mobile
      if (window.innerWidth < mobileBreakpoint) {
        this.submenuItemEl.classList.remove("hover-open");
        if (
          !this.submenuItemEl.classList.contains("click-open") &&
          !this.permanentlyOpenInMobile
        ) {
          this.closeSubmenu();
         
        } else if (this.permanentlyOpenInMobile) {
          this.makePermanentlyOpenInMobile();
        }
      } else {
        this.submenuItemEl.classList.remove("click-open");
       // this.submenuItemEl.setAttribute("tabindex", "0");
      }
    });

    this.submenuItemEl.addEventListener("mouseenter", (event) => {
      if (window.innerWidth > mobileBreakpoint) {
        if (!iOSUser) {
          event.currentTarget.classList.add("hover-open");
        }
        this.openSubmenu();
      }
    });

    this.submenuItemEl.addEventListener("mouseleave", (event) => {
      if (!event.relatedTarget) return;

      if (
        !event.relatedTarget.closest(".submenu-item") ||
        event.relatedTarget.closest(".submenu-item") !== this.submenuItemEl
      ) {
        event.currentTarget.classList.remove("hover-open");

        if (!event.currentTarget.classList.contains("click-open")) {
          this.closeSubmenu();
        
        }
      }
    });

    this.arrayOfClickableSubmenuLinks[
      this.arrayOfClickableSubmenuLinks.length - 1
    ].addEventListener("focusout", () => {
      if (window.innerWidth > mobileBreakpoint) {
        this.submenuItemEl.classList.remove("hover-open");
        if (!this.submenuItemEl.classList.contains("click-open")) {
          this.setTabIndexOnSubmenuLinks("-1");
 if (this.subSubmenus.length > 0) {
            this.subSubmenus.forEach((subSubmenu) => {
              subSubmenu.closeSubSubmenu();
            });
          }
                 }
      }
    });

    this.submenuItemEl.addEventListener("focusout", (e) => {
      if (this.permanentlyOpenInMobile) return;
      if (
        !e.relatedTarget ||
        e.relatedTarget.classList.contains("submenu-item") ||
        e.relatedTarget.closest(".submenu-item") !== this.submenuItemEl
      ) {
       this.submenuItemEl.classList.remove("hover-open");
        this.submenuItemEl.classList.remove("click-open");
        this.closeSubmenu();
      
      }
    });

    
  }
/*
  listenForClickOut(e) {
    if (listenForClickOut
      window.innerWidth < mobileBreakpoint &&
      (e.target.closest(".main-nav") || e.target.closest(".sub-submenu-item"))
    ) {
      return;
    }
    if (this.submenuItemEl.classList.contains("click-open") && !this.submenuItemEl.classList.contains("permanently-open-in-mobile")) {
      this.submenuItemEl.classList.remove("click-open");
      this.closeSubmenu();
    }
  }
*/
  setTabIndexOnSubmenuLinks(tabIndex) {
    if (
      tabIndex === "-1" &&
      this.submenuItemEl.classList.contains("click-open")
    ) {
      return;
    }
   this.arrayOfClickableSubmenuLinks.forEach((link) => {
     link.setAttribute("tabindex", tabIndex);
   });
	
  }

  openSubmenu() {
	this.loginArea.closeLoginMenu();
	if (this.searchArea) {
      this.searchArea.closeSearchDropdown();
    }
    this.isSubmenuOpen = true;
    this.submenuItemEl.querySelector(".submenu-item__title").setAttribute("aria-expanded", "true");
    this.setTabIndexOnSubmenuLinks("0");
    /*Jhumur: Code Syncup*/
    if (window.innerWidth < mobileBreakpoint) {
     // scrolls submenu into view on mobile
     const scrollableDiv = document
     .querySelector(".global-nav")
     .querySelector(".grid-center");
   const rect = this.submenuItemEl.getBoundingClientRect();
   const accountForStickyHeader = scrollableDiv.classList.contains(
     "alert-banner-on"
   )
     ? 200
     : 150;
   const offsetTop =
     scrollableDiv.scrollTop + rect.top - accountForStickyHeader;
   setTimeout(() => {
     scrollableDiv.scrollTo({ top: offsetTop, behavior: "smooth" });
   }, 0);
 }
  }

  closeSubmenu() {
    if (this.permanentlyOpenInMobile && window.innerWidth < mobileBreakpoint) {
      return;
    }

    if (this.subSubmenus.length > 0) {
      this.subSubmenus.forEach((subSubmenu) => {
        subSubmenu.closeSubSubmenu();
      });
    }
    this.isSubmenuOpen = false;
    this.submenuItemEl.querySelector(".submenu-item__title").setAttribute("aria-expanded", "false");
    this.submenuItemEl.classList.remove("click-open");
    this.setTabIndexOnSubmenuLinks("-1");
  }

  makePermanentlyOpenInMobile() {
    this.submenuItemEl.classList.add("click-open");
    this.openSubmenu();
    this.submenuItemEl.setAttribute("tabindex", "-1");
  }
}

class GlobalNavigation {
  constructor(globalNav) {
    this.globalNav = globalNav;
    if(this.globalNav){
    this.mainNav = this.globalNav.querySelector(".main-nav");
    if(document.querySelector(".utility-bar")){
      this.utilityBar = new UtilityBar(document.querySelector(".utility-bar"));
    }
    
    this.homeLink = this.mainNav.querySelector(".home-link");
    this.hamburgerButton = this.mainNav.querySelector("#mobile-menu-toggle");
    this.gridCenter = this.mainNav.querySelector(".grid-center");
    this.searchArea = null;

    if(document.querySelector(".login-area")){
      this.loginArea = new MultiAccessLogin(
        this.mainNav.querySelector(".login-area")
      );
    }
	
	if (this.mainNav.querySelector(".search-area form")) {
      this.searchArea = new GlobalNavSearchForm(
        this.mainNav.querySelector(".search-area"),
        this.loginArea,
        this
      );
    }

    this.navFooter = this.mainNav.querySelector(".nav-footer");

    this.submenus = Array.from(
      this.mainNav.querySelectorAll(".submenu-item")
    ).map(
      (submenuItemEl) =>
        new SubMenu(submenuItemEl, this.loginArea, this.searchArea)
    );
    this.setUpEventListeners();
    /*this.setTabIndexOnSubmenuItems(
      window.innerWidth >= mobileBreakpoint ? "0" : "-1"
    );*/
    this.mobileIsOpen = false;
    if(this.navFooter!==null){
    this.navFooter.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });
    }

    if (window.innerWidth < mobileBreakpoint) {
      if (this.searchArea) {
        this.searchArea.toggleButton.setAttribute("tabindex", "-1");
      }
    } else if (this.hamburgerButton) {
      this.hamburgerButton.setAttribute("tabindex", "-1");
    }
  }
  }

  setUpEventListeners() {
    document.addEventListener("click", (event) => {
      if (
        event.target.tagName === "HTML" &&
        document.querySelector(".mobile-nav-open")
      ) {
        this.closeMobileMenu();
      }
    });
        this.mainNav.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        // if in mobile view and no submenus are open, close the entire nav
        if (
          !this.submenus
            .filter((submenu) => !submenu.permanentlyOpenInMobile)
            .some((submenu) => submenu.isSubmenuOpen) &&
          window.innerWidth < mobileBreakpoint &&
          this.mobileIsOpen
        ) {
          this.closeMobileMenu();
          this.hamburgerButton.focus();
        }
      }

      // THIS FUNCTION IS IMPORTANT!
      // It stops the page body from scrolling around when different elements are focused within the nav bar. These are the key features:
      // manually select all the focusable elements in the nav bar in the array called focusableElements
      // to stop the page from scrolling, call event.preventDefault(); AND focus({ preventScroll: true }) on the next focusable element in the array AND this step is wrapped in a 0 ms timeout (it wouldn't work without the timeout)

      if (event.key === "Tab") {
        // Get all focusable elements
        const focusableElements = Array.from(
          this.mainNav.querySelectorAll(
            "button, a, .submenu-item, .submenu-link, .sub-submenu-link, input, .search-dropdown__popular__login-prompt"
          )
        ).filter(
          (el) =>{
            if(el == "button#login-button"){
              console.log("login button");
              (el.tabIndex >0 && window.getComputedStyle(el).display !== "none" )
            }else{
              (el.tabIndex > -1  && window.getComputedStyle(el).display !== "none") 
        
            }
           
      });

        const currentFocus = document.activeElement;
        let nextIndex =
          focusableElements.indexOf(currentFocus) + (event.shiftKey ? -1 : 1);

        const isAtEndOfFocusableElements =
          nextIndex >= focusableElements.length || nextIndex < 0;

        const isMobile = window.innerWidth < mobileBreakpoint;

        const isSubmenuOpenInMobile = this.submenus.some(
          (submenu) => submenu.isSubmenuOpen
        );

        // In desktop view, prevent default but do not trap focus inside the menu.
        if (!isMobile && !isAtEndOfFocusableElements) {
          event.preventDefault();
          window.setTimeout(function () {
            //Removed preventScroll based on jude's comments
            focusableElements[nextIndex].focus();
          }, 0);
          return;
        } else if (!isMobile && isAtEndOfFocusableElements) {
          // do not focus trap, focus is exiting the nav bar and going onto the main page
          return;
        } else if (isMobile && !this.mobileIsOpen) {
          // do not focus trap
          return;
        } else if (isMobile && this.mobileIsOpen && !isSubmenuOpenInMobile) {
          // focus trap, prevent default and prevent scroll
          if (isAtEndOfFocusableElements) {
            if (nextIndex >= focusableElements.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = focusableElements.length - 1;
          }
          event.preventDefault();
          window.setTimeout(function () {
            focusableElements[nextIndex].focus({ preventScroll: true });
          }, 0);
        } else if (isMobile && isSubmenuOpenInMobile) {
          // focus trap, but do not prevent default or prevent scroll
          if (isAtEndOfFocusableElements) {
            if (nextIndex >= focusableElements.length) nextIndex = 0;
            if (nextIndex < 0) nextIndex = focusableElements.length - 1;
          }
          window.setTimeout(function () {
            focusableElements[nextIndex].focus();
          }, 0);
          return;
        }
      }
    });
    if (this.hamburgerButton) {
      this.hamburgerButton.addEventListener("click", () => {
        this.toggleMobileMenuOpen();
      });
    }


    this.homeLink.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        event.target.closest("a").click();
        return;
      }
    });

    this.submenus.forEach((submenu) => {
      submenu.submenuItemEl.addEventListener("keydown", (event) => {
        if (
          event.target.closest("a") &&
          (event.key === " " || event.key === "Enter")
        ) {
          event.preventDefault();
          event.target.closest("a").click();
          return;
        }

        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          this.submenuClick(event);
        }

        if (event.key === "Escape") {
          // if any submenu is open
          if (this.submenus.some((submenu) => submenu.isSubmenuOpen)) {
            event.stopPropagation();
          }

          if (
            submenu.permanentlyOpenInMobile &&
            window.innerWidth < mobileBreakpoint
          ) {
            return;
          }
          //not sure to remove submenu.submenuItemEl.classList.remove("click-open");
          submenu.submenuItemEl.classList.remove("hover-open");
          submenu.closeSubmenu();
          submenu.submenuItemEl.focus();
        }
      });

      submenu.submenuItemEl.addEventListener("click", (event) => {
        this.submenuClick(event);
      });
      /*Jhumur: Code Syncup*/
      submenu.submenuItemEl.addEventListener("mouseenter", (event) => {
        if (window.innerWidth >= mobileBreakpoint) {
          this.submenus.forEach((submenu) => {
            if (submenu.submenuItemEl !== event.currentTarget) {
              submenu.submenuItemEl.classList.remove("click-open");
              submenu.closeSubmenu();
            }
          });
        }
      });
    });

    if(this.loginArea){
      this.loginArea.loginButton.addEventListener("click", () => {
        if (!this.loginArea.noDropdown) {
          this.closeMobileMenu();
        }
      });
    }

    window.addEventListener("resize", () => {
      // changing tab index of submenu items
      if (window.innerWidth < mobileBreakpoint) {
        if (this.hamburgerButton) {
          this.hamburgerButton.setAttribute("tabindex", "0");
        }        if (this.mobileIsOpen) {
          //this.setTabIndexOnSubmenuItems("0");
        } else {
          //this.setTabIndexOnSubmenuItems("-1");
        }
      } else {
      //  this.setTabIndexOnSubmenuItems("0");
        this.hamburgerButton.setAttribute("tabindex", "-1");
        if(this.navFooter!==null){
        this.navFooter.querySelectorAll("a").forEach((link) => {
          link.setAttribute("tabindex", "-1");
        });
      }
      }
    });

    window.addEventListener("focusin", (event) => {
      // focus trap if the mobile menu is open
      if (this.mobileIsOpen && !event.target.closest(".global-nav")) {
        this.mainNav.querySelector(".submenu-item").focus();
      }
    });
  }

  toggleMobileMenuOpen() {
    if (this.mobileIsOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    let mobileNavHeightReduction = this.globalNav.offsetHeight;
    // set css variable to new height
    document.documentElement.style.setProperty(
      "--mobile-nav-height-reduction",
      mobileNavHeightReduction + "px"
    );
    this.hamburgerButton.classList.add("is-open");
    this.hamburgerButton.setAttribute("aria-expanded","true");
    this.gridCenter.classList.add("is-open");
    this.navFooter.classList.add("is-open");
    this.mainNav.classList.add("is-open");
    document.querySelector(".page-container").classList.add("mobile-nav-open");
    document.body.classList.add("iOS-stop-body-scroll");
    document.body.classList.add("mobile-nav-open");
   // this.setTabIndexOnSubmenuItems("0");

    if (this.searchArea) {
      this.searchArea.formInput.setAttribute("tabindex", "0");
      this.searchArea.submitButton.setAttribute("tabindex", "0");
    }
    if(this.navFooter!==null){
    this.navFooter.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "0");
    });
    }

    this.mobileIsOpen = true;
  }

  closeMobileMenu() {
    this.hamburgerButton.classList.remove("is-open");
    this.hamburgerButton.setAttribute("aria-expanded","false");
    this.gridCenter.classList.remove("is-open");
    this.navFooter.classList.remove("is-open");
    this.mainNav.classList.remove("is-open");
this.submenus.forEach((submenu) => {
      submenu.closeSubmenu();
    });
    document
      .querySelector(".page-container")
      .classList.remove("mobile-nav-open");
    document.body.classList.remove("iOS-stop-body-scroll");
    document.body.classList.remove("mobile-nav-open");

    if (window.innerWidth < mobileBreakpoint) {
    //  this.setTabIndexOnSubmenuItems("-1");
    }

    if (this.searchArea) {
      this.searchArea.formInput.setAttribute("tabindex", "-1");
      this.searchArea.submitButton.setAttribute("tabindex", "-1");
    }

    this.navFooter.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "-1");
    });
    

   this.submenus.forEach((submenu) => {
	   //MAG-7098 Issue fixed for Help dropdown in header
	/*if(!submenu.submenuItemEl.classList.contains("permanently-open-in-mobile")){	
	submenu.submenuItemEl.classList.remove("click-open");*/
      submenu.submenuItemEl.classList.remove("hover-open");
      submenu.closeSubmenu();
	 if(submenu.submenuItemEl.classList.contains("permanently-open-in-mobile")){	
	submenu.submenuItemEl.classList.add("click-open");
		}
	  });
    this.mobileIsOpen = false;
  }

  submenuClick(event) {
    const clickedOnSubmenu = event.currentTarget;

    if (
      event.target.classList.contains("sub-submenu-title") ||
      event.target.closest("a")
    ) {
      // toggling a sub-submenu or clicking a link will not have any effect on the state of the submenus
      return;
    }

    this.submenus.forEach((submenu) => {
      if (clickedOnSubmenu === submenu.submenuItemEl) {
        // the one you clicked on

        if (
          submenu.permanentlyOpenInMobile &&
          window.innerWidth < mobileBreakpoint
        ) {
          return;
        }

        if (
          clickedOnSubmenu.classList.contains("click-open") ||
          clickedOnSubmenu.classList.contains("hover-open")
        ) {
          submenu.submenuItemEl.classList.remove("click-open");
          submenu.submenuItemEl.classList.remove("hover-open");
          submenu.closeSubmenu();
        } else {
          submenu.submenuItemEl.classList.add("click-open");
          submenu.openSubmenu();
        }
      } else {
        // the ones you didnt click on
        submenu.submenuItemEl.classList.remove("click-open");
        if (!submenu.submenuItemEl.classList.contains("hover-open")) {
          submenu.closeSubmenu();
        }
      }
    });
  }

  setTabIndexOnSubmenuItems(tabIndex) {
    this.submenus.forEach((submenu) => {
      if (
        window.innerWidth < mobileBreakpoint &&
        submenu.permanentlyOpenInMobile
      ) {
        return;
      }
      submenu.submenuItemEl.setAttribute("tabindex", tabIndex);
    });
  }
}

//ADA FIX | Specific Focus order requirement
document.addEventListener('keydown', function(event) {
  if (event.target.matches('.search-dropdown__popular__login-prompt')) {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('login-button').focus();
    }
  }
});

const globalNavigation = new GlobalNavigation(
  document.querySelector(".global-nav")
);
/* ADA fix- login menu will close on tab focus out */
/*
if (document.querySelector(".login-dropdown")) {
  const loginbutton = document.querySelector(".login-area");
  const loginFocusableElements = document.querySelectorAll(".customer-login-link");
 
  const firstFocusableElement = loginFocusableElements[0];
  const lastFocusableElement = loginFocusableElements[loginFocusableElements.length - 1];
  firstFocusableElement.addEventListener("keydown", function (e) {
    if (e.which == 9 && e.shiftKey) {
      loginbutton.classList.remove('open');
    }
  })
  if(document.querySelector(".login-search-wrapper").style.display ==="none"){
    lastFocusableElement.addEventListener("keydown", function (e) {
      if (e.which == 9 && e.shiftKey) {
        lastFocusableElement.previousSibling.focus();
      }
      else if (e.which == 9) {
        loginbutton.classList.remove('open');
      }
    })
  }
  
}*/
//* Leaving this in global for now. this can be repurposed if necessary across other pages with this same issue.
window.onload = initTabFocus;

function initTabFocus() {
 /* let headerElem = document.querySelector(".sticky");
  document.addEventListener("focusin", function (e) {
    if (e.target.closest(".main-nav")) return;
    let targetBounds = e.target.getBoundingClientRect();
    let headerBounds = headerElem.getBoundingClientRect();
    let topDifference = targetBounds.top - headerBounds.bottom;

    // if (topDifference < 0) {
      // scroll focused element into view
      // window.scrollBy(0, topDifference - 50);
    // }
  });*/

  const searchInput = document.querySelector(".search-input");

    searchInput?.addEventListener("focus", function(){
      if(window.matchMedia("(max-width: 768px)").matches){
        document.body.classList.add("iOS-stop-body-scroll");
      }
    })
}

 /*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   tabs-manual.js
 *
 *   Desc:   Tablist widget that implements ARIA Authoring Practices
 */

"use strict";

class LoginTabsManual {
  constructor(groupNode) {
    this.tablistNode = groupNode;

    this.tabs = [];

    this.firstTab = null;
    this.lastTab = null;

    this.tabs = Array.from(this.tablistNode.querySelectorAll(".campaign-login-menu [role=tab]"));
    this.tabpanels = [];

    for (var i = 0; i < this.tabs.length; i += 1) {
      var tab = this.tabs[i];
      var tabpanel = document.getElementById(tab.getAttribute("aria-controls"));

      tab.tabIndex = -1;
      tab.setAttribute("aria-selected", "false");
      this.tabpanels.push(tabpanel);

      tab.addEventListener("keydown", this.onKeydown.bind(this));
      tab.addEventListener("click", this.onClick.bind(this));

      if (!this.firstTab) {
        this.firstTab = tab;
      }
      this.lastTab = tab;
    }

    this.setSelectedTab(this.firstTab);
  }

  setSelectedTab(currentTab) {
    for (var i = 0; i < this.tabs.length; i += 1) {
      var tab = this.tabs[i];
      if (currentTab === tab) {
        tab.setAttribute("aria-selected", "true");
        tab.removeAttribute("tabindex","-1");
        this.tabpanels[i].classList.remove("is-hidden");
      } else {
        tab.setAttribute("aria-selected", "false");
        tab.tabIndex = -1;
        this.tabpanels[i].classList.add("is-hidden");
      }
    }
  }

  moveFocusToTab(currentTab) {
    currentTab.focus();
  }

  moveFocusToPreviousTab(currentTab) {
    var index;

    if (currentTab === this.firstTab) {
      this.moveFocusToTab(this.lastTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.moveFocusToTab(this.tabs[index - 1]);
    }
  }

  moveFocusToNextTab(currentTab) {
    var index;

    if (currentTab === this.lastTab) {
      this.moveFocusToTab(this.firstTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.moveFocusToTab(this.tabs[index + 1]);
    }
  }

  /* EVENT HANDLERS */

  onKeydown(event) {
    var tgt = event.currentTarget,
      flag = false;

    switch (event.key) {
      case "ArrowLeft":
        this.moveFocusToPreviousTab(tgt);
        flag = true;
        break;

      case "ArrowRight":
        this.moveFocusToNextTab(tgt);
        flag = true;
        break;

      case "Home":
        this.moveFocusToTab(this.firstTab);
        flag = true;
        break;

      case "End":
        this.moveFocusToTab(this.lastTab);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  // Since this example uses buttons for the tabs, the click onr also is activated
  // with the space and enter keys
  onClick(event) {
    this.setSelectedTab(event.currentTarget);
  }
}

// Initialize tablist

window.addEventListener("load", function () {
  var tablists = document.querySelectorAll(".campaign-login-menu [role=tablist].manual");
  for (var i = 0; i < tablists.length; i++) {
    new LoginTabsManual(tablists[i]);
  }
  if(document.querySelector("form")){
    document.querySelectorAll("form").forEach(element => {
      element.reset();
    }); 
  }
  document.querySelectorAll(".submenu-links li").forEach(ele=>{
    if(ele.hasAttribute("tabindex")){
      ele.removeAttribute("tabindex");
    }
  })
  
});


 