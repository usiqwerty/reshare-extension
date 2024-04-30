import QuizService from "./quiz/QuizService";
import QuizAgent from "./quiz/QuizAgent";

new QuizService().init(null);
new QuizAgent().init();

let ac = false;

chrome.storage.sync.get('autoclicker', function(data) {
    console.log('DATA', data);
    if (data){
        ac = data.autoclicker;
    }
});
chrome.runtime.onMessage.addListener(req => { //browser
    if (req?.type !== "autoclicker-status")
        return;

    chrome.storage.sync.get('autoclicker', function(data) {
        if (data){
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                console.log(tabs);
                chrome.tabs.sendMessage(tabs[0].id, {type:"status-set-autoclicker", data: data.autoclicker});
            });
        }
    });
});
chrome.runtime.onMessage.addListener(req => { //browser
    if (req?.type !== "set-autoclicker")
        return;
    ac = req.data;
    //chrome.runtime.sendMessage({type:"fwd-set-autoclicker", data: ac})
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        console.log(tabs);
        chrome.tabs.sendMessage(tabs[0].id, {type:"fwd-set-autoclicker", data: ac});
    });
    chrome.storage.sync.set({ autoclicker: ac });
    console.log("backgorund ac status:", ac);
});


