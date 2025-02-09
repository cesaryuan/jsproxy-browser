import * as path from './path.js'
import * as util from "./util"
// import * as jsfilter from './jsfilter.js'

let mConf


const WORKER_INJECT = util.strToBytes(`\
if (typeof importScripts === 'function' && !self.window && !self.__PATH__) {
  self.__PATH__ = '${path.ROOT}';
  importScripts('${path.HELPER}');
}
`)


export function getWorkerCode() {
  return WORKER_INJECT
}


export function setConf(conf) {
  mConf = conf
}


const PADDING = ' '.repeat(500)

const CSP = `\
'self' \
'unsafe-inline' \
file: \
data: \
blob: \
mediastream: \
filesystem: \
chrome-extension-resource: \
`

/**
 * @param {URL} urlObj
 * @param {number} pageId
 */
export function getHtmlCode(urlObj, pageId) {
  const icoUrl = path.PREFIX + urlObj.origin + '/favicon.ico'
  const custom = mConf.inject_html || ''

  return util.strToBytes(`\
<!-- JS PROXY HELPER -->
<!doctype html>
<link rel="icon" href="${icoUrl}" type="image/x-icon">
<meta http-equiv="content-security-policy" content="frame-src ${CSP}; object-src ${CSP}">
<base href="${urlObj.href.replace(path.FAKE_DOMAIN, path.REAL_DOMAIN)}">
<title>无敌</title>
<style>
    div#pcHeadHtml {
        display: none;
    }
    
    header.default-head.hidden-print.sticky {
        display: none;
    }
    
    .cp.hidden-print {
        display: none;
    }
    </style>
    <script>
        var cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title') ||
                         Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'title');
        if (cookieDesc && cookieDesc.configurable) {
            Object.defineProperty(document, 'title', {
                get: function () {
                    return cookieDesc.get.call(document);
                },
                set: function (val) {
                    console.log(val);
                    cookieDesc.set.call(document, '无敌');
                }
            });
        }
</script>
<script data-id="${pageId}" src="${path.HELPER}"></script>
${custom}
<!-- PADDING ${PADDING} -->

`)
}
