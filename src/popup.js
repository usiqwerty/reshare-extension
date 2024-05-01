const checkbox = document.getElementById("autoclicker_check");

chrome.runtime.sendMessage({type: "get-ac-status"}, (r => checkbox.checked = r));

checkbox.addEventListener("change", () => {
    chrome.runtime.sendMessage({type: "set-ac-status", data: checkbox.checked});
    chrome.storage.local.set({autoclicker: checkbox.checked});
});
