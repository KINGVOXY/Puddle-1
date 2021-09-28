/**
 * Response処理を行うクラス。
 * @author Daruo(KINGVOXY)
 * @author AO2324(AO2324-00)
 * @Date   2021-09-23
 */
import {
    System, RequestLog, SystemRequest, SystemResponse, Route, WebSocketRoute, WebSocketClient,
    acceptWebSocket, isWebSocketCloseEvent, WebSocket, acceptable, DecodedURL, createHash
} from "./mod.ts"

/**
 * Routeの処理をメソッドごとに分けて実行する。
 * @param request リクエストオブジェクト。
 * @param route Routeオブジェクト。
 */
export function control(request: SystemRequest, route: Route): void {
    new RequestLog(
        route.PATH(),
        request.method,
        new DecodedURL(request.url, System.URL).toString(),
        request.headers.get("Forwarded") || (request.conn.remoteAddr as Deno.NetAddr).hostname
    );
    if(route.AUTH()) authentication(request, route);
    switch (request.method) {
        case "GET":
            if(route.isWebSocket) webSocketController(request, route.WebSocket());
            else controller(request, route.GET());
            break;
        case "PUT":
            controller(request, route.PUT());
            break;
        case "POST":
            controller(request, route.POST());
            break;
        case "DELETE":
            controller(request, route.DELETE());
            break;
        case "PATCH":
            controller(request, route.PATCH());
            break;

        default:
            controller(request, Route["502"].GET());
            break;
    }
}

function getRandomStr(length: number = 8): string{
    const CHAR = "ABCDEFGHIJKLMNOPQRSTUabcdefghijklmnopqrstuvwxyz0123456789=.?!^|-_<>";
    const result = [];
    for(let i = 0; i < length; i++)result.push(CHAR[Math.floor(Math.random() * CHAR.length)]);
    return result.join("");
}

function authentication(request: SystemRequest, route: Route) {
    const response = new SystemResponse(request.request)
    const auth: {[key:string]:string;} = {};
    (request.headers.get("authorization")||"").replace("Digest ","").replace(/\"/g,"").split(/\,\s*/g).forEach(v=>{
        const tmp = v.split("=");
        auth[tmp[0]] = tmp.slice(1).join("=");
    });
    const _A1: string[] = route.AUTH() || [];
    const res: string[] = [];
    for(let A1 of _A1) {
        const A2 = createHash("md5").update(`${request.method}:${request.getURL().pathname}`).toString();
        res.push(createHash("md5").update( `${A1}:${auth?.nonce}:${auth?.nc}:${auth?.cnonce}:${auth?.qop}:${A2}` ).toString());
    }
    if(res.includes(auth?.response)) return;
    response.status = 401;
    response.headers.set("WWW-Authenticate", `Digest realm="${route.PATH()}", nonce="${getRandomStr(60)}", algorithm=MD5, qop="auth"`);
    response.headers.set('Content-Type', 'text/html');
    response.body = `<body><script type="text/javascript">setTimeout(()=>location.pathname='/403', 0);</script></body>`;
    response.send();
}

/**
 * 通常のリクエスト時の処理を実行する。
 * @param request リクエストオブジェクト。
 * @param process 実行する処理。
 */
function controller(request: SystemRequest, process: Function) {
    process(request, new SystemResponse(request.request));
}

/**
 * WebSocket通信時のリクエスト時の処理を実行する。
 * @param request リクエストオブジェクト。
 * @param process 実行する処理。
 */
async function webSocketController(request: SystemRequest, wsRoute: WebSocketRoute) {
    if (acceptable(request)) {
        const webSocket: WebSocket = await acceptWebSocket({
            conn: request.conn,
            bufReader: request.request.r,
            bufWriter: request.request.w,
            headers: request.headers,
        });
        const client: WebSocketClient = new WebSocketClient(webSocket);
        wsRoute.onopen()(request, client);
        for await (const message of webSocket) {
            if (typeof message === "string") {
                wsRoute.onmessage()(request, client, message);
            } else if (isWebSocketCloseEvent(message)) {
                wsRoute.onclose()(request, client);
                delete WebSocketClient.list[client.id];
                break;
            }
        }
    
    }
}