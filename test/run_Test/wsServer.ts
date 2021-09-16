import { System, StartupConfig } from "../../System.ts"

System.createRoute("./assets/webSocket.html").URL("/", "/トップ");
System.createRoute("/ws").WebSocket();
System.listen(8080, (conf: StartupConfig)=>{
    console.log(`The server running on http://${conf.hostname}:${conf.port}`);
});
