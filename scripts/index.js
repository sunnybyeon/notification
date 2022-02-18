// get baseURL (path to index.html)
const baseURL = (() => {
    if (location.pathname.slice(-10) === "index.html") {
        return location.pathname.slice(0, -11);
    } else if (location.pathname.slice(-1) === "/") {
        return location.pathname.slice(0, -1);
    } else {
        return location.pathname;
    }
})();

async function requestNotificationPermission() {
    if (window.Notification && Notification.permission !== "granted") {
        await Notification.requestPermission();
    }
    if (!window.Notification) {
        alert("This browser doesn't support notifications.");
    }
}

requestNotificationPermission();

if (navigator.serviceWorker) {
    try {
        navigator.serviceWorker.register(`${baseURL}/sw.js`);
    } catch (err) {
        alert("Service worker registration error.");
    }
} else {
    if (location.protocol === "http:") {
        const changeHttps = confirm(
            "Service workers are not supported. Using HTTP connection might be the reason.\nWould you like to change to HTTPS connection?"
        );
        if (changeHttps) {
            const url = new URL(location.href);
            url.protocol = "https:";
            location.replace(url.toString());
        }
    } else {
        alert("Service workers are not supported.");
    }
}

document.getElementsByName("send")[0].addEventListener("click", async () => {
    if (window.Notification) {
        if (Notification.permission === "granted") {
            const titleTag = document.getElementsByName("title")[0];
            const bodyTag = document.getElementsByName("body")[0];

            const registration = await navigator.serviceWorker.ready;

            registration.showNotification(titleTag.value, {
                body: bodyTag.value,
            });
        } else if (Notification.permission === "denied") {
            const request = confirm(
                "The permission to display notifications is denied.\nWould you like to allow to display notifications?"
            );
            if (request) requestNotificationPermission();
        } else {
            requestNotificationPermission();
        }
    } else {
        alert("This browser doesn't support notifications.");
    }
});
