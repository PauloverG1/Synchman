var allLoginBrands = [];
(function () {

  
  //var allLoginBrands = [];
  if( document.querySelector("[data-login-search-bar]") != null) {

    document.querySelectorAll("[data-login-search-bar]").forEach((item)=>{ 
      item.addEventListener("focusin", callAPIBrandData);});
    document.querySelectorAll("[data-login-search-bar]").forEach((item)=>{ 
      item.addEventListener("submit", function (evt) {
        evt.preventDefault();
      });});
    
  }

  if (Handlebars) {
    Handlebars.registerHelper("decodeBrandName", function (organization) {
      var txt = document.createElement("textarea");
      txt.innerHTML = organization;
      return txt.value;
    });

    Handlebars.registerHelper("decodetxt", function (organization) {
      var txt = document.createElement("textarea");
      txt.innerHTML = organization;
      return txt.value;
    });

    Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });
  
    Handlebars.registerHelper("loginURLText", function (url, orgname) {
      var intcmp = "";
      if (url && url.indexOf("intcmp") !== -1) {
        const urlObj = new URL(url);
        urlObj.searchParams.delete("intcmp");
        url = urlObj.toString();
      }
      var hostname = extractHostname(url);
      var noOfferVal = noOffer(hostname, orgname);
      var ampOrq = url && url.indexOf("?") !== -1 ? "&" : "?";
      var dataobj ="_body-login";
      if (hostname.indexOf("synchrony") !== -1 || hostname.indexOf("syf") !== -1 || hostname.indexOf("carecredit") !== -1) {
        var value = getValueToPrepend(url, hostname);
        if (value) {
          intcmp = ampOrq + "intcmp=" + noOfferVal + _SFDDL.pageInfo.PageFunction + dataobj + (value ? "_" + value : "") + "_int";
        }
      } else {
        intcmp = ampOrq + "intcmp=" + noOfferVal + _SFDDL.pageInfo.PageFunction + dataobj + "_" + hostname.split(".")[1] + "_ext";
      }
      if (hostname.includes("www.mysynchrony.com") || hostname.includes("www.synchrony.com")) {
        intcmp = "";
      }
  
      if (url.includes("etail.mysynchrony") || url.includes("apply.syf")) {
        var pksf = getShortForm(pageKindMapping);
        var ampOrq = url && url.indexOf("?") !== -1 ? "&" : "?";
        var clickType = url.indexOf("preQual") !== -1 ? "prequal" : "apply";
        url = url + ampOrq + "platformtoken=" + _SFDDL.pageInfo.Token + "&orgchannel=" + _SFDDL.pageInfo.SiteIdentifier + "&storeNumber=" + generateDTC(pksf, clickType, true);
      }
      return url + intcmp;
    });
  }

  function decodeText(organization){
    var txt = document.createElement("textarea");
    txt.innerHTML = organization;
    return txt.value;
  }
  
  function noOffer(hostname, orgname) {
    if (hostname.includes("etail.mysynchrony") !== -1 || hostname.includes("apply.syf") !== -1) {
      return "NoOff_" + decodeText(orgname) + "_";
    }
    if (hostname.indexOf("synchronybusiness") !== -1 || hostname.indexOf("synchronyfuel") !== -1 || hostname.indexOf("synchronybank") !== -1 || hostname.indexOf("carecredit") !== -1 || hostname.indexOf("synchrony") !== -1 || hostname.indexOf("mysynchrony") !== -1) {
      return "";
    } else {
      return "NoOff_" + decodeText(orgname) + "_";
    }
  }
  
 
  
  function callAPIBrandData() {
    var serviceURL = document.querySelector("#login-search-form").action;
    if (allLoginBrands.length == 0) {
      $.get(serviceURL, function (data) {
        JSON.parse(data).syc_findaccount.forEach((brand) => {
          allLoginBrands.push({ name: brand.OrganizationName, loginURL: brand.LoginLink.LinkURL });
        });
       // setupBrandSearchBar();
      });
      document.querySelectorAll("[data-login-search-bar]").forEach(e=>{
        e.removeEventListener("focusin", callAPIBrandData);
      })
      
    }
  }
  
  // Setup one or more search bars using data-* attributes to identify the elements
  function setupBrandSearchBar() {
    const searchBars = document.querySelectorAll("[data-login-search-bar]");
    searchBars.forEach((searchBarFormEl) => {
      const searchInput = searchBarFormEl.querySelector("[data-search-bar-input]");
  
      const resultsContainer = document.querySelector(`[data-search-results-container-for="${searchBarFormEl.dataset.loginSearchBar}"]`);
  
      const searchLabel = document.getElementById("login-search-label");
      const searchResults = resultsContainer.querySelector("[data-search-results]");
      const noResults = resultsContainer.querySelector("[data-search-no-results]");
      const listResults = resultsContainer.querySelectorAll(".search-result-item");
      setupLoginSearchBar(searchInput, searchResults, noResults, listResults);
    });
  }
  
  function setupLoginSearchBar(searchInput, searchResults, noResults, listResults) {
    listResults.forEach((result) => {
      result.querySelector("a").tabIndex = -1;
    });
    noResults.querySelector("a").tabIndex = -1;
  
    function showResults(e) {
      if (!e.target.value) {
        searchResults.classList.remove("active");
        searchResults.ariaHidden = "true";
        noResults.style.display = "none";
        noResults.querySelector("a").tabIndex = -1;
        listResults.forEach((result) => {
          result.querySelector("a").tabIndex = -1;
        });
      } else if (e.target.value.length > 0) {
        search(e.target.value, noResults);
        searchResults.querySelectorAll("a").forEach((result) => {
          result.addEventListener("focusout",(e) => {
            if(!e.relatedTarget.closest(".search-results-list")) hideResults();
          })
        });
      } else {
        searchResults.classList.add("active");
        searchResults.ariaHidden = "false";
        noResults.style.display = "none";
        noResults.ariaHidden = "true";
        noResults.querySelector("a").tabIndex = -1;
  
        listResults.forEach((result) => {
          result.style.display = "flex";
          result.querySelector("a").tabIndex = 0;
        });
      }
    }
  
    function hideResults() {
      searchResults.classList.remove("active");
      searchResults.ariaHidden = "true";
      noResults.style.display = "none";
      noResults.querySelector("a").tabIndex = -1;
      listResults.forEach((result) => {
        result.querySelector("a").tabIndex = -1;
      });
    }
  
    searchInput.addEventListener("input", showResults);
    searchInput.addEventListener("focusin", showResults);
    // searchInput.addEventListener("focusout", (e) => {
    //   if(e.relatedTarget && e.relatedTarget.closest(".search-results-list")) 
    //   hideResults();
    // });
    
  }
  
  function getFilteredData(data, value) {
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
    lastCloseMatchBrand = contains.length > 0 ? true : false;
    if (lastIndex > 0) {
      startsArray = JSON.parse(JSON.stringify(starswith));
      startsArray[lastIndex - 1].id = "last-close-match";
      startsArray[lastIndex - 1].divider = contains.length > 0 ? true : false;
    }
    return [...startsArray, ...contains];
  }
  
  function search(value, noResults) {
    if (value.length > 1) {
      var names = getFilteredData(allLoginBrands, value);
  
      if (names.length > 0) {
        var loginSearchHTML = document.getElementById("loginSearchTemplate").innerHTML;
        var loginSearchTemplate = Handlebars.compile(loginSearchHTML);
        var compiledloginSearchData = loginSearchTemplate(names);
        document.getElementById("loginSearchPlaceholder").innerHTML = compiledloginSearchData;
        loginSearchPlaceholder.classList.add("active");
        loginSearchPlaceholder.ariaHidden = "false";
  
        document.getElementById("loginSearchPlaceholder").addEventListener("click", function (event) {
          if (event.target.innerText.toLowerCase().includes("search term is not coming up")) {
            event.preventDefault();
          }
          document.getElementById("login-search-bar").value = event.target.innerText.toLowerCase().includes("search term isn't coming up") ? "" : event.target.innerText;
          loginSearchPlaceholder.classList.remove("active");
          loginSearchPlaceholder.ariaHidden = "true";
          if (document.getElementById("no-results-alert") != null) {
            noResults.style.display = "none";
          }
        });
      } else {
        document.getElementById("loginSearchPlaceholder").addEventListener("click", function (event) {
          if (event.target.innerText.toLowerCase().includes("search term is not coming up")) {
            event.preventDefault();
          }
          document.getElementById("login-search-bar").value = event.target.innerText.toLowerCase().includes("search term isn't coming up") ? "" : event.target.innerText;
          loginSearchPlaceholder.classList.remove("active");
          loginSearchPlaceholder.ariaHidden = "true";
          if (document.getElementById("no-results-alert") != null) {
            noResults.style.display = "none";
          }
        });
  
        var noresultData = '<li class="no-results" id="no-results-alert"><a href="#" class="search-item-text link-plain">That search term isn' + "'" + "t coming up. Please try again.</a></li>";
        document.getElementById("loginSearchPlaceholder").innerHTML = noresultData;
        loginSearchPlaceholder.classList.add("active");
        loginSearchPlaceholder.ariaHidden = "false";
        var a = document.getElementById("no-results-alert");
        a.style.display = "block";
        a.ariaHidden = "false";
      }
    } else {
      document.getElementById("loginSearchPlaceholder").innerHTML = "";
    }
  }
})();
