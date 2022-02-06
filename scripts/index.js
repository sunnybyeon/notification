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
        navigator.serviceWorker.register("/sw.js");
    } catch (err) {
        alert("Service worker registration error.");
    }
} else {
    alert("Service workers are not supported.");
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
