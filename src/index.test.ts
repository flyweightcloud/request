import httpRequest, { get, post, del, put } from "./index";

describe("Simple HTTPS requests", () => {
    test("Check basic json request", async () => {
        const resp = await httpRequest(
            "https://httpbin.org/anything", {
                json: {'foo': 'baz'}, method: 'POST'
            }
        )
        expect(resp.json.json.foo).toEqual('baz')
        expect(resp.json.method).toEqual('POST')
    });

    test("Use a method alias", async () => {
        const resp = await post(
            "https://httpbin.org/anything", {
                json: {'foo': 'baz'}
            }
        )
        expect(resp.json.json.foo).toEqual('baz')
        expect(resp.json.method).toEqual('POST')
    });

    test("Use a get method alias", async () => {
        const resp = await get(
            "https://httpbin.org/anything",
        )
        expect(resp.json.method).toEqual('GET')
    });

    test("Use a delete method alias", async () => {
        const resp = await del(
            "https://httpbin.org/anything",
            { json: {'foo': 'baz'} },
        )
        expect(resp.json.method).toEqual('DELETE')
    });

    test("Use a put method alias", async () => {
        const resp = await put(
            "https://httpbin.org/anything",
            { json: {'foo': 'baz'} },
        )
        expect(resp.json.method).toEqual('PUT')
    });

    test("with search params", async () => {
        const resp = await post(
            "https://httpbin.org/anything", {
                query: { a: '123' },
                json: {'foo': 'baz'},
            }
        )
        expect(resp.json.args.a).toEqual('123')
    });

    test("with search params in the url and the query", async () => {
        const resp = await post(
            "https://httpbin.org/anything?b=456", {
                query: { a: '123' },
                json: {'foo': 'baz'},
                method: 'POST'
            }
        )
        expect(resp.json.args.a).toEqual('123')
        expect(resp.json.args.b).toEqual('456')
    });

    test("using the search params object for more complex queries", async () => {
        const resp = await post(
            "https://httpbin.org/anything?b=456", {
                query: new URLSearchParams("a=123"),
                json: {'foo': 'baz'},
            }
        )
        expect(resp.json.args.a).toEqual('123')
        expect(resp.json.args.b).toEqual('456')
    });

    test("using the search params from a string", async () => {
        const resp = await post(
            "https://httpbin.org/anything?b=456", {
                query: "a=123",
                json: {'foo': 'baz'},
            }
        )
        expect(resp.json.args.a).toEqual('123')
        expect(resp.json.args.b).toEqual('456')
    });

    test("with a basic bearer token", async () => {
        const resp = await post(
            "https://httpbin.org/anything", {
                json: {'foo': 'baz'},
                bearerToken: "123456"
            }
        )
        expect(resp.json.headers.Authorization).toEqual('Bearer 123456')
    });
});

describe("Simple HTTP requests", () => {
    test("Check basic json request with http", async () => {
        const resp = await httpRequest(
            "http://httpbin.org/anything", {
                json: {'foo': 'baz'}, method: 'POST'
            }
        )
        expect(resp.json.json.foo).toEqual('baz')
        expect(resp.json.method).toEqual('POST')
    });
});