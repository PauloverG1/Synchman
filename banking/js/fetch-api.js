async function postData(apiData = "", requestParam, dydata) {
  let url = "";
  let retries = 3;
  let delay = 1000;

  if ((apiData == "offersdata" || apiData == "kevelData") && requestParam != undefined && requestParam != null && requestParam.trim().length > 0) {
    if (requestParam.includes("/metadata")) {
      url = apiURL + requestParam;
    } else {
      if(!requestParam.includes("campaignMappingId=all")){
        url = apiURL + requestParam + "&cookieConsent=" + dyFlag;
      } else {
        url = apiURL + requestParam;
      }
      
      if (window.location.href.includes("dyApiPreview") && url.indexOf("pageType") == -1 && url.indexOf("pageValue") == -1) {
        url = url + "&pageType=PREVIEW&pageValue=" + extractToken(window.location.href);
      }
      if (dydata || requestParam.toLowerCase().indexOf("campaignmappingid=all") == -1) {
        if (userId && userId.length > 0 && sessionId && sessionId.length > 0) {
          url = url + "&userId=" + userId + "&sessionId=" + sessionId;
        } else if (DY.dyid && DY.jsession && DY.dyid.length > 0 && DY.jsession.length > 0) {
          url = url + "&userId=" + DY.dyid + "&sessionId=" + DY.jsession;
        } else {
          await delayTask(delay);
          if (DY.dyid && DY.jsession && DY.dyid.length > 0 && DY.jsession.length > 0) {
            url = url + "&userId=" + DY.dyid + "&sessionId=" + DY.jsession;
          } else {
            url = url + "&userId=&sessionId=";
          }
        }
      }
    }
  } else if (apiData == "cmsdata") {
    url = "/sites/Satellite?pagename=" + requestParam;
  }
  var myHeaders = new Headers();
  myHeaders.append("X-SYF-API-KEY", apiKey);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  if (apiData == "cmsdata") {
    const response = await fetchWithTimeout(url);
    if (response.ok) {
      return response.json();
    }
    throw new Error("CMS Request Failed");
  } else if(requestParam != undefined && requestParam != null && requestParam.trim().length > 0) {
    const response = await fetchWithTimeout(url, requestOptions);
    if (response.ok) {
      return response.json();
    }
    throw new Error("API Request Failed");
  }

  async function fetchWithTimeout(resource, options = {}) {
    for (let attempt = 1; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(resource, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(id);
        return response;
      } catch (error) {
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
  }

  function extractToken(currentUrl) {
    let start = currentUrl.indexOf("dyApiPreview");
    let [name, token] = currentUrl.substring(start).split("=");
    return token;
  }
}

function delayTask(delayTime) {
  return new Promise((resolve) => setTimeout(resolve, delayTime));
}
