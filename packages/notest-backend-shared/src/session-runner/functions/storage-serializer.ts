export function serializeStorages(storages: { origin: string, localStorage: { name: string; value: string }[] }[]) {
    let obj: { [key: string]: string } = {};
    storages.forEach((storages) => serializeStorage(storages.localStorage, obj));
    return obj;
}

const serializeStorage = (storage, obj) => {
    for (let {name, value} of storage) {
        obj[name] = value;
    }
};