export type Json = void | Date | null | boolean | number | string | Json[] | { [prop: string]: Json }

export type JsonCompatible<T> = {
    [P in keyof T]: T[P] extends Json
        ? T[P]
        : Pick<T, P> extends Required<Pick<T, P>>
            ? never
            : T[P] extends (() => any) | undefined
                ? never
                : JsonCompatible<T[P]>
}

export function cloneJson(obj) {
    return JSON.parse(JSON.stringify(obj))
}




