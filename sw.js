self.addEventListener("notificationclick", (ev) => {
    ev.notification.close();
    const swScopeUrl = new URL(self.registration.scope);
    const baseUrl = swScopeUrl.pathname;
    let editUrl = `${baseUrl}?title=${encodeURI(
        ev.notification.title
    )}&body=${encodeURI(ev.notification.body)}`;
    if (ev.notification.icon) {
        const iconURL = ev.notification.icon;
        const iconName = iconURL.split("/").pop().slice(0, -4);
        editUrl += `&icon=${encodeURI(iconName)}`;
    }
    self.clients.openWindow(editUrl);
});
