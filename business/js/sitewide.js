/* cross domain popup start */
$(document).on('click', 'a' ,function(e){
if (!($(this).hasClass('internal-partner-website')) && (typeof urlsJson != 'undefined' && urlsJson.urls != null && typeof msg != 'undefined' && msg != null && msg.trim() != "null" && msg.trim() != "")) {
		var localUrl =0;
		var hreLink = $(this).attr("href");  
		if(hreLink != null && typeof hreLink != 'undefined' && hreLink.trim() != ""){
			if(hreLink.indexOf('http')>-1){
				urlsJson.urls.filter(function(urls){
				return hreLink.indexOf(urls) > -1 ? localUrl++ : null
				});
				if(localUrl==0){
					if(window.confirm(msg)){
					 return 1
					}
					else{
						return !1
						//e.cancelBubble = true;
					}
				}      
			}
		}
	}

});
 /* cross domain popup end */
var MySYFSitewide = (function () {
    var outExt = {};
    function initEmergAlert() {
      var out = {};
      var last_known_scroll_position = 50;
      var smartBanner = document.querySelector("#smartbanner");
      var navEl1 = document.querySelector('.utility-bar');
      var navEl2 = document.querySelector(".global-nav");
      var loginDropdown = document.querySelector(".login-dropdown");
      var bannerHeight = (smartBanner ? smartBanner.getBoundingClientRect().height : 0);
      var navHeight = ((smartBanner && navEl1) ? navEl1.getBoundingClientRect().height : 0);
      var headerHeight = (navEl2 ? navEl2.getBoundingClientRect().height : 0);
      var ticking = false;
      function bindEmergencyActions() {
        function getBannerHeight() {
          bannerHeight = (smartBanner ? smartBanner.getBoundingClientRect().height : 0);
          navHeight = ((smartBanner && navEl1) ? navEl1.getBoundingClientRect().height : 0);
          headerHeight = (navEl2 ? navEl2.getBoundingClientRect().height : 0);
        }
        function resizeOrientationEvent() {
          getBannerHeight();
          if ((window.scrollY > 0)) {
            if(navEl1){
              navEl1.style.marginTop = 0;
            }
            if(navEl2){
				navEl2.style.marginTop = 0;
			}
            if(loginDropdown){
              loginDropdown.style.marginTop = 0;
            }
          }
          else {
            // navEl1.style.marginTop = 1 * bannerHeight + "px";
            // navEl2.style.marginTop = 1 * navHeight + "px";
            // loginDropdown.style.marginTop = 1 * bannerHeight + "px";
            if (window.innerWidth > 1080) {
              if(navEl1){
                navEl1.style.marginTop = 0;
              }
			  if(navEl2){
				navEl2.style.marginTop = 0;
			  }
              if(loginDropdown){
                loginDropdown? loginDropdown.style.marginTop = 0:null;
              }
            }
  
          }
        }
        function alertChange(scroll_pos) {
          getBannerHeight();
          if (!(window.scrollY > 0)) {
            // navEl1.setAttribute('style', "margin-top:" + (1 * bannerHeight) + "px");
            // navEl2.setAttribute('style', "margin-top:" + (1 * navHeight) + "px");
            // loginDropdown.setAttribute('style', "margin-top:" + (1 * bannerHeight) + "px");
            if (window.innerWidth > 1080) {
              if(navEl1){
                navEl1.style.marginTop = 0;
              }
			  if(navEl2){
				navEl2.style.marginTop = 0;
			  }
              if(loginDropdown){
                loginDropdown.style.marginTop = 0;
              }
            }
  
          } else {
            if(navEl1){
              navEl1.style.marginTop = 0;
            }
			if(navEl2){
				navEl2.style.marginTop = 0;
			}
            if(loginDropdown){
              loginDropdown.style.marginTop = 0;
            }
            if (window.innerWidth > 1024) {
              if(navEl1){
                navEl1.style.marginTop = 0;
              }
			  if(navEl2){
				navEl2.style.marginTop = 0;
			  }
              if(loginDropdown){
                loginDropdown.style.marginTop = 0;
              }
            }
          }
  
        }
  
        out.getBannerHeight = getBannerHeight;
        out.resizeOrientationEvent = resizeOrientationEvent;
        out.alertChange = alertChange;
      }
      bindEmergencyActions();
      window.addEventListener('scroll', function (e) {
        last_known_scroll_position = window.scrollY;
        if (!ticking) {
          window.requestAnimationFrame(function () {
            out.alertChange(last_known_scroll_position);
            ticking = false;
          });
  
          ticking = true;
        }
      });
      return out;
    }
    window.addEventListener('load', function (event) {
      var alertController = initEmergAlert();
      alertController.resizeOrientationEvent();
      $(window).resize(function () {
        alertController.resizeOrientationEvent();
      });
      if(document.querySelector("#smartbanner")){
        document.querySelector(".sb-close").addEventListener('click', function (event) {
          alertController.resizeOrientationEvent();
        });
      }
    
    });
  })();
  
  