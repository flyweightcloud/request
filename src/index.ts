import * as https from 'https'
import * as http from 'http'
import * as qs from 'querystring'
import { IncomingMessage } from 'http'
import { OutgoingHttpHeaders } from 'http2'

const JSON_CONTENT_TYPES = ['application/json']

interface FwRequestResult {
    response:  IncomingMessage
    body: string
    json: any | null
}

interface FwRequestOpts {
    json?: any
    body?: string
    headers?: OutgoingHttpHeaders
    bearerToken?: string
    method?: string
    query?: object | URLSearchParams | string
}

function buildHttpOpts(url: string, fwOpts?: FwRequestOpts): https.RequestOptions & { isHTTPS: boolean, dataStr?: string} {
    const parsedUrl = new URL(url);
    let searchParams = parsedUrl.searchParams

    if (fwOpts.query instanceof URLSearchParams) {
        searchParams = new URLSearchParams({
            ...Object.fromEntries(fwOpts.query),
            ...Object.fromEntries(searchParams)
        });

    } else if (typeof fwOpts.query === 'string') {
        searchParams = new URLSearchParams({
            ...Object.fromEntries(new URLSearchParams(fwOpts.query)),
            ...Object.fromEntries(searchParams)
        });

    } else if (typeof fwOpts.query === 'object') {
        for (const [key, value] of Object.entries(fwOpts.query || {})) {
            searchParams.append(key, value)
        }
    }

    // Handle additional searchParams being added to a url
    let pathname = parsedUrl.pathname;
    const searchParamsStr = searchParams.toString();
    if (searchParamsStr.length > 0) {
        pathname = pathname + '?' + searchParamsStr;
    }

    const isHTTPS = parsedUrl.protocol === 'https:';
    let port = parsedUrl.port
    if (port === '') {
        port = isHTTPS ? '443' : '80'
    }

    const headers = fwOpts.headers || {};
    let dataStr = null;

    if (fwOpts.bearerToken) {
        headers.Authorization = `Bearer ${fwOpts.bearerToken}`;
    }

    if (fwOpts.json) {
        headers['Content-Type'] = 'application/json';
        dataStr = JSON.stringify(fwOpts.json);
        headers['Content-Length'] = dataStr.length;
    } else if (fwOpts.body) {
        dataStr = fwOpts.body
        headers['Content-Length'] = dataStr.length;
    }

    const options = {
        hostname: parsedUrl.hostname,
        port,
        path: pathname,
        isHTTPS,
        method: fwOpts.method ? fwOpts.method : "GET",
        headers,
    }
    return options
}

function extractJSON(response: IncomingMessage, body: string): any | null {
    if (JSON_CONTENT_TYPES.includes(response.headers['content-type'])) {
        return JSON.parse(body)
    }
    return null
}

function httpRequest(url: string, options: FwRequestOpts): Promise<FwRequestResult> {
    return new Promise((resolve, reject) => {
        const httpOptions = buildHttpOpts(url, options)
        let dataStr = null;
        if (options.body || options.json) {
            dataStr = options.body || JSON.stringify(options.json)
        }

        if (dataStr && !httpOptions.headers['Content-Length']) {
            options.headers['Content-Length'] = dataStr.length
        }

        const requestFn = httpOptions.isHTTPS ? https.request : http.request

        const req = requestFn(httpOptions, (res: IncomingMessage) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({
                    response: res, body,
                    json: extractJSON(res, body)
                })
            });
            res.on('error', (err) => {
                reject(err)
            })
        });

        req.on('error', (err) => {
            reject(err)
        });

        if (dataStr) {
            req.write(dataStr)
        }

        req.end();
    });
}

function alias(method: string, url: string, options?: FwRequestOpts): Promise<FwRequestResult> {
    options = options || {}
    options.method = method
    return httpRequest(url, options)
}

function get(url: string, options?: FwRequestOpts): Promise<FwRequestResult> {
    return alias('GET', url, options);
}

function post(url: string, options?: FwRequestOpts): Promise<FwRequestResult> {
    return alias('POST', url, options);
}

function del(url: string, options?: FwRequestOpts): Promise<FwRequestResult> {
    return alias('DELETE', url, options);
}

function put(url: string, options?: FwRequestOpts): Promise<FwRequestResult> {
    return alias('PUT', url, options);
}

export default httpRequest

export {
    get,
    post,
    del,
    put
}