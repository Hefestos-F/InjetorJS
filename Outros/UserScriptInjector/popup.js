document.getElementById("saveBtn").addEventListener("click", () => {
  const site = document.getElementById("siteInput").value.trim();
  if (site) {
    /*site.placeholder = site;
    site.value = '';*/
    chrome.storage.local.set({ destino: site }, () => {
      alert("Site destino salvo: " + site);
    });
  }
});
