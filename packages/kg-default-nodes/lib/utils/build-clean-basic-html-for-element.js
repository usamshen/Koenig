import cleanBasicHtml from '@tryghost/kg-clean-basic-html';

export function buildCleanBasicHtmlForElement(domNode) {
    return function _cleanBasicHtml(html, additionalOptions = {}) {
        const cleanedHtml = cleanBasicHtml(html, {
            createDocument: (_html) => {
                const newDoc = domNode.ownerDocument.implementation.createHTMLDocument();
                newDoc.body.innerHTML = _html;
                return newDoc;
            },
            ...additionalOptions
        });
        return cleanedHtml;
    };
}
