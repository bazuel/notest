const https = require('https');
const http = require('http');
const zlib = require('zlib');


let client = url => {
    if (url.indexOf("https") == 0)
        return https
    else return http
}

async function post(url: string, body, headers: { [header: string]: string } = {}) {
    const u = new URL(url)
    const data = JSON.stringify(body)
    if (!headers['Content-Length'])
        headers['Content-Length'] = data.length + ''
    const options = {
        hostname: u.host,
        port: u.port || u.protocol.startsWith("https") ? 443 : 80,
        path: u.pathname + u.search,
        method: 'POST',
        headers
    }

    return new Promise((r, e) => {
        const req = client(url).request(options, resp => {
            let body = '';
            resp.on('data', function (d) {
                body += d;
            });

            resp.on('error', error => {
                e(error)
            })

            resp.on('end', function () {
                var parsed = JSON.parse(body);
                r(parsed);
            });
        })

        req.write(data);
        req.end();
    })

}

async function get(url: string): Promise<{ buffer: Buffer, encoding: string }> {
    return await new Promise((r, er) => {
        try {
            client(url).get(url, function (response) {
                const data: any[] = [];
                response.on('data', function (chunk) {
                    data.push(chunk);
                });
                response.on('end', function () {
                    const buffer = Buffer.concat(data);
                    const encoding = response.headers['content-encoding'];
                    r({buffer, encoding});
                });
            }).on('error', (e) => {
                console.error(`Got error: ${e.message}`);
                er()
            });
        } catch (e) {
            console.error(`Got error: ${e.message}`);
            er()
        }
    })
}

async function getAsString(url: string): Promise<string> {
    return new Promise(r => {
        get(url).then(result => {
            const buffer = result.buffer
            const encoding = result.encoding;
            if (encoding == 'gzip') {
                zlib.gunzip(buffer, function (err, decoded) {
                    r(decoded.toString());
                });
            } else if (encoding == 'deflate') {
                zlib.inflate(buffer, function (err, decoded) {
                    r(decoded.toString());
                })
            } else if (encoding == 'br') {
                zlib.brotliDecompress(buffer, function (err, decoded) {
                    r(decoded.toString());
                })
            } else {
                r(buffer.toString());
            }
        }).catch(e => {
            r("")
        })
    })
}

export class HttpClient {
    getAsString = getAsString
    post = post
    get = get
}