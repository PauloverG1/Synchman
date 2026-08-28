var SYC_HOME = "/"
var baseURL = "/";
var bankApiURL = 'https://api-uat.syf.com/v1/retailBank/products?serviceLevel=';
const PRODUCT_IDS = [];

const DEFAULT_UISCODE = '0000000';
const DEFAULT_RATE_TYPE = '0000000';
const startTime = performance.now(); // Get current timestamp

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
    return env.indexOf("SYC_PROD-DEL")>= 0;
  } catch (e) {
    return false;
  }
}

function isProdMgt() {
  return env.indexOf("SYC_PROD-MGMT")>= 0;
}

function showExecutionTime(message) {
    const endTime = performance.now();
    const executionTime = parseInt(endTime - startTime);
    console.log(message + ` at ${executionTime} ms`);
}

function fetchUISCode(uiscode) {
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
      return { DEFAULT_RATE_TYPE, DEFAULT_UISCODE };
    });
}

var bankRatesWorking = false;
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBankRates(code) {
  const apiURL = bankApiURL + code;
  if (bankRatesWorking) {
    while (!bankRates) {
      await sleep(250);
    }
    return bankRates;
  } else {
    // showExecutionTime("Getting bank rates");
    //console.trace();
    bankRatesWorking = true;
    return fetch(apiURL)
    .then(response => {
      if (!response.ok) {
        // showExecutionTime("Bank rates error ");
        throw new Error("Network response from Bank was not ok");
      }
      return response.json();
    })
    .then(data => {
      bankRates = data?.productTypes;
      // console.log(bankRates);
      // console.log(typeof bankRates);
      if (!bankRates) {
        throw new Error("No Bank rates were found");
      }
      return bankRates;
    })
    .catch(e => {
      removeSection();
    });
  }
}

function getQueryParams() {
  if (queryString != "") {  // if there are no query string parameters, don't bother
    var queryParams = {};
    var queryString = window.location.search.substring(1);

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

  if (typeof data == "string") {
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

function setSessionWithExpiry(key, value, expiryHours) {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + (expiryHours * 60 * 60 * 1000)
  };

  sessionStorage.setItem(key, JSON.stringify(item));
}
function setLocalWithExpiry(key, value, expiryHours) {
  const now = new Date();

  const item = {
    value: value,
    expiry: now.getTime() + (expiryHours * 60 * 60 * 1000)
  };

  localStorage.setItem(key, JSON.stringify(item));
}

function storeCMSData(uiscode, rateType, expiryHours) {
  const data = {
    uiscode: uiscode,
    rateType: rateType
  }

  setLocalWithExpiry("cmsData", data, expiryHours);
  cmsDataStored = true;
}

function isLinkSamePage(url) {
  return (new URL(window.location.href).pathname !="/search-results" && new URL(url).pathname == new URL(window.location.href).pathname); // ignores fragment and query string
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

  if (isLinkSamePage(url)) return; // don't refresh the page if a link goes to a fragment of the same page

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
document.addEventListener("DOMContentLoaded", function() {
  attachLinkEvent(uiscode);
})
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


// moving to top to increase performance
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
}		// else if UISCode is NOT found in URL 
else {
  uiscode = DEFAULT_UISCODE;
  storeCMSData(cmsResponseData["uiscode"], cmsResponseData["rate_type"], 2);
  isUISCodeAvailable = true; /* 0000000 is valid */
}

if (!isUISCodeAvailable) {
  fetchUISCode(uiscode)
    .then(data => {
      cmsResponseData = { rate_type: DEFAULT_RATE_TYPE, uiscode: DEFAULT_UISCODE };
      if (data) {
        cmsResponseData["rate_type"] = data.rate_type;
        cmsResponseData["uiscode"] = data.uiscode;
      }
      // document.addEventListener("DOMContentLoaded", attachLinkEvent(cmsResponseData["uiscode"]));
      storeCMSData(cmsResponseData["uiscode"], cmsResponseData["rate_type"], 2);
      fetchUISCodeEventFn();
    })
    .catch(error => {
      storeCMSData(DEFAULT_UISCODE, DEFAULT_RATE_TYPE, 2);
      return false;
    });

} else {
  fetchUISCodeEventFn();
}
// Make the function calls when page is loaded

function fetchUISCodeEventFn() {
  fetchUISCodeStatus = true;

  if (!bankRates) {
    getRatesForObserver((validated) => {
      ratesValidated = validated;
      if (ratesValidated) {
        populateComponents();
      }
    });
  } else {
    populateComponents();
  }
}

function populateComponents() {
    rateConfigComponents.filter(f => !(f.rendered)).forEach(config => {
        //Extract Specific Product 
        if (bankRates && document.getElementById(config.displaySection)) {
            // showExecutionTime("populating " + config.displaySection);
            const maxApy = getProductDetails(bankRates, config.productId, config.productCode, false);
            document.getElementById(config.displaySection).innerText = maxApy;
            if(config.isMaxRate) {
              var target = getUpToTermTarget(document.getElementById(config.displaySection));
              if (typeof bankRates == "string") {
                //var target = document.getElementById("highestMonthForUpToCD")?.closest(".rate-tile,.feature-tile")?.querySelector(".rate-tile-eyebrow") ?? document.getElementById("highestMonthForUpToCD");
                getHighestMonthUpTo(JSON.parse(bankRates), target, (target.closest(".fullwidth-hero")) ? "hero" : "upTo");
              } else 
              {
                getHighestMonthUpTo(bankRates, target, (target.closest(".fullwidth-hero")) ? "hero" : "upTo");
              }
            }
            config.rendered = true;
        }
    });
}

// Callback function to execute when mutations are observed
const rateObserverCallback = (mutationList, observer) => {
  for (const mutation of mutationList) {
    let newNodes = mutation.addedNodes;
    newNodes.forEach(newNode => {
      // if newNode is a rate config object, add it to rateConfigComponents.
      checkIfRateNode(newNode);
    });
  }
};

function checkIfRateNode(newNode) {
  // if (typeof newNode.classList !== "undefined" && newNode.classList.contains("compare-cd-products-table-section")) {
  //   alert ("found the parent!");
  // }
  if (newNode.nodeType == Node.ELEMENT_NODE && newNode.dataset.id == "rate-configs") {
    
    try {
    const mappingObj = JSON.parse(newNode.innerText);
    if (mappingObj) {
        if ((rateConfigComponents.filter(r => r.displaySection == mappingObj.displayRateHtmlId)).length == 0){ // Do not push a duplicate component
        var productSectionDetails = { rate_type: '', productId: 0, displaySection: '', hideSection: '' };
        productSectionDetails["rate_type"] = mappingObj.rate_type;
        productSectionDetails["productId"] = mappingObj.productId;
        productSectionDetails["productCode"] = mappingObj.productCode;
        productSectionDetails["displaySection"] = mappingObj.displayRateHtmlId;
        productSectionDetails["hideSection"] = mappingObj.hideByClass;
        productSectionDetails["rendered"] = false;
        productSectionDetails["isMaxRate"] = !!(mappingObj.displayApyOrRate === "maxRate");
        rateConfigComponents.push(productSectionDetails);
      }
        //   if (!(ratesValidated && bankRates)) {
        //     // If this is the first rate config component, fetch the rates, since we know we need them
        if (!bankRates) {
            getRatesForObserver((validated) => {
                ratesValidated = validated;
                populateComponents(); 
            });   
        }
    }} catch (e) {
      console.log("rate-config parse failed:");
      console.log(e);
    }
  }
  else if (bankRates && ratesValidated) {// if rates are already loaded, populate the element
    // TODO/BUG should we just iterate over the rateConfigComponents instead and check if any of them are unpopulated,
    // and populate them if so?  That might be faster/more reliable than this approach.
    rateConfigComponents.filter(f => !(f.rendered)).forEach(config => {
        if (document.getElementById(config.displaySection)) {
            //Extract Specific Product 
            // showExecutionTime("populating " + config.displaySection);
            const maxApy = getProductDetails(bankRates, config.productId, config.productCode, true);
            document.getElementById(config.displaySection).innerText = maxApy;
            if(config.isMaxRate) {
              var target = getUpToTermTarget(document.getElementById(config.displaySection));
              if (typeof bankRates == "string") {
                getHighestMonthUpTo(JSON.parse(bankRates), target, (target.closest(".fullwidth-hero")) ? "hero" : "upTo");
              } else {
                getHighestMonthUpTo(bankRates, target, (target.closest(".fullwidth-hero")) ? "hero" : "upTo");
              }
            }
            config.rendered = true;
        } else {
        }
      }
    );
  }
  let children = newNode.childNodes;
  children.forEach(cn => {
    checkIfRateNode(cn);
  })
}

// Create an observer instance linked to the callback function
const rateObserver = new MutationObserver(rateObserverCallback);
// Test the nodes already loaded
checkIfRateNode(document.body);
// Start observing the target node for configured mutations
rateObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
var bankRates;
var cmsDataStored = false;
var ratesValidated = false;
function getRatesForObserver(callback) {
    if (!isUISCodeAvailable && fetchUISCodeStatus) {
      // UIS Code has changed or is not present
      const displayRateCards = isScriptAvailable();
      if (displayRateCards) {
        // TODO if an API call is already outstanding, wait for it instead
        getBankRates(cmsResponseData["rate_type"])
          .then(data => {
            if (data) {
              bankRates = data;
              // console.log(bankRates);
              // console.log(typeof bankRates);
              setLocalWithExpiry("bankRateObj", JSON.stringify(data), 2);
              populateComponents();
              callback(true);
            } else {
              removeUISCodeSection();
            }
          })
          .catch(error => {
            removeUISCodeSection();
            console.log(error);
          })
      }
    } else {
        // UIS Code matches local storage; retrieve local storage rates
        // Append the UIS code to all links
        // document.addEventListener("DOMContentLoaded", attachLinkEvent(cmsResponseData["uiscode"]));

        const displayRateCards = isScriptAvailable();
        if (displayRateCards) {
          const bankRateObj = localStorage.getItem("bankRateObj");
          const now = new Date().getTime();
          const parsedData = JSON.parse(bankRateObj);

          if (parsedData && now <= parsedData.expiry) {
            rateConfigComponents.forEach((config, index) => {
              bankRates = parsedData.value;
              // console.log(bankRates);
              // console.log(typeof bankRates);
              //Extract Specific Product 
              if (document.getElementById(config.displaySection)) {
                const maxApy = getProductDetails(bankRates, config.productId, config.productCode, true);
                document.getElementById(config.displaySection).innerText = maxApy;
                if(config.isMaxRate) {
                  var target = getUpToTermTarget(document.getElementById(config.displaySection));
                  getHighestMonthUpTo(JSON.parse(bankRates), target, (target.closest(".fullwidth-hero")) ? "hero" : "upTo");
                }
                config.rendered = true;
              } else {
              }
            });
            callback(true);
          }
          else {
            if (getRateType() !== "NOT VALIDATED") {
            uiscode = getUISCode();
            rateType = getRateType();
            getBankRates(rateType)
              .then(data => {
                if (data) {
                    bankRates = data;
                    // console.log(bankRates);
                    // console.log(typeof bankRates);
                    setLocalWithExpiry("bankRateObj", JSON.stringify(data), 2);
                  rateConfigComponents.forEach((config, index) => {
                    //Extract Specific Product 
                    const maxApy = getProductDetails(data, config.productId, config.productCode, false);
                    document.getElementById(config.displaySection).innerText = maxApy;
                    if(config.isMaxRate) {
                      // rate-tile-heading 
                      var target = getUpToTermTarget(document.getElementById(config.displaySection));
                      // if eyebrow exists, send that, otherwise use this ID
                      if (typeof bankRates == "object") {
                        getHighestMonthUpTo(bankRates, target, (target.closest(".fullwidth-hero")) ? "hero" : "upTo");
                      } else {
                        getHighestMonthUpTo(JSON.parse(bankRates), target, (target.closest(".fullwidth-hero")) ? "hero" : "upTo");
                      }
                    }
                  });

                  setLocalWithExpiry("bankRateObj", JSON.stringify(data), 2);
                  storeCMSData(uiscode, rateType, 2);
                  callback(true);
                } else {
                  removeUISCodeSection();
                }
              })
              .catch(error => {
                removeUISCodeSection();
                console.log(error);
              })
          } else {
          }}
        }
      } 
    // else {
    //     callback(validated);
    //   } 
    }
  // }
// }

function getUpToTermTarget(htmlNode) {
  return htmlNode?.closest(".rate-tile,.feature-tile")?.querySelector(".rate-tile-eyebrow") ?? htmlNode?.closest(".rate-tile,.feature-tile")?.querySelector(".rate-tile-heading") ?? document.getElementById("highestMonthForUpToCD");
}

function getHighestMonthUpTo(data, monthId, where) {
  var termArray = [];
  //we have data.products or data.terms
  if (!data || !monthId) {
      return false;
  }
  var maxApy = 0;

  var cdProduct = data.products.find(prod => prod.displayCode === "CD");
  if (cdProduct) {
      maxApy = cdProduct.maxAPY;
      //get the product's terms array
      var cdTermsIndexArray = cdProduct.terms;
      //loop through the CD terms array and call getMonth function to see if any of the rateMatrices apy values === maxRate, if so, it will return the month
      for (const termIndex of cdTermsIndexArray) {
          //find the term in cdTermsIndexArray, then get the rateMatrices array and check if the highest apy matches the maxApy
          var productTerm = data.terms.find(theTerm => parseInt(theTerm.id) - 1 === parseInt(termIndex));
          if (productTerm && termsArray.includes(parseInt(productTerm.productId))) {
              var rateMatrixArray = productTerm.rateMatrices;
              for (const rateMatrix of rateMatrixArray) {
                  if (rateMatrix.apy === maxApy) {
                      termArray.push(productTerm.term);
                  }
              }
          }
      }
  }
  //test for multiple terms:
  // termArray.push(64);
  // termArray.push(66);
  // termArray.push(77);
  termArray = [...new Set(termArray)];
  if (termArray.length > 0) {
      var termsStr = "";
      var termsUpToStr = "";
      var termsUpToNoCDStr = "";
      for (let i = 0; i < termArray.length; i++) {
          termsStr += termArray[i];
          termsUpToStr += termArray[i];
          termsUpToNoCDStr += termArray[i];
          // Add a comma unless it's the last element - configure the wording  For 2 terms: 9-month CD and a 12-month CD
          //For more than 2: 9-month CD, 10-month CD and a 12-month CD.
          if (termArray.length===2){
              if (i < termArray.length - 1) {
                  termsStr += "&#8209;month CD and a ";
                  termsUpToStr+= "&#8209;month or ";
                  termsUpToNoCDStr+= " months or ";
              }else{
                  termsStr += "&#8209;month CD";
                  termsUpToStr+= "&#8209;month";
                  termsUpToNoCDStr+= " months";
              }
          }else{
              if (i < termArray.length - 1) {
                  if (i < termArray.length - 2) {
                      termsStr += "&#8209;month CD, a ";
                      termsUpToStr += "&#8209;month, ";
                      termsUpToNoCDStr+= " months, ";
                  }else{
                      termsStr += "&#8209;month CD, and a ";
                      termsUpToStr += "&#8209;month, or ";
                      termsUpToNoCDStr+= " months, or ";
                  }
              }else{
                  termsStr += "&#8209;month CD";
                  termsUpToStr += "&#8209;month";
                  termsUpToNoCDStr+= " months";
              }
          }   
      }
      switch (where) {
        case "disclosure": 
          monthId.innerHTML = termsStr;
          break;
          case "upTo": 
          monthId.innerHTML = termsUpToStr;
          break;
          case "hero":
          monthId.innerHTML = termsUpToNoCDStr;
          break;
      }
      return true;
  } else {
      return false;
  }
}