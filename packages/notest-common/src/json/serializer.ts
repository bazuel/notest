function stringify(obj, replacer?, spaces?, cycleReplacer?) {
    let serialized = JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
    return serialized
}

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function isNode(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
}

function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

function serializer(replacer, cycleReplacer) {
    const stack: any[] = [], keys: any[] = []

    if (cycleReplacer == null) cycleReplacer = function (key, value) {
        if (stack[0] === value) return "[Circular ~]"
        return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
    }

    return function (this, key, value) {
        if (stack.length > 0) {
            const thisPos = stack.indexOf(this)
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
            if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
        } else stack.push(value)

        if (replacer == null) {
            return value
        } else {
            return replacer.call(this, key, value)
        }
    }
}

const consoleReplacer = (key, value) => {
    if (isNode(value) || isElement(value))
        return ''
    else if (isFunction(value))
        return 'function ' + value.toString()
    else
        return value
}

export class Serializer {

    constructor(private options?: { skip: ('function' | 'node' | 'element')[] }) {
    }

    serialize(obj: any) {
        let replacer = (key, value) => value
        if (this.options && this.options.skip.indexOf("element") >= 0 && this.options.skip.indexOf("node") >= 0 && this.options.skip.indexOf("function") >= 0) {
            replacer = consoleReplacer
        }
        return stringify(obj, replacer)
    }

}
