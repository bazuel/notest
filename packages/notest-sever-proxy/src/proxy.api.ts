import {CssFixer} from "./css-fixer";


const httpProxy = require("http-proxy");
const url = require('url');
const cssFixer = new CssFixer()

// Create a proxy server with custom application logic
const proxy = httpProxy.createProxyServer({secure: false});
const sendError = (res, err) => {
    console.log("sending err: ", err)
    if (res) {
        let mex = JSON.stringify(err)
        res
            .writeHead(500, {
                'Content-Length': Buffer.byteLength(mex),
                'Content-Type': 'text/plain'
            })
            .end(mex);

    }
    return
};

// error handling
proxy.on("error", (err, req, res) => {
    //console.log("err: ", err)
    sendError(res, err);

});

const enableCors = (req, res) => {
    if (req.headers['access-control-request-method']) {
        res.setHeader('access-control-allow-methods', req.headers['access-control-request-method']);
    }

    if (req.headers['access-control-request-headers']) {
        res.setHeader('access-control-allow-headers', req.headers['access-control-request-headers']);
    }

    if (req.headers.origin) {
        res.setHeader('access-control-allow-origin', req.headers.origin);
        res.setHeader('access-control-allow-credentials', 'true');
    }
};

// set header for CORS
proxy.on("proxyReq", (proxyReq, req, res) => {
    //console.log("req: ", req.url)
    const queryObject = url.parse(req.url, true);
    //console.log("queryObject 2: ", queryObject)
    const urlData = url.parse(queryObject.query.url)
    //console.log("urlData 2: ", urlData)
    proxyReq.path = urlData.path;
    //console.log("preq ended")
});
proxy.on("proxyRes", (proxyRes, req, res) => {
    enableCors(req, res);
});

export function serveUsingProxy(req, res, cssUrlPrefix:string, allowedOrigin:string) {
    try {
        if (req.method === 'OPTIONS') {
            enableCors(req, res);
            res.writeHead(200);
            res.end();
            return;
        }

        const origin = req.headers['Origin'] ?? req.headers['origin']
        console.log("origin: ",origin)
        if (!origin || (origin && (origin.indexOf("buglink") >= 0 || origin.indexOf("localhost") >= 0 || allowedOrigin.indexOf(origin) >= 0))) {
            const queryObject = url.parse(req.url, true);
            let resourceUrl = queryObject.query.url
            if (!resourceUrl)
                sendError(res, {noUrl: true})
            else {
                if (resourceUrl.endsWith(".css")) {
                    enableCors(req, res);
                    cssFixer.fixCss(resourceUrl, cssUrlPrefix).then(css => {
                        try {
                            res.writeHead(200, {'Content-Length': Buffer.byteLength(css), 'Content-type': 'text/css'});
                            res.end(css);
                            console.log("done")
                        } catch (e) {
                            console.log("error", e)
                        }
                    }).catch(err => {
                        res.writeHead(500, {'Content-type': 'text/css'});
                        res.end("");
                    })
                } else {
                    const urlData = url.parse(resourceUrl)
                    //console.log("urlData 1: ",urlData)
                    //console.log("wrap started")
                    proxy.web(req, res, {
                        target: urlData.protocol + "//" + urlData.host,
                        secure: false,
                        changeOrigin: true
                    }, (err) => {
                        //console.log("err: ", err)
                        sendError(res, err);
                    });
                    //console.log("wrap ended")
                }


            }
        } else
            sendError(res, {wrongOrigin: true})
    } catch (e) {
        console.warn("Could not proxy request: ", req.url)
        res.writeHead(500, {});
        res.end("");
    }
}
