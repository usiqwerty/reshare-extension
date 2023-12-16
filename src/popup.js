const checkbox = document.getElementById("autoclicker_check");

chrome.storage.sync.get('autoclicker', function(data) {
    console.log('DATA', data);
    if (data){
        checkbox.checked = data.autoclicker;
    }
});

checkbox.addEventListener("change", ()=>{
    chrome.runtime.sendMessage({type:"set-autoclicker", data:checkbox.checked});
    //chrome.storage.sync.set({ autoclicker: checkbox.checked });
})

