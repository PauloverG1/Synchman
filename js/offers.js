SYF.offerAnalyticMap = new Map();
SYF.offerIds = "";

//cookie details
var userId = getCookie("_dyid") ? getCookie("_dyid") : "";
var sessionId = getCookie("_dyjsession") ? getCookie("_dyjsession") : "";
var kevelSectionId = "";
var marketplaceSearchPage = window.location.pathname.includes("/sites") ? window.location.origin+"/sites/syc/marketplace/search-results?offerid=" : window.location.origin+"/marketplace/search-results?offerid=";
Handlebars.registerHelper('marketplaceSearchPageURL', function(context) {
  return encodeURIComponent(marketplaceSearchPage); // Accessing the "global" variable from the context
});

let offersTemplate = "";
 // observer for touch devices
 const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const partner = entry.target.querySelector(".partner");
      if (!partner) return;

      if (entry.isIntersecting) {
        partner.classList.add("open");
      } else if (!entry.isIntersecting) {
        partner.classList.remove("open");
      }
    });
  },
  {
    root: null,
    rootMargin: `-${getHeaderHeight()}px 0px 0px 0px`,
    threshold: [0.8, 0.8]
  }
);

Handlebars.registerHelper(
  "generateintcmp", function(url, offerId, brandName, dataObjText, kevelEvents, btnLabel) {
    return url != undefined && url != null && url.length > 0 ? intcmpGeneration(url, offerId, brandName, dataObjText, kevelEvents, btnLabel) : "";
  }
);

Handlebars.registerHelper(
  "getTargetURL", function(url) {
    return url != undefined && url != null && url.length > 0 ? getElementTarget(url) : "_blank";
  }
);

Handlebars.registerHelper("getEventURL", function (events, id) {
  if(events != null && events.length > 0) {
    const match = events.filter(x => x.id==id);
    return match.length > 0 ? match[0].url : "";
  } else {
    return "";
  }
});

  // Calculate height for sticky nav/header.
  // tiles are not visible if they are behind the sticky nav/header
  // so we need to exclude that area from the visible intersection area
 
  function getHeaderHeight() {
    const globalNav = document.querySelector(".global-nav");
    const marketplaceSearchFilter = document.querySelector(
      "#mobile-sticky-search-bar"
    ); // this element is only on the marketplace search page
 
    let headerHeight = globalNav ? globalNav.offsetHeight : 0;
    let searchFilterHeight = marketplaceSearchFilter
      ? marketplaceSearchFilter.offsetHeight
      : 0;
    return headerHeight + searchFilterHeight;
  }


function generateTemplateOffer(id, placeholder, data, targetDiv) {
  var scriptHTML = document.getElementById(id).innerHTML;
  if(targetDiv != undefined && targetDiv.length > 0) {
    scriptHTML = scriptHTML.replaceAll('targetOfferTile',targetDiv);
  }
  if(Handlebars) {
    var theTemplate = Handlebars.compile(scriptHTML);
    var compiledData = theTemplate(data);
    var targetDiv = document.getElementById(placeholder);
    targetDiv.classList.forEach((x) => {
      if (x.includes("height")) {
        targetDiv.classList.remove(x);
        return;
      }
    });
    targetDiv.classList.remove("loader");
    targetDiv.innerHTML = compiledData;
  }
}



// Moving removeSection to global.js as it required for blog pages

function hideTheSectionByClass(divId) {
  const config = document.querySelectorAll('*[data-id="configs"]');
  Array.from(config).forEach((x) => {
    const mappingObj = JSON.parse(x.innerText);
    if (mappingObj.sectionId == divId) {
      removeSection(mappingObj.hideByClass);
    }
  });
}

function generateRequestParams(divId) {
  let urlparams = "";
  const config = document.querySelectorAll('*[data-id="configs"]');
  Array.from(config).forEach((x) => {
    const mappingObj = JSON.parse(x.innerText);
    if (mappingObj.sectionId == divId) {
      if(divId == "find-a-deal") {
        kevelSectionId = mappingObj.campaignMappingId;
      }
      urlparams += "?campaignMappingId=" + mappingObj.campaignMappingId;
      for (const key in mappingObj) {
        if (
          key &&
          key != "sectionId" &&
          key != "keyword" &&
          key != "campaignMappingId" &&
          key != "hideByClass" &&
          mappingObj[key] != null &&
          (typeof mappingObj[key] == "boolean" || mappingObj[key].length > 0)
        ) {
          urlparams += "&" + key + "=" + encodeURIComponent(mappingObj[key]);
        }
      }
    }
  });
  return urlparams;
}

function getSectionOffersIds(data) {
  if(SYF.offerIds.trim().length > 0 ) {
    if(SYF.offerIds.endsWith(",")) {
      return data;
    } else {
      return "," + data;
    }
  } else {
    return data;
  }
}

//SFDDL Code - Start's here
function triggerSYDDLEvent(offers, section, triggerEvent) {
  var sectionData = "";
  offers.forEach((x, index) => {
    if (x != undefined) {
      sectionData += x.offerId + "|" + section + "|" + x.brand.name;
      sectionData += ",";
    }
  });
  if (SYF.offerAnalyticMap.has(section)) {
    SYF.offerAnalyticMap.forEach((value, key) => {
      if (key == section) {
        SYF.offerAnalyticMap.set(section, sectionData);
      }
    });
    SYF.offerAnalyticMap.forEach((value) => {
      SYF.offerIds += getSectionOffersIds(value);
    });
  } else {
    SYF.offerAnalyticMap.set(section, sectionData);
    SYF.offerIds += getSectionOffersIds(sectionData);
  }
  if (triggerEvent) {
    if (_SFDDL && _SFDDL.offers == null) {
      _SFDDL.offers = {};
      _SFDDL.Homeoffers = {};
      _SFDDL.offers.offerIds = "";
      _SFDDL.Homeoffers.offerIds="";
    }
    if (SYF.offerIds.endsWith(",")) {
      SYF.offerIds = SYF.offerIds.slice(0, -1);
    }
    _SFDDL.offers.offerIds = SYF.offerIds;
    let utagEvent = new CustomEvent("offersloaded");
    window.dispatchEvent(utagEvent);
  }
}

function modalTileOpen(modal) {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      document.body.classList.add("iOS-stop-body-scroll");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "hidden";
    }

    // reset scroll of modal__scroll-area to top
    setTimeout(() => {
      if (modal.querySelector(".modal__scroll-area")) {
        modal.querySelector(".modal__scroll-area").scrollTop = 0;
      }
    })
}

function modalTileClose(modal) {
    // reset scroll of modal__scroll-area to top
    setTimeout(() => {
      if (modal.querySelector(".modal__scroll-area")) {
        modal.querySelector(".modal__scroll-area").scrollTop = 0;
      }
    })
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      document.body.classList.remove("iOS-stop-body-scroll");
      // document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "auto";
    }
}

function modalInit() {
  MicroModal.init({
    onShow: onShowDOModal,
    onClose: onCloseDOModal
  });
}


function onShowDOModal(modal) {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    document.body.classList.add("iOS-stop-body-scroll");
  } else {
    document.body.style.overflow = "hidden";
  }
  // reset scroll of modal__scroll-area to top
  if (modal.querySelector(".modal__scroll-area")) {
    modal.querySelector(".modal__scroll-area").scrollTop = 0;
  }
  initSharingTools(modal);
}


function onCloseDOModal(modal) {
  // reset scroll of modal__scroll-area to top
  if (modal.querySelector(".modal__scroll-area")) {
    modal.querySelector(".modal__scroll-area").scrollTop = 0;
  }
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    document.body.classList.remove("iOS-stop-body-scroll");
  } else {
    document.body.style.overflow = "auto";
  }

  // set state back to ad content
  if(modal.querySelector(".sharing-tools") != null)  modal.querySelector(".sharing-tools").classList.add("hidden");
  if(modal.querySelector(".ad-content") != null) modal.querySelector(".ad-content").classList.remove("hidden");
}

function initSharingTools(modal) {
  if (modal.classList.contains("sharing-tools-initialized")) return;

  // add event listener to the share button
  const shareButton = modal.querySelector(".modal__share");
  if (shareButton != null) {
    shareButton.addEventListener("click", () => {
      // switch state to sharing tools
      modal.querySelector(".sharing-tools").classList.remove("hidden");
      modal.querySelector(".ad-content").classList.add("hidden");
      modal.focusableElements = [modal.querySelector(".modal__close"), ...Array.from(modal.querySelector(".sharing-tools").querySelectorAll("a[href], button"))];
      modal.focusableElements[1].focus();
    });
  }

  // add event listener to 'return to offer' button
  const returnToOfferButton = modal.querySelector(".return-to-offer");
  if (returnToOfferButton != null) {
    returnToOfferButton.addEventListener("click", () => {
      // switch back to ad content
      modal.querySelector(".sharing-tools").classList.add("hidden");
      modal.querySelector(".ad-content").classList.remove("hidden");

      modal.focusableElements = [modal.querySelector(".modal__close"), ...Array.from(modal.querySelector(".ad-content").querySelectorAll("a[href], button"))];
      modal.focusableElements[1].focus();
    });
  }

  // add event listener to the copy button
  const copyButton = modal.querySelector(".copy-button");
  if (copyButton != null) {
    copyButton.addEventListener("click", () => {
      navigator.clipboard
        .writeText(marketplaceSearchPage + copyButton.dataset.offerid)
        .then(() => {
          copyButton.querySelector("span").textContent = "Link Copied!";
          copyButton.querySelector("span").style.color = "#FFFFFF";
          copyButton.querySelector("img").src = "/sites/syc/img/icon_checkmark_white.svg";
          copyButton.style.backgroundColor = "#56A33B";
          copyButton.style.borderColor = "#56A33B";

          setTimeout(() => {
            copyButton.querySelector("span").textContent = "Copy link";
            copyButton.querySelector("span").style.color = "#3b3d49";
            copyButton.querySelector("img").src = "/sites/syc/img/icon_chain-link.svg";
            copyButton.style.backgroundColor = "#fbc600";
            copyButton.style.borderColor = "#fbc600";
          }, 3000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    });
  }
  // adding this flag class will ensure that the sharing tools are only initialized once
  modal.classList.add("sharing-tools-initialized");
}

// Focus trap
function DOModalFocusTrap(e) {
  const openModal = document.querySelector(".deal-modal.is-open");
  // check for tab key press
  if (openModal && e.key === "Tab") {
    const modalState = openModal
      .querySelector(".ad-content")
      .classList.contains("hidden")
      ? "sharing-tools"
      : "ad-content";

    const focusableElements = [
      openModal.querySelector(".modal__close"),
      ...Array.from(
        openModal
          .querySelector(`.${modalState}`)
          .querySelectorAll("a[href], button")
      )
    ];

    if (!focusableElements.includes(document.activeElement)) {
      e.preventDefault();
      focusableElements[1].focus();
    } else {
      // go to next focusable element
      const currentIndex = focusableElements.indexOf(document.activeElement);
      if (!e.shiftKey) {
        if (currentIndex === focusableElements.length - 1) {
          e.preventDefault();
          focusableElements[0].focus();
        }
      } else {
        if (currentIndex === 1) {
          e.preventDefault();
          focusableElements[0].focus();
        }
        if (currentIndex === 0) {
          e.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        }
      }
    }
  }
}

document.addEventListener("keydown", DOModalFocusTrap);

 // horizontal focus scroll for groups of deal-tiles
 document.addEventListener(
  "focus",
  function (event) {
    if (
      (event.target.classList.contains("deal-tile") ||
        event.target.closest(".deal-tile")) &&
      event.target.closest(".four-up")
    ) {
      const fourUp = event.target.closest(".four-up");
      const dealTile = event.target.closest(".deal-tile");
      const tileRect = dealTile.getBoundingClientRect();
      const containerRect = fourUp.getBoundingClientRect();
      // Check if the tile is fully visible within the container
      const tileNotFullyVisible =
        tileRect.left < containerRect.left ||
        tileRect.right > containerRect.right;
      if (tileNotFullyVisible) {
        fourUp.scrollTo({
          left:
            dealTile.offsetLeft -
            fourUp.offsetLeft -
            fourUp.clientWidth / 2 +
            dealTile.clientWidth / 2,
          behavior: "smooth"
        });
      }
    }
  },
  true
);

function modalReInitalize() {
  
    // tab focus + enter key to open modal
    document.querySelectorAll("[data-open-deal-modal]").forEach((tile) => {
      if (window.matchMedia("(pointer: coarse)").matches) {
        observer.observe(tile);
      }
  
      const id = tile.getAttribute("data-open-deal-modal");
  
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.target.click();
          e.preventDefault();
        }
      });
  
      tile.addEventListener("mouseenter", (e) => {
        if (tile.querySelector(".partner")) {
          tile.querySelector(".partner").classList.add("open");
        }
      });
      tile.addEventListener("focus", (e) => {
        if (tile.querySelector(".partner")) {
          tile.querySelector(".partner").classList.add("open");
        }
      });
      tile.addEventListener("focusout", (e) => {
        const correspondingModal = document.getElementById(id);
        if (correspondingModal.classList.contains("is-open")) {
          return;
        }
        if (tile.querySelector(".partner")) {
          tile.querySelector(".partner").classList.remove("open");
        }
     
      });
  
      tile.addEventListener("mouseleave", (e) => {
        const correspondingModal = document.getElementById(id);
        if (correspondingModal.classList.contains("is-open")) {
          return;
        }
        if (tile.querySelector(".partner")) {
          tile.querySelector(".partner").classList.remove("open");
        }
      });
    });
  MicroModal.init({
    openTrigger: "data-open-deal-modal",
    closeTrigger: "data-micromodal-close",
    onShow: onShowDOModal,
    onClose: onCloseDOModal
  });
}
//the below code is to append the intcmp to the urls using data-attrs SYFC-6204-starts

function getSourceDataOffers(){
	  const sfddloffers = document.querySelectorAll('*[data-sfddlOffers]');
  Array.from(sfddloffers).forEach((x) => {
    const syfOfferId = x.getAttribute("data-sfddlOffers");
     SYF.offerIds += syfOfferId;
	 SYF.offerIds += ",";
  });
}

function vistaClose(id) {
  const btn = document.getElementById(id)
  if (btn != undefined) {
    btn.addEventListener("click", () => {
      document.getElementById("syf-global-nav").style.display = "block";
      document.getElementById("vista-eng-banner").style.display = "none";
      document.getElementById("vista-spanish-banner").style.display = "none";
    });
  }
}
if(_SFDDL.pageInfo.PageFunction == "marketplace" && _SFDDL.pageInfo.PageKind == "marketplace") {
  vistaClose("vista-close");
  vistaClose("vista-spanish-close");
}
getSourceDataOffers();
//the below code is to append the intcmp to the urls using data-attrs SYFC-6204-ends


