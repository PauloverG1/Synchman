var cookieAccepted;
if (typeof SYC_HOME === "undefined") {
  var SYC_HOME = "/"
  var baseURL = "/";
  var bankApiURL = 'https://api-uat.syf.com/v1/retailBank/products?serviceLevel=';
  const PRODUCT_IDS = [];
  const currentUrl = window.location.href;
  if (isSynchronyDomain(currentUrl)) {
    baseURL = baseURL.replace('qwww', 'www');
    SYC_HOME = SYC_HOME.replace('qwww', 'wwww');
    bankApiURL = bankApiURL.replace('-uat', '');
  }

  if (isProdMgt()) {
    // if in PROD MGT, only update bank rate API URL
    bankApiURL = bankApiURL.replace('-uat', '');
  }

  function isSynchronyDomain(url) {
    try {
      return env.indexOf("SYC_PROD-DEL") >= 0;
    } catch (e) {
      return false;
    }
  }

  function isProdMgt() {
    return env.indexOf("SYC_PROD-MGMT") >= 0;
  }
}

//Function to get the anchor target from the URL for offers/brands modals link 
function getElementTarget(url) {
  var hostname = extractHostname(url);
  if (hostname.indexOf('synchrony') !== -1 || hostname.indexOf('syf') !== -1 || hostname.indexOf("carecredit") !== -1) {
      return "_self";
  } else {
      return "_blank";
  }
}


function vimeoWrapper() {
  let iframes = document.getElementsByTagName("iframe");
  let thumbnail = document.querySelectorAll(".video-thumbnail");
  if (typeof OnetrustActiveGroups != "undefined" && OnetrustActiveGroups.includes("C0004")) {
    thumbnail && thumbnail.forEach((el)=>{
    if (!el.classList.contains("default-hidden")) {
      el.classList.add("default-hidden");
    }
    })
  iframes && Array.from(iframes).forEach((iframe) => {
      const url = iframe.getAttribute("data-src");
      if (!iframe.hasAttribute('src') && url && url.includes("vimeo")) {
        iframe.setAttribute("src",url);
        iframe.style.display = "block";
        iframe.addEventListener('load',()=>{
        if (iframe.classList.contains("loader")) {
          iframe.removeAttribute('class');
        }
      })
        
      }
    });
  } else {
    thumbnail && thumbnail.forEach((el)=>{
      if (el.classList.contains("default-hidden")) {
        el.classList.remove("default-hidden");
      }
      })

   iframes && Array.from(iframes).forEach((iframe) => {
      const url = iframe.getAttribute("data-src");
      if (url && url.includes("vimeo")) {
        iframe.removeAttribute("src");
        iframe.style.display = "none";
        
        iframe.addEventListener('load',()=>{
          iframe.setAttribute("class","loader");
        })
        
      }
    });
  }
}
(() => {
  window.SYF = window.SYF || {};
  // sync with _base.scss
  SYF.breakpoints = {
    xlarge: 1440,
    large: 1280,
    medium: 768,
    mediumlarge: 992,
    small: 480,
    mobilemenu: 1080,
  };
  var cookieName = document.cookie
    .split("; ")
    .find((row) => row.startsWith("OptanonConsent"))
    ?.split("groups")[1];
  if (cookieName) {
    cookieAccepted = cookieName.includes("CC0002%3A1") ? true : false;
  }
  const performanceCookies = ["adTrackingToken"];
  const functionalCookies = ["CardholderCard_BrandName", "CardholderCard", "adcenter_merchant_info", "adcenter_merchant_info_qa"];
  const marketingCookies = ["chevronMerchantPopupOpenedCount", "chevronMerchantPopupOpenedSession", "citgoMerchantPopupOpenedCount", "citgoMerchantPopupOpenedSession", "phillip66MerchantPopupOpenedCount", "phillip66MerchantPopupOpenedSession", "audienceList"];
  const vistaCookies = ["vsc"];

  let OTGroupsUpdatedEventFired = false;
  window.addEventListener("OneTrustGroupsUpdated", (event) => {
    if(_SFDDL.pageInfo.PageFunction == "marketplace" && _SFDDL.pageInfo.PageKind == "marketplace" && getVistaCookie('vsc')) {
      expireCookie(vistaCookies);
    }
    if (!event.detail.includes("C0002")) {
      expireCookie(performanceCookies);
      _SFDDL.pageInfo.Token = "";
    } else if (event.detail.includes("C0002")) {
      setSFDDLToken();
    }
    if (!event.detail.includes("C0003")) {
      expireCookie(functionalCookies);
    }
    if (!event.detail.includes("C0004")) {
      expireCookie(marketingCookies);
    }
    vimeoWrapper();
  //update zendesk cookies
  waitForZE()
    .then((zE) => {
      OTGroupsUpdatedEventFired = true;
      if (!event.detail.includes('C0002') && event.detail.includes('C0003')){
        zE('messenger:set', 'cookies', "functional");
        console.log("zE Setting functional cookies");
      }
      else if (!event.detail.includes('C0003')){
        zE('messenger:set', 'cookies', "none");
        console.log("zE Setting NONE cookies");
      }else if(event.detail.includes('C0002') && event.detail.includes('C0003')){
        zE('messenger:set', 'cookies', "all");
        console.log("zE Setting all cookies");
      }
    })
    .catch((error) => {
      console.error('Failed to load zE:', error);
    });
  });
  
  function waitForZE(timeout = 10000, interval = 100){
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = setInterval(() => {
      const zdiframe = document.querySelector('iframe[id="launcher"]');
      const zesnippet = document.querySelector('script[id="ze-snippet"]'); 
      if(zdiframe || zesnippet){ 
        if(typeof zE != 'undefined'){
          clearInterval(check);
          resolve(zE);
        }else if(Date.now() - startTime > timeout){
          clearInterval(check);
          reject(new Error("zE not found in time"));
        }
      }
    }, interval);
  });
  }
  
  window.addEventListener("pageshow", function(event){
   const navType = performance.getEntriesByType("navigation")[0].type;
   if(!OTGroupsUpdatedEventFired && navType === "back_forward" && typeof zE != 'undefined'){
      if (!OnetrustActiveGroups.includes('C0002') && OnetrustActiveGroups.includes('C0003')){
        zE('messenger:set', 'cookies', "functional");
        console.log("pageshow, zE Setting functional cookies");
      }
      else if (!OnetrustActiveGroups.includes('C0003')){
        zE('messenger:set', 'cookies', "none");
        console.log("pageshow, zE Setting NONE cookies");
      }else if(OnetrustActiveGroups.includes('C0002') && OnetrustActiveGroups.includes('C0003')){
        zE('messenger:set', 'cookies', "all");
        console.log("pageshow, zE Setting all cookies");
      }
   }
  });

  function expireCookie(cookiesToExpire) {
    cookiesToExpire.forEach((cookie) => {
      if (cookie === "audienceList") {
        document.cookie = `${cookie}=;path=/;max-age=0; `;
      } else {
        document.cookie = `${cookie}=;Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=synchrony.com`;
        document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 UTC; `;
        document.cookie = `${cookie}=;path=/;max-age=0; `;
      }
    });
  }

  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal__overlay")) {
      MicroModal.close(e.target.parentElement.id);
    }
  });

  //Detect if users zoom the page
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.querySelector("body").classList.remove("desktop-mode");
  } else {
    document.querySelector("body").classList.add("desktop-mode");
  }
  function detectZoom() {
    var screenCssPixelRatio = (window.outerWidth - 8) / window.innerWidth;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      document.querySelector("body").classList.remove("zoom-in-mode");
      document.querySelector("body").classList.remove("zoom-in-mode-level-400");
    } else {
      if (screenCssPixelRatio <= 1.5) {
        document.querySelector("body").classList.remove("zoom-in-mode");
        document.querySelector("body").classList.remove("zoom-in-mode-level-400");
      } else if (screenCssPixelRatio >= 1.98 && screenCssPixelRatio < 3.98) {
        document.querySelector("body").classList.add("zoom-in-mode");
        document.querySelector("body").classList.remove("zoom-in-mode-level-400");
      } else if (screenCssPixelRatio >= 3.98) {
        document.querySelector("body").classList.add("zoom-in-mode-level-400");
      }
    }
  }
  detectZoom();

//code to replace youtube hostname for OT -starts

function updateYTUrl(){
  const videoUrls=document.querySelectorAll('*[data-videourl],*[data-video-url]');
  videoUrls.forEach((dataVideoUrl) => {
    let attribute= dataVideoUrl.attributes;
    for (let attr of attribute) {
      let videourl = dataVideoUrl.getAttribute(attr.name);
      if(videourl.includes('www.youtube.com')) { 
        videourl = videourl.replace('www.youtube.com', 'www.youtube-nocookie.com');
        dataVideoUrl.setAttribute(attr.name, videourl)
      } 
    }
  });
}
updateYTUrl();
//code to replace youtube hostname for OT -ends

  window.addEventListener(
    "resize",
    function () {
      detectZoom();
    },
    true
  );
  //End of Detect if users zoom the page

  //Show or Hide Geolocation modules
  const geoLocationModules = document.querySelectorAll(".geolocation-module");

  if (geoLocationModules.length > 0) {
    if (typeof ak_co !== "undefined" && ak_co !== null && ak_co !== "" && ak_co.toLowerCase() === "us") {
      geoLocationModules.forEach(function (module) {
        var locationAttribute = module.getAttribute("loc");
        let locations = locationAttribute ? locationAttribute.split(",") : [];

        if (locations.includes(ak_st)) {
          module.classList.remove("default-hidden");

          let sibling = module.nextElementSibling;
          if (sibling && sibling.classList.contains("default-geoloc")) {
            sibling.style.display = "none";
          } else {
            let sibling = module.nextElementSibling;
            if (sibling && sibling.classList.contains("default-geoloc")) {
              sibling.classList.remove("default-hidden");
            }
          }
        }
      });
    } else {
      document.querySelectorAll(".default-geoloc").forEach(function (el) {
        el.classList.remove("default-hidden");
      });
    }
  }
  //End of Show or Hide Geolocation modules

  // Safari on iOS exceptions ----------------------------------------------------------------------------------------------
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    // Skip the hover state on iOS devices for info-link-bottoms. Added to fix SR#10
    const links = document.querySelectorAll(".info-link-bottom");
    links.forEach((link) => {
      link.addEventListener("touchstart", function (event) {
        window.location = this.getAttribute("href");
      });
    });

    // Increase the font size of the mobile nav search to 16px up from 14px. Safari will only do the zoom on focus if the font size is smaller than 16px. SR#165
    mobileNavSearchInputForm = document.querySelector(".search-form");
    if (mobileNavSearchInputForm) {
      mobileNavSearchInput = mobileNavSearchInputForm.querySelector("input");
      mobileNavSearchInput.style.fontSize = "16px";
    }
  }
  // disable 'position: sticky" on iOS Safari 15 and lower
  var ua = navigator.userAgent;
  var version = (ua.match(/Version\/(\d+).(\d+)/) || [])[1];
  if (version && parseInt(version, 10) <= 15) {
    // This is Safari version 15 or lower
    const stickyPosition = document.createElement("style");
    stickyPosition.innerHTML = `
         .sticky {
           position: static!important;
         }
       `;
    document.head.appendChild(stickyPosition);
  }

  // Add CSS rule to display the clear button in search inputs. This behavior is nromal in other browsers but NOPE not safari for iOS.
  const style = document.createElement("style");
  style.innerHTML = `
    input[type="search"]::-webkit-search-cancel-button {
      -webkit-appearance: none;
      height: 14px;
      width: 14px;
      display: block;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAn0lEQVR42u3UMQrDMBBEUZ9WfQqDmm22EaTyjRMHAlM5K+Y7lb0wnUZPIKHlnutOa+25Z4D++MRBX98MD1V/trSppLKHqj9TTBWKcoUqffbUcbBBEhTjBOV4ja4l4OIAZThEOV6jHO8ARXD+gPPvKMABinGOrnu6gTNUawrcQKNCAQ7QeTxORzle3+sDfjJpPCqhJh7GixZq4rHcc9l5A9qZ+WeBhgEuAAAAAElFTkSuQmCC);
      background-repeat: no-repeat;
      background-size: 14px;
    }
  `;
  document.head.appendChild(style);

  // no text size adjustment on iOS
  const textSizeAdjustNone = document.createElement("style");
  textSizeAdjustNone.innerHTML = `
     body {
       -webkit-text-size-adjust: none;
     }
   `;
  document.head.appendChild(textSizeAdjustNone);
  // End Safari on iOS exceptions ------------------------------------------------------------------------------------------
})();

// source: https://www.joshwcomeau.com/snippets/javascript/debounce/
var pageKindMapping = {
  'CMP': 'cmp',
  'HOMENETWORKPAGES': 'hnt',
  'CARCARENETWORKPAGES': 'cnt',
  'RESOURCES': 'res',
  'DISCOVER': 'dis',
  'SHOPPING': 'sho',
  'LOCATOR': 'loc',
  'PAYMENTESTIMATOR': 'pay',
  'MMC': 'mmc',
  'BLOG': 'blo',
  'HOME': 'hom',
  'MARKETPLACE': 'mar',
  'FIND-ACCOUNT': 'fin',
  'CONTACT': 'con',
  'OTHERS': 'oth'
};

var analyticTrigger = false;
var lastSectionAnalyticsTriggerd = false;
var firstConsent = false;
var firstSearchBox = false;

//Modal scroll to top upon opening for ios and andriod devices
function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'].includes(navigator.platform)
  // iPad on iOS 13 detection  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

//Function to get the anchor target from the URL for offers/brands modals link 
function getElementTarget(url) {
  var hostname = extractHostname(url);
  if (hostname.indexOf('synchrony') !== -1 || hostname.indexOf('syf') !== -1 || hostname.indexOf("carecredit") !== -1) {
      return "_self";
  } else {
      return "_blank";
  }
}

if (typeof getLocalData === 'undefined') {
  // bankRates.js is not present
  const DEFAULT_UISCODE = '0000000';
  const DEFAULT_RATE_TYPE = '0000000';

  function setLocalWithExpiry(key, value, expiryHours) {
    const now = new Date();

    const item = {
      value: value,
      expiry: now.getTime() + (expiryHours * 60 * 60 * 1000)
    };

    localStorage.setItem(key, JSON.stringify(item));
  }

  function storeCMSData(uiscode, rateType, expiryHours) {
    //console.log("Bank rates >> storing cms data for uiscode="+uiscode+", rateType="+rateType);
    const data = {
      uiscode: uiscode,
      rateType: rateType
    }

    setLocalWithExpiry("cmsData", data, expiryHours);
    cmsDataStored = true;
  }

  function addQueryParamOnClick(event, uiscode, isButton, targetElement) {
    var url = "";

    if (isButton) {
      url = event;
    } else {
      url = event.currentTarget.href;
    }

    isURLWhitelisted = checkURLWhitelisted(url);
    isPatternMatch = checkURLPatternMatch(url);
    isCompletePath = checkURLCompletePath(url);
    isDefaultFalse = checkDefaultIsFalse(url, uiscode);

    if (isPatternMatch && url !== SYC_HOME) {
      url = appendQueryParams(url, 'UISCode=' + uiscode);
    } else {
      if (isURLWhitelisted || isCompletePath || isDefaultFalse) {
        url = appendQueryParams(url, 'UISCode=' + uiscode);
      }
    }
     if (url.includes("intcmp")) {
      url = url.replace(/%2B/g, '%20');
       url = url.replace(/\+/g, '%20');
   }
    if (targetElement) {
      targetElement.href = url;
    } else {
      if (event && event.currentTarget) {
        event.currentTarget.href = url;
      }
      else {
        return url;
      }
    }

  }

  function attachUiscLinkEvent(event, uiscode) {
    let closestATag = getEventsClosestHref(event);
    if (closestATag) {
      let closestHref = closestATag["linkUrl"];
      let closestlinkTag = closestATag["linkTag"];
      if (closestHref && closestlinkTag) {
        addQueryParamOnClick(closestHref, uiscode, true, closestlinkTag);
      }
    }
  }

  function attachLinkEvent(uiscode) {
    document.querySelector('body').addEventListener('click', function (event) {
      attachUiscLinkEvent(event, uiscode);
    });
    document.querySelector('body').addEventListener('contextmenu', function (event) {
      attachUiscLinkEvent(event, uiscode);
    });
    document.querySelector('body').addEventListener('auxclick', function (event) {
      attachUiscLinkEvent(event, uiscode);
    });
    const links = document.querySelectorAll('a[href]:not([href*="#"]):not([href=""])');

    links.forEach(link => {
      link.addEventListener('click', function (event) {
        addQueryParamOnClick(event, uiscode, false);
      });

      link.addEventListener('contextmenu', function (event) {
        addQueryParamOnClick(event, uiscode, false);
      });

      link.addEventListener('auxclick', function (event) {
        addQueryParamOnClick(event, uiscode, false);
      });

    });

    const buttons = document.querySelectorAll("button");

    buttons.forEach(button => {
      button.addEventListener('click', handButtonClickEvent);
      button.addEventListener('contextmenu', handButtonClickEvent)
      button.addEventListener('auxclick', handButtonClickEvent)
    });
  }

  function checkURLWhitelisted(url) {
    if (typeof uiscodeURLs != 'undefined' && uiscodeURLs.urls != null && uiscodeURLs.urls.fragmentUrl.length > 0) {
      if (url != null && typeof url != 'undefined' && url.trim() != "") {

        const urlObject = new URL(url);
        const urlPathname = urlObject.pathname;

        if (window.location.hostname === "www.synchrony.com" || window.location.hostname === "qwww.synchrony.com") {
          return uiscodeURLs.urls.fragmentUrl.some(path => urlPathname === '/' + path);
        } else {
          return uiscodeURLs.urls.fragmentUrl.some(path => urlPathname === '/sites/syc/' + path);
        }
      }
    }
  }

  function checkURLPatternMatch(url) {
    const paramUrl = new URL(url);
    const hostname = paramUrl.hostname.replace(/^[a-z]*www\./, '');
    if (typeof uiscodeURLs != 'undefined' && uiscodeURLs.urls != null && uiscodeURLs.urls.pattern.length > 0) {

      for (let pattern of uiscodeURLs.urls.pattern) {
        if (pattern === hostname || hostname.includes(pattern) || url.includes(pattern)) {
          return true;
        }
      }
      return false;
    }
  }

  function checkDefaultIsFalse(url, uiscode) {
    const paramUrl = new URL(url);

    if (typeof uiscodeURLs != 'undefined' && uiscodeURLs.urls != null && uiscodeURLs.urls.noDefault.length > 0) {
      for (let pattern of uiscodeURLs.urls.noDefault) {
        if (pattern === paramUrl.href || paramUrl.href.includes(pattern) || url.includes(pattern) || env.includes('SYC_PROD') || env === 'SYC_DEV' || env.includes('SYC_QA')) {
          if (uiscode !== DEFAULT_UISCODE) {
            return true;
          }
        }
      }
      return false;
    }
  }

  function checkPathPatternMatch(url) {
    const paramUrl = new URL(url);
    const hostname = paramUrl.hostname.replace(/^[a-z]*www\./, '');

    if (typeof uiscodeURLs != 'undefined' && uiscodeURLs.urls != null && uiscodeURLs.urls.pattern.length > 0) {

      for (let pattern of uiscodeURLs.urls.pattern) {
        if (pattern === hostname || hostname.includes(pattern)) {
          return true;
        }
      }
      return false;
    }
  }

  function checkURLCompletePath(url) {
    const paramUrl = new URL(url);

    if (typeof uiscodeURLs != 'undefined' && uiscodeURLs.urls != null && uiscodeURLs.urls.completeUrl.length > 0) {

      for (let exactURL of uiscodeURLs.urls.completeUrl) {
        if (exactURL === paramUrl.href) {
          return true;
        }
      }
      return false;
    }
  }

  function getClosestHref(button) {
    const closestLink = button.closest("a[href]");
    if (closestLink) {
      const href = closestLink.getAttribute("href");
      if (href && href !== "#") {
        return href;
      }
    }
    return null;
  }

  function getEventsClosestHref(e) {
    const closestLink = e.target.closest("a[href]");
    if (closestLink) {
      const href = closestLink.href;
      if (href && href !== "#") {
        return { "linkUrl": href, "linkTag": closestLink };
      }
    }
    return null;
  }

  function handButtonClickEvent(event) {
    const button = event.currentTarget;
    const href = getClosestHref(button);
    if (href) {
      addQueryParamOnClick(href, uiscode, true);
    }
  }

  function getSessionData(key) {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      sessionStorage.removeItem(key);
      return null;
    }

    return item.value;
  }

  function getLocalData(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }

  function getUISCode() {
    const cmsData = getLocalData('cmsData');
    if (cmsData && cmsData.uiscode) {
      return cmsData.uiscode;
    } else {
      return null;
    }
  }

  function getRateType() {
    const cmsData = getLocalData('cmsData');
    if (cmsData && cmsData.rateType) {
      return cmsData.rateType;
    } else {
      return null;
    }
  }

  function getQueryParams() {
    var queryParams = {};
    var queryString = window.location.search.substring(1);

    if (queryString != "") {  // if there are no query string parameters, don't bother
      var pairs = queryString.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        var key = decodeURIComponent(pair[0]);
        var value = decodeURIComponent(pair[1]);

        queryParams[key.toLowerCase()] = value;
      }
    }
    return queryParams;
  }

  function getProductDetails(data, productId, productCode, fromLocalStorage) {

    if (fromLocalStorage) {
      data = JSON.parse(data);
    }

    if (data) {

      if (productId && productId !== null && productId !== undefined && data?.terms) {
        let maxApy = 0;


        let rate = data?.terms?.find(rate => rate.productId === productId);
        if (!rate) {
          return null;
        }

        maxApy = Math.max(...rate.rateMatrices.map(matrix => parseFloat(matrix.apy.replace('%', ''))));
        return maxApy.toFixed(2);
      } else if (productCode && productCode !== null && productCode !== undefined && data?.products) {
        for (const product of data?.products) {
          if (product.displayCode === productCode) {
            return product.maxAPY.replace('%', '');
          }
        }
      }
    }
    return null
  }

  function isScriptAvailable() {
    const config = document.querySelectorAll('*[data-id="rate-configs"]');
    if (config.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  function removeUISCodeSection() {
    var removeRateConfigs = [];
    const rateConfigObj = document.querySelectorAll('*[data-id="rate-configs"]');
    if (rateConfigObj.length > 0) {
      rateConfigObj.forEach(rateConfig => {
        const mappingObj = JSON.parse(rateConfig.innerText);
        if (mappingObj) {
          var removeSectionDetails = { hideByClass: '', displayRateHtmlId: '' };

          removeSectionDetails["hideByClass"] = mappingObj.hideByClass;
          removeSectionDetails["displayRateHtmlId"] = mappingObj.displayRateHtmlId;
          removeRateConfigs.push(removeSectionDetails);
        }
      });
    }

    removeRateConfigs.forEach(rateConfig => {
      if (rateConfig["hideByClass"]) {
        const eleToHide = document.querySelector(`.${rateConfig["hideByClass"]}`);
        eleToHide.remove();
      } else {
        const ele = document.getElementById(`${rateConfig["displayRateHtmlId"]}`);
        if (ele) {
          const parentEle = ele.parentElement;
          if (parentEle) {
            parentEle.remove();
          }
        }
      }
    });
  }

  function appendQueryParams(url, param) {

    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    const [paramName, paramVal] = param.split("=");
    params.set(paramName, paramVal);
    urlObj.search = params;
    return urlObj.toString();

  }

  function fetchUISCode(uiscode) {
    //console.log("Bank rates >> fetching UIS Code: " + uiscode);
    const apiURL = baseURL + 'api/validateuiscode?UISCode=' + uiscode;
    localStorage.removeItem("bankRateObj");
    return fetch(apiURL)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        if (response.status === 200) {
          return response.json();
        } else {
          return { "rate_type": DEFAULT_RATE_TYPE, "uiscode": DEFAULT_UISCODE };
        }

      })
      .then(data => {

        const { rate_type, uiscode } = data
        if (!uiscode) {
          rate_type = DEFAULT_RATE_TYPE;
          uiscode = DEFAULT_UISCODE;
        }
        return { rate_type, uiscode };

      })
      .catch(e => {
        //console.log("Bank rates >> Error calling CMS" + e);
        return { DEFAULT_RATE_TYPE, DEFAULT_UISCODE };
      });
  }
  
  var uiscparams = getQueryParams();
  var uiscode = uiscparams["uiscode"];
  var cmsResponseData = { rate_type: DEFAULT_RATE_TYPE, uiscode: DEFAULT_UISCODE };
  var rateConfigComponents = [];
  var isUISCodeAvailable = false;
  var fetchUISCodeStatus = false;
  var ratesDomStatusStatus = false;
  const uiscodeFromLocalStorage = getUISCode();
  var rateFromLocalStorage = getRateType();

  if (uiscode !== undefined && !isNaN(uiscode)) {
    uiscode = uiscode;
    if (uiscodeFromLocalStorage && uiscodeFromLocalStorage === uiscode /*&& uiscode !== DEFAULT_UISCODE*/) {
      //store valid rate and uiscode in case of valid UISCode
      cmsResponseData = { rate_type: rateFromLocalStorage, uiscode: uiscode };
      isUISCodeAvailable = true;
    } else {
      //store invalid rate and uiscode in case of unvalidated UISCode
      cmsResponseData = { rate_type: "NOT VALIDATED", uiscode: uiscode };
      storeCMSData(cmsResponseData["uiscode"], cmsResponseData["rate_type"], 2);
      isUISCodeAvailable = false;
    }
  } else if (uiscodeFromLocalStorage) {//There are places where the uiscode cant be appended to the url as queryparams.consider the local storage stored uiscode in this scenario
    uiscode = uiscodeFromLocalStorage;
    cmsResponseData = { rate_type: rateFromLocalStorage, uiscode: uiscode };
    isUISCodeAvailable = true;
  }   // else if UISCode is NOT found in URL 
  else {
    uiscode = DEFAULT_UISCODE;
    storeCMSData(cmsResponseData["uiscode"], cmsResponseData["rate_type"], 2);
    isUISCodeAvailable = true; /* 0000000 is valid */
  }
  attachLinkEvent(uiscode);

	if (!isUISCodeAvailable) {
		//console.log("Bank rates >> fetching");
		fetchUISCode(uiscode)
		  .then(data => {
			cmsResponseData = { rate_type: DEFAULT_RATE_TYPE, uiscode: DEFAULT_UISCODE };
			if (data) {
			  cmsResponseData["rate_type"] = data.rate_type;
			  cmsResponseData["uiscode"] = data.uiscode;
			}
			// document.addEventListener("DOMContentLoaded", attachLinkEvent(cmsResponseData["uiscode"]));
			storeCMSData(cmsResponseData["uiscode"], cmsResponseData["rate_type"], 2);
		  })
		  .catch(error => {
			//console.log("Bank rates >> Couldn't get UISCode, returning false");
			storeCMSData(DEFAULT_UISCODE, DEFAULT_RATE_TYPE, 2);
			return false;
		  });

	  }
	  // Make the function calls when page is loaded
}


/* -- UISCode Ends here */

function intcmpGeneration(url, offerId, brandName, dataObjText, kevelEvents, btnLabel) {
  const urlParam = new URLSearchParams(url);
  const hasIntCmp = urlParam.has("intcmp") || url.includes("intcmp");

  if (hasIntCmp) {
    return url;
  }
  // offerId = offerId.replace(/%2B/g, '%20');
  // offerId = offerId.replace(/\+/g, '%20');
/*
  if (url?.endsWith("/")) {
    url = url.substring(0, url.length - 1);
  }*/
  let intcmpText = offerId + "_" + brandName.replace(/\s/g, "") + "_" + _SFDDL.pageInfo.PageFunction + "_" + dataObjText;
  let hostname = extractHostname(url);
  if (hostname.indexOf("synchrony") !== -1 || hostname.indexOf("syf") !== -1 || hostname.indexOf("carecredit") !== -1) {
    let value = getValueToPrepend(url, hostname);
    intcmpText = intcmpText + (value ? "_" + value : "") + "_int";
  } else {
    if (btnLabel && !url.includes("apply")) {
      intcmpText = intcmpText + "_" + btnLabel;
      // console.log("Entered the logic" , intcmpText);
    //   console.log(kevelEvents + ", " + dataObjText + ", " + btnLabel + ", "+ url);
    }
    intcmpText = intcmpText + "_ext";
  }
  intcmpText = "intcmp=" + intcmpText;
  if (hostname.includes("www.mysynchrony.com") || hostname.includes("www.synchrony.com")) {
    intcmpText = "";
  }
  if (intcmpText?.length > 0) {
    url = url.includes("&") || url.includes("?") ? url + "&" + intcmpText : url + "?" + intcmpText;
  }

  if (url.includes("uetail.mysynchrony") || url.includes("uapply.syf") || url.includes("etail.mysynchrony") || url.includes("apply.syf")) {

    if (url.includes("&") || url.includes("?")) {
      url = url + "&platformtoken=" + _SFDDL.pageInfo.Token + "&orgchannel=" + _SFDDL.pageInfo.SiteIdentifier;
    } else {
      url = url + "?platformtoken=" + _SFDDL.pageInfo.Token + "&orgchannel=" + _SFDDL.pageInfo.SiteIdentifier;
    }

    if (url.indexOf("storeNumber=") == -1) {
      var pksf = _SFDDL.pageInfo.PageKind === "financing" && _SFDDL.pageInfo.PageFunction === "credit cards" ? "cat" : getShortForm(pageKindMapping);
      var clickType = url.indexOf("preQual") !== -1 ? "prequal" : "apply";
      url = url + "&storeNumber=" + generateDTC(pksf, clickType, true);
    }
  }


  //Adding kevel url params to Apply, Apply Now, Prequalify, See if I Prequalify buttons for Find a deal section

  if (btnLabel && (btnLabel.toLowerCase().includes("apply") || btnLabel.toLowerCase().includes("prequalify")) && kevelEvents && kevelEvents.length > 0) {
    if (userId && userId.length > 0) {
      url = url + "&userId=" + userId;
    } else if (DY.dyid && DY.dyid.length > 0) {
      url = url + "&userId=" + DY.dyid;
    } else {
      url = url + "&userId="
    }
    url = url + "&offerId=" + offerId;
    url = kevelSectionId && kevelSectionId.length > 0 && url + "&sectionId=" + kevelSectionId;
  }

  // }
  return url;
}

function generateTemplate(id, placeholder, data) {
  var scriptHTML = document.getElementById(id).innerHTML;
  if (Handlebars) {
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
trackClicksToAppendAnalyticsTrackingParams(pageKindMapping);
function encodeIntcmp(currentUrl) {
  let start = currentUrl.indexOf("intcmp");
  let [name, token] = currentUrl.substring(start).includes("=") && currentUrl.substring(start).split("=");
  let endOfTokenindex = 0;
  if (token && name) {
    if (token.length > decodeURIComponent(token).length) {
      endOfTokenindex = start + token.length + 7;
    } else {
      endOfTokenindex = start + decodeURIComponent(token).length + 7;
    }
    token = decodeURIComponent(token);
    let lastIndexOfAmpIfPresent = currentUrl.length != endOfTokenindex && token.includes("&") ? token.lastIndexOf("&") : token.length;
    token = encodeURIComponent(token.substring(0, lastIndexOfAmpIfPresent)) + token.substring(lastIndexOfAmpIfPresent, token.length);
    currentUrl = currentUrl.substring(0, start) + "intcmp=" + token + currentUrl.substring(endOfTokenindex, currentUrl.length);
  }

  if (currentUrl && currentUrl.includes("intcmp")) {
    currentUrl = currentUrl.replace(/%2B/g, '%20');
    currentUrl = currentUrl.replace(/\+/g, '%20');
    return currentUrl;
  }

  return currentUrl;
}

function updateIntDomainLink(url) {
  if (url) {
    if (url.includes(".synchronybank")) {
      const newUrl = new URL(url);
      if (url.includes("orgchannel")) {
        newUrl.searchParams.delete("orgchannel");
        url = newUrl.href;
      }
      if (url.includes("www.synchronybank") && url.includes("intcmp")) {
        newUrl.searchParams.delete("intcmp");
        url = newUrl.href;
      }
      if (!url.includes("www.synchronybank")) {
        url = url.includes("&") || url.includes("?") ? url + "&orgchannel=" + _SFDDL.pageInfo.SiteIdentifier : url + "?orgchannel=" + _SFDDL.pageInfo.SiteIdentifier;
      }
    }
  }
  return url;
}

/* Functions to call after cookie consent for CA */
function checkURL() {
  const currentURL = window.location.pathname;

  const validateStr = ["/", "/marketplace", "/marketplace/deals", "/marketplace/brands"];

  for (const substr of validateStr) {
    if (currentURL === substr) {
      // Resetting values 
      industryLoaded = false;
      firstLoad = false;
      firstConsent = true;
      offerLoaded = false;
      firstSearchBox = true;
      lastSectionAnalyticsTriggerd = false;
      analyticTrigger = false;

      if (_SFDDL) {
        _SFDDL.offers = {};
        _SFDDL.offers.offerIds = "";
      }

      var financingLink = document.getElementById("financing-link");
      if (financingLink && financingLink.href.includes("type=")) {
        financingLink.href = financingLink.href.split('?')[0];
      }

      var featureLink = document.getElementById("feature-link");
      if (featureLink && featureLink.href.includes("type=")) {
        featureLink.href = featureLink.href.split('?')[0];
      }

      var dealLink = document.getElementById("deals-link");
      if (dealLink && dealLink.href.includes("type=")) {
        dealLink.href = dealLink.href.split('?')[0];
      }

      if (document.getElementById("featuredDealplaceholder")) {
        // check for audienceList is populated -> featuredDeals
        featuredDeals();
      }
      if (document.getElementById("dealplaceholder")) {
        if (substr !== '/marketplace/brands') {
          categoryTabs();
          document.querySelectorAll(".swiper-initialized").forEach((swiperEl) => {
            if(swiperEl.swiper){
              swiperEl.swiper.slideTo(0);
            }
          });
        }
      }
      if (substr === '/marketplace') {
        setTimeout(() => {
          searchBar();
        }, 2000);
      }
    }
  }
  document.getElementById("global-footer").style.paddingBottom = "0px !important";
  return false;
}

function trackClicksToAppendAnalyticsTrackingParams(pageKindMapping) {

  function addAnalyticsTrackingParams(e) {
    const modalMenuLinks = e.target.closest("a");
    var target = e.target, classList = undefined, shortform = '';
    var classArr = ["login-link", "retailers__link", "hero-home__cta", "home-hiw__link"];
    var modalMenuLinksArr = modalMenuLinks && modalMenuLinks.classList;
    var arrCheck = false;
    if (modalMenuLinks != null && modalMenuLinks.length > 0 || modalMenuLinks != null && modalMenuLinksArr.length) {
      for (i = 0; i < modalMenuLinksArr.length; i++) {
        var foundArr = classArr.indexOf(modalMenuLinksArr[i]);
        if (!(-1 == foundArr)) {
          arrCheck = true;
        }
      }
    }
    //if (target.tagName === 'A' || target.tagName === 'BUTTON' || (modalMenuLinks && modalMenuLinks.classList.contains("login-link")) || (modalMenuLinks && modalMenuLinks.classList.contains("retailers__link")) ) {

    if (target.tagName === 'A' || target.tagName === 'BUTTON' || e.target.closest("a") !== null || (modalMenuLinks && arrCheck)) {
      let url = target.getAttribute("href") ? target.getAttribute("href") : e.target.closest("a")?.getAttribute("href");
      //the below code is to append the intcmp to the urls using data-attrs SYFC-6204-starts

      var targetclassList = target ? target.classList : null;
      if (targetclassList && targetclassList.contains('intcmp')) {
        let dataOfferId = target.getAttribute("data-offerid") ? target.getAttribute("data-offerid") : "";
        let dataBrand = target.getAttribute("data-brand") ? target.getAttribute("data-brand") : "";
        let dataObject = target.getAttribute("data-object") ? target.getAttribute("data-object") : "";
        url = intcmpGeneration(url, dataOfferId, dataBrand, dataObject);
      }
      url = updateIntDomainLink(url);
      //the below code is to append the intcmp to the urls using data-attrs SYFC-6204-ends


      if (url && url.indexOf('intcmp') !== -1) {
        if (url.includes("pagefunc") && _SFDDL && _SFDDL.pageInfo.PageFunction != undefined) {
          url = url.replace("pagefunc", _SFDDL.pageInfo.PageFunction);
        }
        if (url.includes("pnl") && _SFDDL && _SFDDL.pageInfo.PNL != undefined) {
          url = url.replace("pnl", _SFDDL.pageInfo.PNL);
        }
        // adding this code, as we have few use cases where the url was bulk updated with the placeholder as datareason
        if (url.includes("datareason") && e.target.closest("a").getAttribute("data-reason") != null) {
          url = url.replace("datareason", e.target.closest("a").getAttribute("data-reason"));
        }
        //Added by Vinda Sawant to replace dataobject value of intcmp with data-object attribute of respective a tag
        if (url.includes("dataobject") && e.target.closest("a").getAttribute("data-object") != null) {
          url = url.replace("dataobject", e.target.closest("a").getAttribute("data-object"));
        }
        url = encodeIntcmp(url);
      }


      if (url && isApplyURL(url)) {
        if (url.indexOf("&platformtoken") == -1) {
          url = url + "&platformtoken=" + _SFDDL.pageInfo.Token;
        }
        if (url.indexOf("&orgchannel") == -1) {
          url = url + "&orgchannel=" + _SFDDL.pageInfo.SiteIdentifier;
        }
        if (url.indexOf("&storeNumber=") == -1) {
          var classList = target.classList;
          var pksf = getShortForm(pageKindMapping);
          var clickType = url.indexOf('preQual') !== -1 ? 'prequal' : 'apply';
          var isOfferCardButton = classList.contains('offer-card__button');
          url = url + "&storeNumber=" + generateDTC(pksf, clickType, isOfferCardButton);
        }
        let sitecode = localStorage.getItem("MS_Sitecode");
        if (sitecode != null && sitecode.trim().length > 0 && _SFDDL.pageInfo.PageFunction !== "credit cards") {
          url = sitecodePersistencyAppender(url, sitecode);
        }
      }
      if (url && target && target.href && url !== target.href) {
        target.href = url;
      } else if (e.target.closest("a") && e.target.closest("a").href) {
        e.target.closest("a").href = url;
      }
    }
  }
  function isApplyURL(url) {
    var host = extractHostname(url);
    if ((host.indexOf('etail.mysynchrony') !== -1) || (host.indexOf('apply.syf') !== -1)) {      
      return true;
    } else {
      return false;
    }
  }

  const modalWindow = document.getElementById("login-sub-nav-2");
  const bankingSubnav = document.getElementById("banking-sub-nav");
  const brandclass = document.getElementById("brandsSection");
  const heroClass = document.getElementsByClassName("hero-home__slide");

  const homeInnerClass = document.getElementsByClassName("home-hiw__inner");
  if (modalWindow || brandclass || heroClass || homeInnerClass || bankingSubnav ) {
    const linksInModal = modalWindow ? modalWindow.querySelectorAll('a') : null;
    const bankingNav = bankingSubnav ? bankingSubnav.querySelectorAll('a') : null;

    if (linksInModal != null) {
      linksInModal.forEach(function (link) {
        link.addEventListener('click', addAnalyticsTrackingParams);
        link.addEventListener('contextmenu', addAnalyticsTrackingParams);
        link.addEventListener('auxclick', addAnalyticsTrackingParams);
      });
    }
    if (bankingNav != null) {
      bankingNav.forEach(function (nav) {
        nav.addEventListener('click', addAnalyticsTrackingParams);
        nav.addEventListener('contextmenu', addAnalyticsTrackingParams);
        nav.addEventListener('auxclick', addAnalyticsTrackingParams);
      });
    }
  }

  document.addEventListener('click', addAnalyticsTrackingParams);
  document.addEventListener('contextmenu', addAnalyticsTrackingParams);
  document.addEventListener('auxclick', addAnalyticsTrackingParams);

}
/*DTC code param code ends and analytics add on request*/

//Add analytics storeNumber attrubute to carecredit links
function storeNumberToCareCreditLinks () {
  var anchorTags = $('a');
  var pageFunctionVal = _SFDDL.pageInfo.PageFunction;
  anchorTags.each(function(){
    var hrefAttribute = $(this).attr('href');
    var dataReasonAttribute = $(this).attr('data-reason');
    var dataObjectAttribute = $(this).attr('data-object');
    if (hrefAttribute !== undefined) {
      if (hrefAttribute.includes("carecredit.com")) {
        if (hrefAttribute.indexOf("storeNumber=") === -1) {
          var classList = $(this).classList;
          var clickType = hrefAttribute.indexOf('preQual') !== -1 ? 'prequal' : 'apply';
          if (pageFunctionVal.toLowerCase() === 'mmc') {
            var pksf = pageFunctionVal.toLowerCase();
          } else {
            var pksf = getShortForm(pageKindMapping);
          }
          if ($(this).hasClass('offer-card__button')) {
            var isOfferCardButton = true;
          } else {
            var isOfferCardButton = false;
          }
          if (dataReasonAttribute !== undefined) {
            if (dataReasonAttribute.toLowerCase().indexOf("apply") === -1 && dataReasonAttribute.toLowerCase().indexOf("prequalify") === -1) {
              if (hrefAttribute.indexOf("?") === -1) {
                url = hrefAttribute + "?storeNumber=" + pksf+'e';
              } else {
                url = hrefAttribute + "&storeNumber=" + pksf+'e';
              }
              $(this).attr('href',url);
            } else if (dataReasonAttribute.toLowerCase().indexOf("apply") >= 0 && dataObjectAttribute.toLowerCase().indexOf("offers") >= 0) {
              if (hrefAttribute.indexOf("?") === -1) {
                url = hrefAttribute + "?storeNumber=" + pksf+'a';
              } else {
                url = hrefAttribute + "&storeNumber=" + pksf+'a';
              }
              $(this).attr('href',url);
            } else {
              if (hrefAttribute.indexOf("?") === -1) {
                url = hrefAttribute + "?storeNumber=" + generateDTC(pksf, clickType, isOfferCardButton);
              } else {
                url = hrefAttribute + "&storeNumber=" + generateDTC(pksf, clickType, isOfferCardButton);
              }
              $(this).attr('href',url);
            }
          } else {
            if (hrefAttribute.indexOf("?") === -1) {
              url = hrefAttribute + "?storeNumber=" + pksf+'e';
            } else {
              url = hrefAttribute + "&storeNumber=" + pksf+'e';
            }
            $(this).attr('href',url);
          }
        }
      }
    }
  });
}
setTimeout(function(){
  storeNumberToCareCreditLinks();
}, 2000);
$('body').on('click', '.deal-tile', function() {
  storeNumberToCareCreditLinks();
});
//End of Add analytics storeNumber attrubute to carecredit links

if (!window.debounce) {
  window.debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  };
}


function extractHostname(url) {
  var hostname;
  if (url.startsWith('/')) {
    return window.location.hostname;
  }
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }
  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];
  return hostname;
}

function getValueToPrepend(url, hostname) {
  if (hostname.indexOf('synchrony.com') !== -1) {
    if (hostname.indexOf('tail') !== -1) {
      return 'apply';
    }
    if (url.indexOf('home') !== -1) {
      return 'home';
    }
    if (url.indexOf('car-care') !== -1) {
      return 'carcare';
    }
  }
  if (hostname.indexOf('consumercenter.mysynchrony') !== -1) {
    return 'consumercenter';
  }
  if (hostname.indexOf('apply') !== -1) {
    return 'apply';
  }
  if (hostname.indexOf('synchronybusiness') !== -1) {
    return 'syfbiz'
  }
  if (hostname.indexOf('synchronyfuel') !== -1) {
    return 'synfuel';
  }
  if (hostname.indexOf('synchronybank') !== -1) {
    return 'syfbank';
  }
  if (hostname.indexOf('synchrony') !== -1) {
    return 'synchrony';
  } else {
    return 'apply';
  }
}


function generateDTC(pksf, clickType, isOfferCardButton) {
  switch (clickType) {
    case 'apply':
      return pksf + (isOfferCardButton ? 'a' : 'c');

    case 'prequal':
      return pksf + (isOfferCardButton ? 'b' : 'd');
  }
}


function getShortForm(pageKindMapping) {
  let shortForm = 'oth';
  try {
    let pageKind = _SFDDL.pageInfo.PageKind.toUpperCase().split(" ").join("");
    let pageFunction = _SFDDL.pageInfo.PageFunction.toUpperCase();
    if (pageKind === 'NETWORKPAGES') {
      var path = window.location.pathname;

      if (path.indexOf('/home/') !== -1) {
        pageKind = "HOME" + pageKind;
      }

      if (path.indexOf('/car-care/') !== -1) {
        pageKind = "CARCARE" + pageKind;
      }
    }
    if (pageKindMapping.hasOwnProperty(pageKind)) {
      shortForm = pageKindMapping[pageKind];
    }
    if (pageKind === 'DISCOVER' && pageFunction === 'BLOG') {
      shortForm = pageKindMapping[pageFunction];
    }
  } catch (err) {
    console.log(err + ' While getting the short form');
  }
  return shortForm;
}


function detectDeviceType() {
  var deviceType = "desk";
  var width = screen.width;
  if (width > 1024) {
    deviceType = "desk";
  } else if (width >= 768 && width <= 1024) {
    deviceType = "tab";
  } else if (width <= 768) {
    deviceType = "mobi";
  }
  return deviceType;
}
function setDeviceType() {
  try {
    var deviceType = detectDeviceType();
    _SFDDL.pageInfo.Device = deviceType;
    localStorage.setItem("DeviceType", deviceType);
  } catch (e) {
    if (e.name == "ReferenceError") {
      console.log("SFDDL not available, setting to default device");
    }
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function getCookieValue(a) {
  var b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}
function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2);
}
function generateComplexId() {
  var arr = new Uint8Array(20);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map(dec2hex).join("");
}
function generateSimpleId() {
  return Array(33)
    .join((Math.random().toString(36) + "00000000000000000").slice(2, 18))
    .slice(0, 32);
}
function isGoodString(tempString) {
  if (tempString === null || tempString.trim() || typeof tempString == "undefined" || typeof tempString != "string") {
    return false;
  }
  return true;
}
 
// code for update token
class IdleTimer{
  constructor(timer){
    this.timer=timer;
    this.idleMinute=0;
    this.activeMinute=1;
    this.startIdleTimer();
    this.registerActivityListeners();
  }
  
  startIdleTimer(){
    this.idleInterval = setInterval(()=>this.timerIncrement(),this.timer) 
  }

  registerActivityListeners(){
    const events=['mousemove','keypress','click','scroll','touchstart'];
    events.forEach(event=>{
      document.addEventListener(event,()=>this.resetTimer());
    })
  }
  resetTimer(){
    this.idleMinute =0;
  }

  timerIncrement(){
    if(this.idleMinute > 0){
      this.activeMinute = 1;
    } else{
      this.activeMinute++;
    }
    this.idleMinute++;
  
    // For testing purpose changing active Minute to 4 hour(6*4). TODO: change back to 12 hour for prod(12*6)
  
  if ((this.idleMinute > 2 || this.activeMinute > 72) && typeof OnetrustActiveGroups != "undefined" && OnetrustActiveGroups.includes("C0002") ) {
   this.setCookie();
   this.resetTimer();
   this.activeMinute=1;
    }  

  }

  setCookie(){
    var randomID = generateComplexId();

    if (isGoodString(randomID)) {

      randomID = generateSimpleId();

    }

    document.cookie = "adTrackingToken=" + randomID + ";path=/";

    _SFDDL.pageInfo.Token = getCookieValue("adTrackingToken");
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const idleTimer = new IdleTimer(10*60000) //every 10 minutes
});


 
// End of Update Token
  
var setSFDDLToken = function () {
  try {
    var adToken = getCookieValue("adTrackingToken");
    if (isGoodString(adToken)) {
      var randomID = generateComplexId();
      if (isGoodString(randomID)) {
        randomID = generateSimpleId();
      }
      document.cookie = "adTrackingToken=" + randomID + ";path=/";
    }
    _SFDDL.pageInfo.Token = getCookieValue("adTrackingToken");
  } catch (e) {
    console.log("Token not set" + e);
    if (_SFDDL) {
      var randomID = generateSimpleId();
      document.cookie = "adTrackingToken=" + randomID + ";path=/";
      _SFDDL.pageInfo.Token = getCookieValue("adTrackingToken");
    }

  }
};
function tealiumCustomEvent() {
  // console.log("SFDDL Value" + JSON.stringify(_SFDDL));
  let utagEvent = new CustomEvent("syfpageview");
  window.dispatchEvent(utagEvent);
}
setDeviceType();
if (cookieAccepted) {
  setSFDDLToken();
}
tealiumCustomEvent();
function getDYCookie() {
  jQuery.ajax({
    type: "GET",
    url: "/sites/Satellite?pagename=DYITPCookie",
    data: !1,
    success: function (response) {
      console.log("success!!");
    },
    error: function (response) {
      console.log("failed!!");
    },
  });
}

/*sitecode persistency code */
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  url = url.toUpperCase();
  name = name.toUpperCase();
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getParameterByNameLower(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function sitecodePersistency() {
  var sitecodefromcamp = getParameterByName("sitecode");
  if (sitecodefromcamp != null && sitecodefromcamp.trim().length > 0) {
    localStorage.setItem("MS_Sitecode", sitecodefromcamp);
  }
}

function sitecodePersistencyAppender(url, sitecode) {
  let newUrl = "";
  if (url.indexOf("sitecode") > -1) {
    newUrl = updateURLParameter(url, "sitecode", sitecode);
    return newUrl;
  }
  else {
    if (url.includes("?")) {
      newUrl = url + "&sitecode=" + sitecode;
    } else {
      newUrl = url + "?sitecode=" + sitecode;
    }
    return newUrl;
  }
  //updateurlparamfunction
  function updateURLParameter(url, param, paramVal) {
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
      tempArray = additionalURL.split("&");
      for (var i = 0; i < tempArray.length; i++) {
        var existingparam = tempArray[i].split('=')[0]
        existingparam = existingparam.toLowerCase();
        if (existingparam != param) {
          newAdditionalURL += temp + tempArray[i];
          temp = "&";
        }
      }
    }
    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
  }
}

/* onclick close accordion on CRA page */
function closeAccordion() {
  // Adding custom code for CRA Public Page & Diversity page
  var isCRApage = $("#cra-public-file").length;

  if (isCRApage) {
    var isAlertBanner = $("#alert-wrapper").length;
    if (isAlertBanner) {
      $(".main-page-content .main-content .section-contents").css("scroll-margin-top", "200px");
    } else {
      $(".main-page-content .main-content .section-contents").css("scroll-margin-top", "140px");
    }
  }
}

/*sitecode persistency code ends */

document.addEventListener("DOMContentLoaded", () => {
  //var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
  var dyidServerCookie = getCookieValue("_dyid_server");
  if (dyidServerCookie === null || dyidServerCookie.trim() == "" || typeof dyidServerCookie == "undefined" || typeof dyidServerCookie != "string") {
    getDYCookie();
  }
  // sitecode persistency call
  sitecodePersistency();
  vimeoWrapper();
  // }

  setTimeout(() => {
    // Adding padding for OneTrust section as its overlapping with Footer content 
    let isConsent = document.cookie.indexOf('OptanonAlertBoxClosed=');
    if (isConsent === -1 && (window.ak_st && window.ak_st !== "CA") && document.getElementById("global-footer")) {
      let height = $("#onetrust-banner-sdk").outerHeight();
      height = height + "px";
      document.getElementById("global-footer").style.paddingBottom = height;
    } else {
    if(document.getElementById("global-footer"))
      document.getElementById("global-footer").style.paddingBottom = "0px";
    }
  }, 5000);

});

function sanitizeText(input) {
  if (input) {
    const cleanInput = input.replace(/<[^>]*>/g, '');

    const sanitizedInput = cleanInput.replace(/[&<>"'`=\/]/g, function (match) {
      switch (match) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        case "`":
          return '&#96;';
        case "=":
          return '&#61;';
        case "/":
          return '&#47;';
        default:
          return match;
      }
    });

    return sanitizedInput;
  }
}
/* disclouser today's date functionality */
function getCurrentDate() {
  var currentDate = new Date();
  var day = currentDate.getDate() > 9 ? currentDate.getDate() : '0' + currentDate.getDate();
  var month = currentDate.getMonth() + 1; // Add 1 as months are zero-based
  var year = currentDate.getFullYear();
  var curDate = `${month}/${day}/${year}`;
  var placeholder1 = document.querySelector(".dis_date1");

  if (placeholder1 !== null) {
    placeholder1.textContent = curDate;
  }
}
getCurrentDate();

// Moved from offer.js
function removeSection(className) {
  const sectionId = document.getElementsByClassName(className);
  if (sectionId && sectionId.length > 0) {
    sectionId[0].classList.add("default-hidden");
  }
}


function waitForObject(objectName, callback) {
  let callBackCalled = false;
  const interval = setInterval(() => {
    if (window[objectName] && !callBackCalled) {
      callback(window[objectName]);
      clearInterval(interval);
      callBackCalled = true;
    }
  }, 200);
}

// dispatch custom event for blog page
function tealiumCustomFilterEvent() {
  waitForObject('FilterupdateEventListener', (obj) => {
    let utagEvent = new CustomEvent("FilterUpdatedEvent");
    window.dispatchEvent(utagEvent);
  })
}

//Sending intcmp and sitecode info to Salesforce
/* sitecode and intcmp param */
function initWebForm(type) {
  try {
    var sitecode_value = getParameterByNameLower("sitecode");
    var intcmp_value = getParameterByNameLower("intcmp");
    // var contactFormEl = document.getElementById("contact-form");

    if (sitecode_value != null || intcmp_value != null) {
      if (sitecode_value != null) {
        saveToLocalStorage("sitecode-" + type, sitecode_value);
      }
      if (intcmp_value != null) {
        saveToLocalStorage("intcmp-" + type, intcmp_value);
      }
    }
    if (getFromLocalStorage("sitecode-" + type) != null) {
      var sitecode_local = getFromLocalStorage("sitecode-" + type);
      setValueToControl("#sitecode", sitecode_local)
      //console.log("sitecode cookie is --> "+sitecode_local);
    }
    if (getFromLocalStorage("intcmp-" + type) != null) {
      var intcmp_local = getFromLocalStorage("intcmp-" + type);
      setValueToControl("#intcmp", intcmp_local);
      //console.log("intcmp cookie is --> "+intcmp_local);
    }
  } catch (err) {
    console.error('Failed initialiazing web form ', err);
  }
};

function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    return false;
  }
}

function getFromLocalStorage(key) {
  return localStorage.getItem(key);
}

function setValueToControl(selector, value) {
  var $element = null;

  if (selector && value) {
    $element = $(selector);
    $element && $element.val(value);
  }
}

function sanitizeInput(data) {
  if (data && data !== null && data !== undefined && data != '') {
    const cleanInput = data.replace(/<[^>]*>/g, '');
    return cleanInput;
  }
}

function waitForZDElement(attribute, value, callback){    
  function checkZDElement(){
    const zdElement = document.querySelector('iframe[id="launcher"]');   
    if(zdElement){                  
    const zdButton = zdElement.contentWindow.document.querySelector(`button[${attribute}="${value}"]`);
      if(zdButton){
        zdButton.setAttribute("data-reason","chat");
        zdButton.setAttribute("data-type","button");
        zdButton.setAttribute("data-object","body-launchZendesk")
        zdButton.classList.add("syfclickevent");
      }
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
      if(callback) callback(zdElement);
    }
  }
  const observer = new MutationObserver(()=> checkZDElement);
  observer.observe(document.body, { childList: true, subtree: true});
  const interval = setInterval(() => checkZDElement(), 300);

  const timeout = setInterval(() => {
    clearInterval(interval);
    observer.disconnect();
  }, 60000)

  checkZDElement();
}

function loadLazyImageSkeleton(){
         setTimeout(() => {
          const lazyImages = document.querySelectorAll(".lazy-image");

          const observer = new IntersectionObserver((entries, observer) => {
              entries.forEach(entry => {
                  if(!entry.isIntersecting) return;

                  const img = entry.target;
                  const container = img.parentElement;
                  const skeleton = container.querySelector(".skeleton");

                  const src = img.getAttribute("data-src");
                  if(src){
                      const tempImg = new Image();
                      tempImg.src = src;
                      tempImg.onload = () => {
                          img.src = src;
                          img.classList.add("loaded");
                          const skeleton = img.previousElementSibling;
                          if(skeleton) skeleton.remove();
                      };
                  }

                  observer.unobserve(img);
              });
          }, {
              rootMargin: "0px 0px 0px 0px",
              threshold: 0.1
          });

          lazyImages.forEach(img => observer.observe(img));
        }, 300);
    }

    const currentPath = window.location.pathname;

    if (currentPath.includes("search-results")) {
        window.addEventListener("DOMContentLoaded", () => { 
            loadLazyImageSkeleton();
        });

        const lazyLoadingMutationObserver = new MutationObserver(() => {
            loadLazyImageSkeleton();
        });

        lazyLoadingMutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        })
        
        
    } else {
        window.addEventListener("scroll", () => { 
            loadLazyImageSkeleton();
        });

        const lazyLoadingMutationObserver = new MutationObserver(() => {
            loadLazyImageSkeleton();
        });

        lazyLoadingMutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        })
    }
	  
	var logDetails = {
        pageName: _SFDDL != undefined && _SFDDL.pageInfo != undefined && _SFDDL.pageInfo.PageName != undefined ? _SFDDL.pageInfo.PageName : "",
        pageUrl: window.location.href,
        formName: "",
        statusCode: "",
        status:"",
        errorMsg:""
    }
function logFailure(errLogs) {
    getCMSData("cmsdata", "SYF/Utility/FormLogger&errLogs=" + JSON.stringify(errLogs), false,errLogs)
    .then((data) => {
    });
}

async function getCMSData(apiData = "", requestParam, dydata, logMsg) {
  let url = "";

  if (apiData == "cmsdata") {
    url = "/sites/Satellite?pagename=SYF/Utility/FormLogger&errLogs=" + encodeURIComponent(JSON.stringify(logMsg));

    const response = await fetch(url);

    if (!response.ok) {
      // Handle cases where the error response itself is not valid JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.message);
      } catch (jsonError) {
        // If parsing fails (e.g., SyntaxError: Unexpected end of JSON input),
        // get the raw response text
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText || response.statusText}`); // Fallback to statusText if body is empty
      }
    }

    let finalData;
    try {
      finalData = await response.json(); // Try to parse the response as JSON
    } catch (jsonError) {
      // Handle the "Unexpected end of JSON input" error
      return {}; // Returning an empty object as a fallback
    }
    return finalData;
  }
}

$(document).ready(function(){
    $("#alert-button-global").on("click", function(e){
        $("#syc-alert-model-component-wrapper").show();
    });

    $(".syc-alert-model-close-btn").on("click", function(e){
        $("#syc-alert-model-component-wrapper").hide();
    });
});

document.addEventListener("DOMContentLoaded", function() {
	var banner = document.getElementById('alert-wrapper');
   if (banner !== null) {
	 var hasClass = banner.querySelector(".alert-container");
  if (hasClass) {   
    var visibleAlertList = Array.from(document.querySelectorAll(".alert-banner .alert-list-alert:not(.default-hidden)"));
    if(visibleAlertList.some(a => a.classList.contains("alert-high"))){
        hideAlerts(["alert-medium","alert-low"]);
        document.querySelector(".alert-close").style.display = "none";
    }
    var alertList = Array.from(document.querySelectorAll(".alert-banner .alert-list-alert:not(.default-hidden)"));
  if (alertList !== null) {
    if (alertList.length == 0) {
        banner.style.display = 'none';
    }
	if (alertList.length == 1) {
		document.querySelector(".alert-prev").style.visibility  = 'hidden';
		document.querySelector(".alert-next").style.visibility  = 'hidden';
	}
    // mark first alert active
    alertList[0].classList.add("active");
    function getActiveAlert() {
        return document.querySelector(".alert-banner .alert-list-alert.active");
    }
    function getActiveAlertIndex() {
        return alertList.findIndex(e => e.classList.contains("active"));
    }
	
	document.querySelector(".alert-banner .alert-prev").addEventListener("click", function() {
        var activeIdx = getActiveAlertIndex();
        getActiveAlert().classList.remove("active");
        if (activeIdx > 0) {
            alertList[activeIdx - 1].classList.add("active");
        } else {
            alertList[alertList.length-1].classList.add("active");
        }
        // on prev click: move "active" to previous sibling if any, else move "active" to last
    });
    document.querySelector(".alert-banner .alert-next").addEventListener("click", function() {
        // on next click: move "active" to previous sibling if any, else move "active" to first
        var activeIdx = getActiveAlertIndex();
        getActiveAlert().classList.remove("active");
        if (alertList.length > activeIdx+1) {
            alertList[activeIdx+1].classList.add("active");
        } else {
            alertList[0].classList.add("active");
        }
    });
    document.querySelector(".alert-close").addEventListener("click", function() {
        document.querySelector(".alert-banner").classList.add("hidden");
    })
  }}}})
function hideAlerts(alertClasses) {
  alertClasses.forEach(function(className) {
    document.querySelectorAll("." + className).forEach(function(alert) {
      alert.classList.add("default-hidden"); 
    });
  });
} 

$(document).ready(function () {
    // Attach click event to all buttons with the class 'toggle-button'
    $('.modal-show-more-toggle-button').on('click', function () {
        // Find the sibling element with the class 'content'
        const content = $(this).siblings('.modal-more-content-wrapper');

        // Toggle the 'expanded' class on the sibling
        content.toggleClass('expanded');

        // Update the button text based on the expanded state
        if (content.hasClass('expanded')) {
            $(this).find(".show-more-text").hide();
            $(this).find(".show-less-text").show();
        } else {
            $(this).find(".show-more-text").show();
            $(this).find(".show-less-text").hide();
        }
    });

    $('.learn-more-modal-close-btn').on('click', function (event) {
        $(".modal-more-content-wrapper").removeClass('expanded');
        $(".learn-more-modal-component-content").find(".show-more-text").show();
        $(".learn-more-modal-component-content").find(".show-less-text").hide();
        $(".learn-more-modal-component-wrapper").hide();
        event.preventDefault();
    });

    $('.learn-more-modal-component-wrapper').on('click', function(evt){
        if (evt.target == this) {   // only trigger click on the shadow area outside the modal, not the modal itself
            document.querySelector(".learn-more-modal-close-btn").click();
        }
    })

    document.querySelectorAll(".learn-more-modal-component-wrapper").forEach(e => {
        $("a[href='#"+e.id+"']").on('click', function(f){
            // for each .learn-more-modal-component-wrapper 
            // wire click event to pop up element with id matching the fragment
            // prevent default
            $(new URL(f.currentTarget.href).hash).show();
            f.preventDefault();
        });
    });
});

