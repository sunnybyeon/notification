import { icons } from "./bootstrap-icons/icons.js";
import { searchIcon } from "./bootstrap-icons/search.js";

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

const iconSearchDiv = document.getElementById("icon-search");
const iconList = document.getElementsByClassName("icon-list")[0];
const showIconBtn = document
    .getElementsByName("show-icons")[0]
    .getElementsByTagName("i")[0];

function showIconList() {
    iconList.style.display = "flex";
    showIconBtn.classList.replace("bi-caret-down-fill", "bi-caret-up-fill");
}
function hideIconList() {
    showIconBtn.classList.replace("bi-caret-up-fill", "bi-caret-down-fill");
    iconList.style.display = "none";
}

function addIconToIconList(iconName) {
    const icon = document.createElement("i");
    icon.classList.add(`bi-${iconName}`);
    icon.addEventListener("click", () => {
        iconSearchDiv.replaceChildren();
        const insertedIcon = iconSearchDiv.insertAdjacentElement(
            "beforeend",
            icon
        );
        // div 안 커서(caret)이 아이콘 뒤에 보이게 하기 위하여
        const nbsp = document.createTextNode("\u00A0");
        insertedIcon.appendChild(nbsp);
        hideIconList();
    });
    iconList.insertAdjacentElement("beforeend", icon);
    return icon;
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

for (const icon of icons) {
    addIconToIconList(icon.name);
}

document.getElementsByName("send")[0].addEventListener("click", async () => {
    if (window.Notification) {
        if (Notification.permission === "granted") {
            const titleTag = document.getElementsByName("title")[0];
            const bodyTag = document.getElementsByName("body")[0];

            const registration = await navigator.serviceWorker.ready;

            const options = {};
            if (/\S/.test(bodyTag.value)) {
                options.body = bodyTag.value;
            }
            if (iconSearchDiv.getElementsByTagName("i")[0]) {
                const icon = iconSearchDiv.getElementsByTagName("i")[0];
                const iconName = icon.classList[0].substring(3);
                options.icon = `https://cdn.jsdelivr.net/gh/sunnybyeon/bootstrap-icons-png@v1.8.1/256px/${iconName}.png`;
            }

            registration.showNotification(titleTag.value, options);
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

document.getElementsByName("show-icons")[0].addEventListener("click", () => {
    if (iconList.style.display === "none") {
        showIconList();
    } else {
        hideIconList();
    }
});

iconSearchDiv.addEventListener("input", () => {
    if (iconSearchDiv.getElementsByTagName("i").length === 0) {
        showIconList();
        const searchedIcons = searchIcon(iconSearchDiv.textContent);
        iconList.replaceChildren();
        if (searchedIcons.length === 0) {
            iconList.textContent = `Nothing was found for "${iconSearchDiv.textContent}"`;
        } else {
            for (const icon of searchedIcons) {
                addIconToIconList(icon.name);
            }
        }
    }
});
