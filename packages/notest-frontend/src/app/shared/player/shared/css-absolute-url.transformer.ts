export class CssAbsoluteUrlTransformer {

    URL_IN_CSS_REF = /url\((?:'([^']*)'|"([^"]*)"|([^)]*))\)/gm;
    RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/;
    DATA_URI = /^(data:)([\w\/\+\-]+);(charset=[\w-]+|base64).*,(.*)/i;

    transform(cssText: string, url: string, prefix = "") {
        return (cssText || '').replace(
            this.URL_IN_CSS_REF,
            (origin, path1, path2, path3) => {
                const filePath = path1 || path2 || path3;
                if (!filePath) {
                    return origin;
                }
                else if (!this.RELATIVE_PATH.test(filePath)) {
                    return `url('${filePath}')`;
                }
                else if (this.DATA_URI.test(filePath)) {
                    let u = `url(${filePath})`
                    if(filePath.indexOf("\\\"") >= 0)
                        u = `url('${filePath}')`
                    else if(filePath.indexOf("\\'") >= 0)
                        u = `url("${filePath}")`
                    else if(filePath.indexOf("'") >= 0)
                        u = `url("${filePath}")`
                    else if(filePath.indexOf("\"") >= 0)
                        u = `url('${filePath}')`
                    return u;
                }
                else if (filePath[0] === '/') {
                    let newUrl = `url('${prefix + this.extractOrigin(url) + filePath}')`;
                    return newUrl
                }
                const stack = url.split('/');
                const parts = filePath.split('/');
                stack.pop();
                for (const part of parts) {
                    if (part === '.') {
                        continue;
                    } else if (part === '..') {
                        stack.pop();
                    } else {
                        stack.push(part);
                    }
                }
                return `url('${stack.join('/')}')`;
            }
        );
    }

    proxyUrls(cssText: string, proxyBasePath: string) {
        return (cssText || '').replace(
            this.URL_IN_CSS_REF,
            (_, path1, path2, path3) => {
                const filePath = path1 || path2 || path3;
                if (!this.RELATIVE_PATH.test(filePath)) {
                    return `url('${proxyBasePath + filePath}')`;
                } else
                    return `url('${filePath}')`;
            }
        );
    }

    private extractOrigin(url: string): string {
        let origin;
        if (url.indexOf('//') > -1) {
            origin = url
                .split('/')
                .slice(0, 3)
                .join('/');
        } else {
            origin = url.split('/')[0];
        }
        origin = origin.split('?')[0];
        return origin;
    }
}
