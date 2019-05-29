if('serviceWorker' in navigator){
    navigator.serviceWorker.register("serviceworker.js");
    console.log("Service worker registered")
}