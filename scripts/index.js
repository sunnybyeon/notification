import { icons } from "./bootstrap-icons/icons.js";
import { searchIcon } from "./bootstrap-icons/search.js";

const MILLISECONDS_IN_A_DAY = 86400000;

// get baseURL (path to index.html)
const baseURL =
    location.pathname.slice(-10) === "index.html"
        ? location.pathname.slice(0, -11)
        : location.pathname.slice(-1) === "/"
        ? location.pathname.slice(0, -1)
        : location.pathname;

const params = new URLSearchParams(location.search);

async function requestNotificationPermission() {
    if (window.Notification && Notification.permission !== "granted") {
        await Notification.requestPermission();
    }
    if (!window.Notification) {
        alert("This browser doesn't support notifications.");
    }
}

const titleTag = document.getElementsByName("title")[0];
const bodyTag = document.getElementsByName("body")[0];

const showHistroyBtn = document.getElementsByName("show-history")[0];
const historySection = document.getElementsByClassName(
    "history-list-wrapper"
)[0];
const historyList = document.getElementsByClassName("history-list")[0];

function addHistoryToHistoryList(history) {
    const dateString = new Date(history.date).toISOString().split("T")[0];
    const historyItem = document.createElement("li");
    historyItem.insertAdjacentHTML(
        "afterbegin",
        `<div class="history-item-wrapper">
            <div class="history-item-top-wrapper">
                ${
                    history.icon
                        ? `<i class="bi-${history.icon} history-icon"></i>`
                        : ``
                }
                <span class="history-title">${history.title}</span>
                <span class="history-date">${dateString}</span>
            </div>
            ${
                history.body
                    ? `<div class="history-body">${history.body}</div>`
                    : ``
            }
        </div>`
    );
    historyItem.addEventListener("click", (ev) => {
        const wrapper = ev.currentTarget.getElementsByClassName(
            "history-item-wrapper"
        )[0];
        const topWrapper = wrapper.getElementsByClassName(
            "history-item-top-wrapper"
        )[0];
        titleTag.value =
            topWrapper.getElementsByClassName("history-title")[0].textContent;
        if (wrapper.getElementsByClassName("history-body").length > 0) {
            bodyTag.value =
                wrapper.getElementsByClassName("history-body")[0].textContent;
        }
        if (topWrapper.getElementsByClassName("history-icon").length > 0) {
            iconSearchDiv.replaceChildren();
            iconSearchDiv.insertAdjacentHTML(
                "afterbegin",
                `<i class="${
                    topWrapper.getElementsByClassName("history-icon")[0]
                        .classList[0]
                }" contenteditable="false"></i>`
            );
        }
        historySection.style.display = "none";
    });
    historyList.insertAdjacentElement("afterbegin", historyItem);
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
    icon.addEventListener("click", (ev) => {
        const selectedElem = ev.target;
        iconSearchDiv.replaceChildren();
        iconSearchDiv.insertAdjacentHTML(
            "afterbegin",
            `<i class="${selectedElem.classList[0]}" contenteditable="false"></i>`
        );
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

let historySaveDays;
if (localStorage.getItem("historySaveDays")) {
    historySaveDays = Number(localStorage.getItem("historySaveDays"));
} else {
    historySaveDays = 14;
    localStorage.setItem("historySaveDays", 14);
}

const notifications = JSON.parse(localStorage.getItem("notifications"));
if (notifications) {
    notifications.forEach((history, index) => {
        if (
            Date.now() >
            history.date + MILLISECONDS_IN_A_DAY * historySaveDays
        ) {
            notifications.splice(index, 1);
        } else {
            addHistoryToHistoryList(history);
        }
    });
    localStorage.setItem("notifications", JSON.stringify(notifications));
}

for (const icon of icons) {
    addIconToIconList(icon.name);
}

if (params.get("title")) {
    document.getElementsByName("title")[0].value = params.get("title");
}
if (params.get("body")) {
    document.getElementsByName("body")[0].value = params.get("body");
}
if (params.get("icon")) {
    iconSearchDiv.insertAdjacentHTML(
        "afterbegin",
        `<i class="bi-${params.get("icon")}" contenteditable="false"></i>`
    );
}

document.getElementsByName("send")[0].addEventListener("click", async () => {
    if (window.Notification) {
        if (Notification.permission === "granted") {
            const registration = await navigator.serviceWorker.ready;

            const options = {};
            if (/\S/.test(bodyTag.value)) {
                options.body = bodyTag.value;
            }
            if (iconSearchDiv.getElementsByTagName("i")[0]) {
                const icon = iconSearchDiv.getElementsByTagName("i")[0];
                const iconName = icon.classList[0].substring(3);
                options.icon = `https://cdn.jsdelivr.net/gh/sunnybyeon/bootstrap-icons-png@v1.8.1/256px/${iconName}.png`;
                options.badge = `https://cdn.jsdelivr.net/gh/sunnybyeon/bootstrap-icons-png@v1.8.1/256px/${iconName}.png`;
            }

            registration.showNotification(titleTag.value, options);

            if (options.icon) {
                options.icon = options.icon.split("/").pop().slice(0, -4);
            }
            delete options.badge;

            const historyArray =
                JSON.parse(localStorage.getItem("notifications")) || [];
            historyArray.push({
                date: Date.now(),
                title: titleTag.value,
                ...options,
            });
            localStorage.setItem("notifications", JSON.stringify(historyArray));
            addHistoryToHistoryList(historyArray[historyArray.length - 1]);
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

showHistroyBtn.addEventListener("click", () => {
    if (historySection.style.display === "none") {
        historySection.style.display = "block";
    } else {
        historySection.style.display = "none";
    }
});

document.getElementsByName("history-save-days")[0].value = historySaveDays;

document
    .getElementsByName("history-save-days")[0]
    .addEventListener("change", (ev) => {
        const changedValue = Number(ev.currentTarget.value);
        if (1 <= changedValue <= 365) {
            historySaveDays = changedValue;
            localStorage.setItem("historySaveDays", changedValue);
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
iconSearchDiv.addEventListener("focus", () => {
    if (iconSearchDiv.getElementsByTagName("i").length === 1) {
        iconSearchDiv.getElementsByTagName("i")[0].remove();

        iconList.replaceChildren();
        for (const icon of icons) {
            addIconToIconList(icon.name);
        }
        showIconList();
        iconList.scroll(0, 0);
    }
});
