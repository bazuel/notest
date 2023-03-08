import {CssAbsoluteUrlTransformer} from "./css-absolute-url.transformer";

export class DOMSerializerHelper {
    private letterNumbers = RegExp('[^a-z1-9]')
    private a = document.createElement('a');

    private tagName(t: string): string {
        const processedTagName = t.toLowerCase().trim();
        return this.letterNumbers.test(processedTagName.replace(/-/g, '')) ? 'div' : processedTagName;
    }

    private getAbsoluteUrl(url) {
        this.a.href = url;
        return this.a.href;
    }

    private getAbsoluteSrcset(attributeValue: string) {
        if (attributeValue.trim() === '') {
            return attributeValue;
        }

        function matchAll(regExp, str) {
            const matches:any[] = [];

            function replacementFunc(all, first) {
                matches.push(first);
            }

            str.replace(regExp, replacementFunc);
            return matches;
        }

        let allSrcSets = matchAll(/[^"\'=\s]+\S[^,]+/g, attributeValue)

        // srcset = "url size,url1 size1"
        return allSrcSets.map(x => {
            let v = x[0] || ''
            if (v.startsWith(","))
                v = v.substr(1)
            return v
        })
            .map(srcItem => {

                const trimmedSrcItem = srcItem.trimLeft().trimRight();
                const urlAndSize = trimmedSrcItem.split(' ').filter(x => x);
                let value = ''
                if (urlAndSize.length === 2) {
                    const absUrl = this.getAbsoluteUrl(urlAndSize[0]);
                    value = `${absUrl} ${urlAndSize[1]}`;
                } else if (urlAndSize.length === 1) {
                    const absUrl = this.getAbsoluteUrl(urlAndSize[0]);
                    value = `${absUrl}`;
                }
                return value;
            })
            .join(',');
    }


    getAbsoluteUrlsStylesheet(
        cssText: string | null,
        href = location.href,
    ): string {
        return new CssAbsoluteUrlTransformer().transform(cssText ?? '', href)
    }

    getElementAttributes(n: Node) {
        let element = n as HTMLElement
        let attributes: { [member: string]: string | null } = {};
        for (const {name, value} of Array.from(element.attributes ?? [])) {
            attributes[name] = this.serializeAttribute(name, value);
        }
        return attributes
    }

    serializeAttribute(name: string, value: string | null) {
        if (name === 'src' || (name === 'href' && value)) {
            return this.getAbsoluteUrl(value)
        } else if (name === 'srcset' && value) {
            return this.getAbsoluteSrcset(value);
        } else if (name === 'style' && value) {
            return this.getAbsoluteUrlsStylesheet(value);
        } else {
            return value;
        }
    }

    nodeElementTagAttributes(n: Node) {
        let attributes = this.getElementAttributes(n)
        let element = n as HTMLElement
        const tag = element instanceof DocumentFragment? "#document-fragment" : this.tagName(element.tagName);
        return {element, tag, attributes}
    }
}
