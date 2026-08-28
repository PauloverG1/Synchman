function featuredDeals(){
  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });
  const currentDate = new Date();
  let getUrl = generateRequestParams("featured-deals");
  let isHolidayOffer = false;
  let holidayOfferKeyword;
  const isDYCall = getUrl.toLowerCase().indexOf("campaignmappingid=all") == -1 ? true : false;
  let cardHolderMatch =  getCookie("audienceList") != undefined ? JSON.parse(getCookie("audienceList")) : null;

  if(_SFDDL.pageInfo.PageFunction == "marketplace" && _SFDDL.pageInfo.PageName == "landingpage" && cardHolderMatch != null && cardHolderMatch.length > 0) {
    let brands = ""
    cardHolderMatch.forEach ((ele) => {
      if(ele.brand != undefined && ele.brand != null && ele.brand.length > 0) {
        brands += ele.brand + ",";
      }
    })
    if(brands.length > 0) {
      brands = brands.slice(0,brands.length-1);
      getUrl += "&brand=" + encodeURIComponent(brands);
    } 
  } else if(_SFDDL.pageInfo.PageFunction == "marketplace" && _SFDDL.pageInfo.PageName == "landingpage" &&  cardHolderMatch != null && cardHolderMatch.length == 0) {
    //Sending empty brand value when cookie avialable and no brands matched
    getUrl += "&brand=";
  } else if(_SFDDL.pageInfo.PageFunction == "marketplace" && _SFDDL.pageInfo.PageName == "landingpage" && cardHolderMatch == null) {
    //Not sending brand when no cookie
    getUrl += "&brand=NA";
  }
  
  function sortOffers(array) {
    array.sort((a, b) => {
      const aDate = (_SFDDL.pageInfo.PageFunction == "marketplace-deals" || _SFDDL.pageInfo.PageFunction == "health-wellness-offers") && (a.endDate.length > 0 || a.startDate.length > 0) ? new Date(a.endDate) : new Date(a.startDate);
      const bDate = (_SFDDL.pageInfo.PageFunction == "marketplace-deals" ||_SFDDL.pageInfo.PageFunction == "health-wellness-offers") && (b.endDate.length > 0 || b.startDate.length > 0) ? new Date(b.endDate) : new Date(b.startDate);
      const diffA = aDate.getTime() - currentDate.getTime();
      const diffB = bDate.getTime() - currentDate.getTime();
      return (_SFDDL.pageInfo.PageFunction == "marketplace-deals" ||_SFDDL.pageInfo.PageFunction == "health-wellness-offers") ? (diffA - diffB) : (diffB - diffA);
    });
  }

  function aboutHolidayOffer(divId) {
    const config = document.querySelectorAll('*[data-id="configs"]');
    Array.from(config).forEach((x) => {
      const mappingObj = JSON.parse(x.innerText);
      if (mappingObj.sectionId == divId) {
        for (const key in mappingObj) {
          if (
            key &&
            key == "keyword" &&
            mappingObj[key] != null
          ) {
            holidayOfferKeyword =  mappingObj[key];
            isHolidayOffer = true;
            break;
          }
      }
    }
    });
  }

  function getAPIData() {
    aboutHolidayOffer("featured-deals");
    postData("offersdata", getUrl, isDYCall)
    .then((data) => {
      if (!isDYCall) {
		  if(data.offers.length === 0){
			hideTheSectionByClass("featured-deals");
		  } else if(isHolidayOffer) {
			const featuredDeals = data.offers.filter(x => x.keywords.includes(holidayOfferKeyword));
			data.offers = featuredDeals.length > 6 ? featuredDeals.slice(0, 6) : featuredDeals;
      } else {
			let top4_data = data.offers;
			let final_data = [];
			var featuredDeals = top4_data.filter(offer => offer.brand.featured);
      if(_SFDDL.pageInfo.PageFunction == "health-wellness-offers" && _SFDDL.pageInfo.PageName == "landingpage"){
         var health_healthness_featuredDeals=["Aspen Dental","Clear Choice","Thrive" ,"Banfield" ,"VCA" ,"NVA GP (Happy & Health Pets)","Bosley","Sono Bello","LensCrafters","Walgreens","Walmart","GoodFeet","Albertsons","Sleep Number","Pets Best","PetPlace","Pumpkin"];
        featuredDeals= featuredDeals.filter(item => health_healthness_featuredDeals.includes(item.brand.name) );
      }
			sortOffers(featuredDeals);
			final_data = [...featuredDeals];
			if (final_data.length < 4) {
			  const nonFeaturedDeals = top4_data.filter(offer => !offer.brand.featured);
			  sortOffers(nonFeaturedDeals);
			  for (let i = 0; i < 4 - (featuredDeals.length) && i < nonFeaturedDeals.length; i++) {
				final_data.push(nonFeaturedDeals[i]);
			  }
			}
			data.offers = final_data.length > 4 ? final_data.slice(0, 4) : final_data;
		}
      }

      if((_SFDDL.pageInfo.PageFunction == "marketplace" || _SFDDL.pageInfo.PageFunction == "home") && _SFDDL.pageInfo.PageName == "landingpage") {
        generateTemplate("featuredDealTemplate", "featuredDealplaceholder", data);
        generateTemplate("featuredDealmodalTemplate", "featuredDealmodalplaceholder", data);
        modalInit();
      } else if(_SFDDL.pageInfo.PageFunction == "marketplace-deals" || _SFDDL.pageInfo.PageFunction == "health-wellness-offers" || _SFDDL.pageInfo.PageFunction == "marketplace-brands") {
        generateTemplateOffer("dealOfferTemplate", "featuredDealplaceholder", data, "featured-deals");
        modalReInitalize();
      } else {
        generateTemplate("offerTemplate", "featuredDealplaceholder", data);
        modalReInitalize();
      }
     
      if ((_SFDDL.pageInfo.PageFunction == "marketplace-brands" && _SFDDL.pageInfo.PageKind == "marketplace") ||
        (_SFDDL.pageInfo.PageName == "landingpage" && _SFDDL.pageInfo.PageKind == "home")) {
        triggerSYDDLEvent(data.offers, "body-featured-deals", true);
      } else if(_SFDDL.pageInfo.PageFunction == "health-wellness-offers"){
        triggerSYDDLEvent(data.offers, "body-featured-HealthAndWellness", true);
      } else if(isHolidayOffer){
        triggerSYDDLEvent(data.offers, "body-featured-deals-"+holidayOfferKeyword, false);
      } else {
        analyticTrigger = true;
        triggerSYDDLEvent(data.offers, "body-featured-deals", analyticTrigger && lastSectionAnalyticsTriggerd);
      }
      var dealLink = document.getElementById("deals-link");
      var featureLink = document.getElementById("feature-link");
      var financingLink = document.getElementById("financing-link");
      if (dealLink) {
        dealLink.addEventListener("click", setQueryParam(dealLink, "Deals"));
      }
      if (featureLink && dealLink) {
        featureLink.addEventListener("click", setQueryParam(featureLink, "Deals"));
      } else if (financingLink) {
        financingLink.addEventListener("click", setQueryParam(financingLink, "Financing Offers"));
      }
      function setQueryParam(link, queryParam) {
        var href = link.href;
        const url = `${href}?type=${encodeURIComponent(queryParam)}`;
        link.setAttribute("href", url);
      }
    })
    .catch((error) => {
      hideTheSectionByClass("featured-deals");
    });
  }

  if (!isDYCall || (userId && userId.length > 0 && sessionId && sessionId.length > 0)) {
    getAPIData();
  } else if(DY.dyid && DY.jsession) {
    getAPIData();
  } else if(isDYCall) {
   
    // setTimeout(() => {
      getAPIData();
    // },1000)
  } else {
    //Hide the section if the call to API doesn't happen
    hideTheSectionByClass("featured-deals");
  }
}

const delay = setInterval(() => {
 if(getCookie("audienceList") != undefined) {
  // console.log("List received.");
  featuredDeals();
  clearInterval(delay);
 }
},500);

setTimeout(() => {
  if(getCookie("audienceList") == undefined) {
    // console.log("List not received within 2 seconds");
    featuredDeals();
  }
  clearInterval(delay)
},2000);
