import {NextResponse} from 'next/server';
import type {NextRequest, NextFetchEvent} from 'next/server';
import {Kafka} from "@upstash/kafka";

// Trigger this middleware to run on the `/secret-page` route
export const config = {
    matcher: '/',
};

export async function middleware(req: NextRequest, event: NextFetchEvent) {
// Extract country. Default to US if not found.
    console.log(req.url)

const kafka =new Kafka({
        url: "https://distinct-mallard-8932-us1-rest-kafka.upstash.io",
        username: "ZGlzdGluY3QtbWFsbGFyZC04OTMyJHlygI3oyKeaIdw5j9SIVL6gRCNm1tPTEbk",
        password: "aM8YECeyHqENyMri8L7uCRrYvkYg77XFb3R1BE08RF1croHMp-TxQnlrGDJzMcP6lYMPKg==",
    })

console.log('hello from middleware')
console.log(JSON.stringify(req))

const message = {
        country: req.geo?.country,
        city: req.geo?.city,
        region: req.geo?.region,
        url: req.url,
        ip: req.headers.get("x-real-ip"),
        mobile: req.headers.get("sec-ch-ua-mobile"),
        platform: req.headers.get("sec-ch-ua-platform"),
        useragent: req.headers.get("user-agent")
    }

const p = kafka.producer()
const topic = "web3-error"

event.waitUntil(p.produce(topic, JSON.stringify(message)))

// Rewrite to URL
return NextResponse.next();
}