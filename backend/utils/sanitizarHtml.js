const sanitizeHtml = require('sanitize-html');

const OPCIONES = {
    allowedTags: [
        'p', 'br', 'hr', 'div', 'span',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark', 'code', 'pre',
        'blockquote', 'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'a', 'img', 'figure', 'figcaption',
        'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'col', 'colgroup',
        'iframe',
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target', 'rel', 'title'],
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'title'],
        td: ['colspan', 'rowspan'],
        th: ['colspan', 'rowspan', 'scope'],
        '*': ['style', 'class'],
    },
    allowedStyles: {
        '*': {
            'text-align': [/^(left|right|center|justify)$/],
            'color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\(/],
            'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\(/],
            'font-weight': [/^(normal|bold|[1-9]00)$/],
            'text-decoration': [/^(none|underline|line-through)$/],
            'width': [/^\d+(\.\d+)?(px|%|em|rem)$/],
            'height': [/^\d+(\.\d+)?(px|%|em|rem)$/],
        },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    allowIframeRelativeUrls: false,
    exclusiveFilter: (frame) => frame.tag === 'iframe' && !frame.attribs.src,
    transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
};

const sanitizarHtml = (html) => (typeof html === 'string' ? sanitizeHtml(html, OPCIONES) : html);

const aTextoPlano = (html) =>
    typeof html === 'string'
        ? sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim()
        : '';

module.exports = { sanitizarHtml, aTextoPlano };
