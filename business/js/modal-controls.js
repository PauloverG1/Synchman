(function () {
  "use strict";

  MicroModal.init({
    onShow: function () {
       if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) { 
        document.body.classList.add("iOS-stop-body-scroll")
      } else {
        document.body.style.overflow = "hidden";
        
      }
          },
    onClose: function (modal) {
		  let youtubeEmbed = document.getElementById("video-player");
 
      function stopPlayer() {
        youtubeEmbed.contentWindow.postMessage(
          '{"event":"command", "func":"stopVideo", "args":""}',
          "https://www.youtube-nocookie.com"
        );
      }
 
      // to stop the video
      function stopVideo(element) {
        // getting every iframe from the body
        var iframes = element.querySelectorAll("iframe");
        // reinitializing the values of the src attribute of every iframe to stop the YouTube video.
        for (let i = 0; i < iframes.length; i++) {
          if (iframes[i] !== null) {
            var temp = iframes[i].src;
			if(temp && temp!=null && temp.includes("youtube")){ // there are other iframes on the page other than YT which doesn't have src like zendesk, analytics beacons etc. The zendesk chat is breaking because of this src=null reassignment
            iframes[i].src = temp;
			}
          }
        }
      }
      if (youtubeEmbed) {
        let bodyEl = document.body;
        stopVideo(bodyEl);
      }
      // reset scroll of modal__container to top
      if (modal.querySelector(".modal__container")) {
        modal.querySelector(".modal__container").scrollTop = 0;
      }

      if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) { 
        document.body.classList.remove("iOS-stop-body-scroll")
      } else {
        document.body.style.overflow = "auto";
        
      }    }
  });
})();
