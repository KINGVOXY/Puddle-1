import { 
    System, Config, default_get, 
    default_error, redirect, ServerRequest, 
    SystemResponse
} from "../../mod.ts"

const defaultList: {[key: string]: string;} = {name: "apple", color: "red"}

System.createRoute("./assets/index.html").URL("/", "/get");

System.createRoute("./assets/post.html").URL("/post")
.POST(async function (request: ServerRequest, response: SystemResponse) {
    const body = await request.body;
    const decoder = new TextDecoder('utf-8');
    const file_data = decoder.decode(await Deno.readAll(body));
    
    response.setText(file_data);
    response.send();
});

System.createRoute("./assets/put.html").URL("/put")
.PUT(async function (request: ServerRequest, response: SystemResponse) {
    const body = await request.body;
    const decoder: TextDecoder = new TextDecoder('utf-8');
    const file_data: string = decoder.decode(await Deno.readAll(body));
    
    const eles: string[] = file_data.split('&');
    for(let e of eles) {
        let keyOrCon = e.split('=');
        defaultList[keyOrCon[0]] = keyOrCon[1];
    }

    response.setText(JSON.stringify(defaultList));
    response.send();
});

System.listen(8080, (conf: Config)=>{
    console.log(`The server running on http://${conf.hostname}:${conf.port}`);
});
