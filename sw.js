self.addEventListener("notificationclick", (ev) => {
    ev.notification.close();
    let url = `/?title=${encodeURI(ev.notification.title)}&body=${encodeURI(
        ev.notification.body
    )}`;
    if (ev.notification.icon) {
        const iconURL = ev.notification.icon;
        const iconName = iconURL.split("/").pop().slice(0, -4);
        url += `&icon=${encodeURI(iconName)}`;
    }
    self.clients.openWindow(url);
});
