import { icons } from "./icons.js";

export function searchIcon(query) {
    const lowerQuery = query.toLowerCase();
    return icons
        .reduce((result, icon) => {
            const iconSort = [
                icon.name.includes(lowerQuery),
                icon.category.includes(lowerQuery),
                icon.tags.some((tag) => tag.includes(lowerQuery)),
            ].filter((bool) => bool).length;
            if (iconSort > 0) {
                return result.concat({
                    ...icon,
                    sort: iconSort,
                });
            }
            return result;
        }, [])
        .sort((iconA, iconB) => iconB.sort - iconA.sort);
}
