export function throttle<F extends ((...args: unknown[]) => any)>(
    func: F,
    wait: number
) {
    let timeout: number | null | any;
    let previous = 0;
    return function (this:unknown, _arg?) {
        let now = Date.now();

        let remaining = wait - (now - previous);
        let context = this as unknown;
        let args:any[] = arguments as unknown as any[];
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        } else if (!timeout) {
            timeout = setTimeout(() => {
                previous = Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining)
        }
    };
}

export function debounce<F extends ((...args: any[]) => any)>(func: F, waitFor: number) {
    const debounced = (delay, fn) => {
        let timerId;
        return (...args) => {
            if (timerId) {
                clearTimeout(timerId);
            }
            timerId = setTimeout(() => {
                fn(...args);
                timerId = null;
            }, delay);
        }
    }
    return debounced(waitFor, func)
}
