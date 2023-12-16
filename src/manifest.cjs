/* eslint-env node */

module.exports = ({ isChrome, isDevelopment, connectUrls = [], PACKAGE = {} } = {}) => { 

    function CSP() {
        /*const params = {
            "default-src": ["'self'"],
            "connect-src": ["'self'", ...connectUrls, ] //isDevelopment ? "http:" : "https:"
        }

        const result = [];

        for (const [k, v] of Object.entries(params))
            result.push(`${k} ${v.join(" ")};`)
        */
        ext_pages = "default-src 'self';";
        connect_src=["connect-src", "'self'", ...connectUrls, isDevelopment ? "http:" : "https:"].join(" ")

        return {
            "extension_pages": ext_pages+ connect_src,
        }
        //return result.join(" ");
    }
    
    return {
        manifest_version: 3,
        name: "SyncShare",
        description: "__MSG_extensionDescription__",
        version: PACKAGE.version,
        homepage_url: PACKAGE.repository,
        author: PACKAGE.author,
        default_locale: "en",
        action:{
            default_popup:"src/popup.html",
            default_title: "ReShare",
            browser_style: true,
        },
        icons: {
            16: "icons/icon@16.png",
            24: "icons/icon@24.png",
            32: "icons/icon@32.png",
            64: "icons/icon@64.png",
            128: "icons/icon@128.png"
        },
        permissions: connectUrls.map(x => x + "/*"),
        content_security_policy: CSP(),
        content_scripts: [
            {
                matches: [
                    "<all_urls>"
                ],
                include_globs: [
                    "*mod/quiz/attempt.php*",
                    "*mod/quiz/review.php*"
                ],
                js: [
                    "src/commons.js",
                    "src/quizattempt.js"
                ],
                css: [
                    "styles/magic-button.css",
                    "styles/context-menu.css"
                ],
                run_at: "document_end"
            },
            {
                matches: [
                    "<all_urls>"
                ],
                include_globs: [
                    "*mod/quiz/summary.php*",
                ],
                js: [
                    "src/commons.js",
                    "src/quizoverview.js"
                ],
                run_at: "document_end"
            },
            {
                matches: [
                    "<all_urls>"
                ],
                include_globs: [
                    "*mod/quiz/view.php*",
                ],
                js: [
                    "src/commons.js",
                    "src/quizboard.js"
                ],
                run_at: "document_end"
            }],
        background: {
            service_worker: "src/background.js"
        },
        ...(isChrome ? {
            update_url: "https://clients2.google.com/service/update2/crx"
        } : {
            browser_specific_settings: {
                gecko: {
                    id: "syncshare@naloaty.com",
                    update_url: "https://naloaty.github.io/syncshare/updates.json"
                }
            }
        })
    }
};