export function observeProperty<T>(
    target: T,
    key: keyof T,
    propertyDescriptor: PropertyDescriptor,
    restore?: boolean,
) {
    const original = Object.getOwnPropertyDescriptor(target, key);
    Object.defineProperty(
        target,
        key,
        restore
            ? propertyDescriptor
            : {
                set(value) {
                    // put hooked setter into event loop to avoid of set latency
                    setTimeout(() => {
                        propertyDescriptor.set!.call(this, value);
                    }, 0);
                    if (original && original.set) {
                        original.set.call(this, value);
                    }
                },
            },
    );
    return () => observeProperty(target, key, original || {}, true);
}