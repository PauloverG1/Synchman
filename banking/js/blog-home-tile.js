(function () {

    if(window.savingBudgeting!==undefined){
    generateTemplate("savingBudgetingTemplate", "savingBudgetingPlaceholder", savingBudgeting);
    }
    if(window.spendingCredit!== undefined){
        
    generateTemplate("spendingCreditTemplate", "spendingCreditPlaceholder", spendingCredit);
    }
    if(window.lifeHome!== undefined){
    generateTemplate("lifeHomeTemplate", "lifeHomePlaceholder", lifeHome);
    }

    const hostname = window.location.hostname
    const blogTiles=document.querySelectorAll(".blog-tile")
    if(hostname === "www.synchrony.com" || hostname === "qwww.synchrony.com"){
        blogTiles.forEach((tile) => {
           let url= tile.getAttribute("href");
           url=url.replace("/sites/syc","");
           tile.setAttribute("href",url)
          });
    }
})();