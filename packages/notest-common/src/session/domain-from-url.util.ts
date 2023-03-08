export function domainFromUrl(url:string){
    return new URL(url).hostname
}
export function pathFromUrl(url:string){
    return new URL(url).pathname
}
