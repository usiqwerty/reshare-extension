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
        connect_src=["connect-src", "'self'", ...connectUrls, isDevelopment ? "http:" : "https:"].join(" ")+";"

        if (isChrome) {
            return {
                "extension_pages": ext_pages + connect_src + "img-src data: ",
            }
        }
        else{
            return ext_pages + connect_src + "img-src data: ";
        }
        //return result.join(" ");
    }
    
    return {
        manifest_version: isChrome? 3: 2,
        name: "ReShare",
        description: "__MSG_extensionDescription__",
        version: PACKAGE.version,
        homepage_url: PACKAGE.repository,
        author: PACKAGE.author,
        default_locale: "en",
        ...(isChrome? {
            action: {
                default_popup: "src/popup.html",
                default_title: "ReShare",
                browser_style: true,
            }
        }: {}),
        icons: {
            16: "icons/icon@16.png",
            24: "icons/icon@24.png",
            32: "icons/icon@32.png",
            64: "icons/icon@64.png",
            128: "icons/icon@128.png"
        },
        permissions: connectUrls.map(x => x + "/*").concat(["storage"]),
        content_security_policy: CSP(),
        web_accessible_resources:
            (isChrome?[{
                "resources": ["src/popup.html", "src/popup.js", "src/popup.css"],
                "matches": ["<all_urls>"]
            }] : ["src/popup.html", "src/popup.js", "src/popup.css"])
            ,
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
            ...(isChrome?
                {service_worker: "src/background.js"}:
                {scripts: ["src/background.js", "src/commons.js"], type:"module" })

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