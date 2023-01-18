export class CodeBlockParser {
    constructor(NodeClass) {
        this.NodeClass = NodeClass;
    }

    get DOMConversionMap() {
        const self = this;

        return {
            figure: () => ({
                conversion(domNode) {
                    if (domNode.tagName === 'FIGURE') {
                        const pre = domNode.querySelector('pre');

                        // If this figure doesn't have a pre tag in it
                        if (!pre) {
                            return null;
                        }

                        let code = pre.querySelector('code');
                        let figcaption = domNode.querySelector('figcaption');

                        // if there's no caption the pre key should pick it up
                        if (!code || !figcaption) {
                            return null;
                        }

                        let payload = {
                            code: code.textContent
                        };

                        let figcaptions = Array.from(domNode.querySelectorAll('figcaption'));
                        if (figcaptions.length) {
                            figcaptions.forEach((caption) => {
                                //TODO: use cleanBasicHtml here
                                // let cleanHtml = cleanBasicHtml(caption.innerHTML);
                                let cleanHtml = caption.innerHTML;
                                payload.caption = payload.caption ? `${payload.caption} / ${cleanHtml}` : cleanHtml;
                                caption.remove(); // cleanup this processed element
                            });
                        }

                        let preClass = pre.getAttribute('class') || '';
                        let codeClass = code.getAttribute('class') || '';
                        let langRegex = /lang(?:uage)?-(.*?)(?:\s|$)/i;
                        let languageMatches = preClass.match(langRegex) || codeClass.match(langRegex);
                        if (languageMatches) {
                            payload.language = languageMatches[1].toLowerCase();
                        }

                        const node = new self.NodeClass(payload);
                        return {node};
                    }
                    return null;
                },
                priority: 1
            }),
            pre: () => ({
                conversion(domNode) {
                    if (domNode.tagName === 'PRE') {
                        let [codeElement] = domNode.children;

                        if (codeElement && codeElement.tagName === 'CODE') {
                            let payload = {code: codeElement.textContent};
                            let preClass = domNode.getAttribute('class') || '';
                            let codeClass = codeElement.getAttribute('class') || '';
                            let langRegex = /lang(?:uage)?-(.*?)(?:\s|$)/i;
                            let languageMatches = preClass.match(langRegex) || codeClass.match(langRegex);
                            if (languageMatches) {
                                payload.language = languageMatches[1].toLowerCase();
                            }
                            const node = new self.NodeClass(payload);
                            return {node};
                        }
                    }

                    return null;
                },
                priority: 1
            })
        };
    }
}
