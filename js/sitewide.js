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
  })();

  // Universal Sign In handler - routes all sign in buttons/links directly to http://localhost:3000/login
  (function() {
    var LOGIN_URL = "http://localhost:3000/login";

    function isSignInTarget(el) {
      if (!el) return false;
      var target = el.closest('a, button, [data-open-login]');
      if (!target) return false;

      if (target.id === 'login-button' || target.classList.contains('login-button') || target.classList.contains('login-account-btn')) {
        return true;
      }

      var href = (target.getAttribute('href') || '').toLowerCase();
      if (href.includes('securelogin.synchronybank.com') ||
          href.includes('consumercenter.mysynchrony.com') ||
          href.includes('businesscenter.synchronybusiness.com') ||
          href.includes('carecreditprovidercenter.com') ||
          href.includes('mastercard.syf.com/accounts/login') ||
          href.includes('synchrony.com/accounts/?client=paysol') ||
          href.includes('synchrony.com/quickaccess')) {
        return true;
      }

      var reason = (target.getAttribute('data-reason') || '').toLowerCase();
      if (reason.includes('sign in') || reason.includes('signin') || reason.includes('login') || reason.includes('sign-in')) {
        return true;
      }

      var txt = (target.innerText || target.textContent || '').trim().toLowerCase();
      if (txt === 'sign in' || txt === 'sign in ›' || txt === 'sign in >' || txt === 'sign in →' ||
          txt.startsWith('sign in to') || txt.includes('existing provider sign in') ||
          txt === 'customer sign in' || txt === 'business and provider sign in') {
        return true;
      }

      return false;
    }

    function updateSignInHrefs() {
      document.querySelectorAll('a, button').forEach(function(el) {
        if (isSignInTarget(el)) {
          if (el.tagName.toLowerCase() === 'a') {
            el.href = LOGIN_URL;
            el.removeAttribute('target');
          }
        }
      });
    }

    function isCareCreditTarget(el) {
      if (!el) return false;
      var target = el.closest('a, [data-reason], [id="carecredit"]');
      if (!target) return false;
      if (isSignInTarget(target)) return false; // Sign in has precedence

      if (target.id === 'carecredit') return true;

      var href = (target.getAttribute('href') || '').toLowerCase();
      if (href.includes('carecredit.com') || href === 'carecredit.html' || href.endsWith('/carecredit.html') || href.endsWith('/carecredit/index.html')) {
        return true;
      }

      var reason = (target.getAttribute('data-reason') || '').toLowerCase();
      if (reason.includes('carecredit') || reason.includes('care credit') || reason.includes('credit care') || reason.includes('credit-care') || reason.includes('care-credit')) {
        return true;
      }

      var txt = (target.innerText || target.textContent || '').trim().toLowerCase();
      if (txt === 'carecredit' || txt === 'care credit' || txt === 'credit care' || txt === 'explore carecredit') {
        return true;
      }

      return false;
    }

    function getCareCreditUrl() {
      var path = window.location.pathname;
      if (path.includes('/banking/') || path.includes('/business/') || path.includes('/pages/')) {
        return '../carecredit.html';
      }
      return 'carecredit.html';
    }

    function updateCareCreditHrefs() {
      var ccUrl = getCareCreditUrl();
      document.querySelectorAll('a').forEach(function(el) {
        if (isCareCreditTarget(el) && !isSignInTarget(el)) {
          el.href = ccUrl;
          el.removeAttribute('target');
        }
      });
    }

    function isShopNowTarget(el) {
      if (!el) return false;
      var target = el.closest('a, button');
      if (!target) return false;
      var txt = (target.innerText || target.textContent || '').trim().toLowerCase();
      if (txt === 'shop now' || txt === 'shop savings' || txt.includes('shop $199 deals')) {
        return true;
      }
      var reason = (target.getAttribute('data-reason') || '').toLowerCase();
      if (reason.includes('shop now') || reason.includes('shop savings')) {
        return true;
      }
      return false;
    }

    function isPrequalifyTarget(el) {
      if (!el) return false;
      var target = el.closest('a, button');
      if (!target) return false;
      var txt = (target.innerText || target.textContent || '').trim().toLowerCase();
      if (txt === 'see if you prequalify' || txt === 'see if i prequalify' || txt === 'see if you qualify' || txt === 'see if i qualify' || txt === 'apply now') {
        return true;
      }
      var reason = (target.getAttribute('data-reason') || '').toLowerCase();
      if (reason.includes('see if you prequalify') || reason.includes('see if i prequalify') || reason.includes('see if you qualify') || reason.includes('apply now')) {
        return true;
      }
      return false;
    }

    function isExploreOffersTarget(el) {
      if (!el) return false;
      var target = el.closest('a, button');
      if (!target) return false;
      var txt = (target.innerText || target.textContent || '').trim().toLowerCase();
      if (txt === 'explore offers') {
        return true;
      }
      var reason = (target.getAttribute('data-reason') || '').toLowerCase();
      if (reason.includes('explore offers')) {
        return true;
      }
      return false;
    }

    function getRelativeUrl(filename) {
      var path = window.location.pathname;
      if (path.includes('/banking/') || path.includes('/business/') || path.includes('/pages/')) {
        return '../' + filename;
      }
      return filename;
    }

    // Capture phase listener to prevent popups/dropdowns and directly navigate
    document.addEventListener('click', function(e) {
      if (isSignInTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = LOGIN_URL;
        return;
      }

      if (isCareCreditTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = getCareCreditUrl();
        return;
      }

      if (isExploreOffersTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = getRelativeUrl('Mainindex.html');
        return;
      }

      if (isShopNowTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = getRelativeUrl('jpluxury.html');
        return;
      }

      if (isPrequalifyTarget(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = getRelativeUrl('prequalify.html');
        return;
      }
    }, true);

    function runAllUpdates() {
      updateSignInHrefs();
      updateCareCreditHrefs();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runAllUpdates);
    } else {
      runAllUpdates();
    }
    setTimeout(runAllUpdates, 300);
    setTimeout(runAllUpdates, 1000);
    setTimeout(runAllUpdates, 3000);
  })();