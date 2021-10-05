# Flyweight Request

A tiny zero dependency library for Node.js designed for interacting with popular JSON API's

## Why

This library is designed for use in serverless functions where the size of the codebase
has a strong affect on cold start times.

## Example


### Basic POST Request

```ts
import { post } from '@flyweight.cloud/request'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const resp = await post("https://httpbin.com/anything", {
        json: {
            some: "Data"
        },
        bearerToken: "MY_JWT_TOKEN"
    })
    context.res = {
        body: resp.json
    }
}

```