const titleTag = document.getElementsByName("title")[0];
const bodyTag = document.getElementsByName("body")[0];
const sendBtn = document.getElementsByName("send")[0];

sendBtn.addEventListener("click", async () => {
    if (window.Notification) {
        if (Notification.permission !== "granted") {
            await Notification.requestPermission();
        }
        if (Notification.permission === "granted") {
            const notification = new Notification(titleTag.value, {
                body: bodyTag.value,
            });
        }
    } else {
        alert("This browser doesn't support notification.");
    }
});
