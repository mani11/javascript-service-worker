if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("serviceworker.js");
    console.log("Service worker registered")
    navigator.serviceWorker.addEventListener("message", event => {
        switch (event.data.action) {
            case "resources-updated":
                alert("Resources are updated");
                break;
        }
    })
}

function sendMessageToSW(message) {
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
    }
    else {
        console.log("There is no service worker controlling the page");
    }
}

function update() {
    sendMessageToSW({
        action: "update-resources"
    })
}