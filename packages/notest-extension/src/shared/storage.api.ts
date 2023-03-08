export class StorageApi<L, S> {

    constructor(private key: string, init: { local: L, session: S, version: number }) {
        const initIfNotAlreadyDone = (s, d) => {
            if (!s.getItem(key) || s.getItem(key) == "null")
                s.setItem(key, JSON.stringify(d))
            else {
                let storage = JSON.parse(s.getItem(key))
                if (storage.version != init.version ?? 1)
                    s.setItem(key, JSON.stringify(d))
            }
        }
        initIfNotAlreadyDone(localStorage, {...init.local, version: init.version ?? 1})
        initIfNotAlreadyDone(sessionStorage, {
            ...init.session, version: init.version ?? 1
        })
    }


    get session() {
        return this.persist(s => s).session
    }

    get local() {
        return this.persist(s => s).local
    }


    persist<T>(action: (s: { local: L, session: S }) => T): T {
        let ls = JSON.parse(localStorage.getItem(this.key) ?? '{}')
        let ss = JSON.parse(sessionStorage.getItem(this.key) ?? '{}')
        let s = {local: ls, session: ss}
        let result = action(s)
        localStorage.setItem(this.key, JSON.stringify(s.local))
        sessionStorage.setItem(this.key, JSON.stringify(s.session))
        return result
    }

}