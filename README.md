# Puddle Framework

## Greeting
<div align="center">

![logo](https://avatars.githubusercontent.com/u/89392027?s=200&v=4)

Hello, I'm Puddle FrameWork.

ｺﾝﾆﾁﾊ　ﾎﾞｸﾊ　ﾊﾟﾄﾞﾙﾌﾚｰﾑﾜｰｸ　ﾀﾞﾖ.
</div>

## About Puddle Framework
Puddle Framework is a web framework that runs on Deno.  
The goal of this framework is to make it easy for even novice programmers to set up a web server.

## Docs
[Documents - PuddleFramework (Being worked on)]()


## How to build the environment

Shell (Mac, Linux):
```sh
curl -fsSL https://deno.land/x/install/install.sh | sh
```

PowerShell (Windows):
```sh
iwr https://deno.land/x/install/install.ps1 -useb | iex
```

Homebrew (Mac):
```sh
brew install deno
```

See [deno.land](https://deno.land/#installation) for more installation options.

## How to set up a web server

### Start the server
You can start the server with the command "deno run -A . /server.ts".
```typescript
import { System, Config } from "https://github.com/PuddleServer/Puddle/raw/develop/System.ts";

System.listen(8080, (conf: Config) => {
    console.log(`The server running on http://${conf.hostname}:${conf.port}`);
});
```

### Configuring Routing
You can host a static server by simply specifying the file path!
```typescript
import { System, Config } from "https://github.com/PuddleServer/Puddle/raw/develop/System.ts";

System.createRoute("./index.html").URL("/", "/Top");

System.createRoutes("./styles/*");

System.listen(8080, (conf: Config) => {
    console.log(`The server running on http://${conf.hostname}:${conf.port}`);
});
```

### Configuring Controller
If you want to set up dynamic processing, connect the method to the route you created and specify the handler function.
```typescript
import { System, Config, SystemRequest, SystemResponse } from "https://github.com/PuddleServer/Puddle/raw/develop/mod.ts";

System.createRoute("ContactForm").URL("/Contact")
.GET(async (req: SystemRequest, res: SystemResponse) => {
    await res.setFile("./contact_form.html");
})
.POST(async (req: SystemRequest, res: SystemResponse) => {
    const body: string = await req.readBody();
    if(!body.length) return {
        status:     400,
        headers:    new Headers(),
        body:       "No message."
    };

    // Process body data.

    await res.setText("Collect.");
});

System.listen(8080, (conf: Config) => {
    console.log(`The server running on http://${conf.hostname}:${conf.port}`);
});
```

## How to set up a Websocket server

### Start the Websocket server
Websockets server routing can be done in the same way as web server routing!
```typescript
import { System, Config, SystemRequest, WebSocketClient } from "https://github.com/PuddleServer/Puddle/raw/develop/mod.ts";

System.createRoute("./webSocket.html").URL("/", "/トップ");
System.createRoute("/ws").WebSocket();

System.listen(8080, (conf: Config)=>{
    console.log(`The server running on http://${conf.hostname}:${conf.port}`);
});
```

### How to set up Websockets events
To handle each Websocket event, set up a handler function by connecting a method to the created Websocket route.
```typescript
import { System, Config, SystemRequest, WebSocketClient } from "https://github.com/PuddleServer/Puddle/raw/develop/mod.ts";

System.createRoute("./webSocket.html").URL("/", "/トップ");
System.createRoute("/ws").WebSocket()
.onopen((req: SystemRequest, client: WebSocketClient) => {
    client.send("Connection to server complete.");
})
.onmessage((
    req:    SystemRequest,
    client: WebSocketClient,
    message:    string
) => {
    client.sendAll(message);
});

System.listen(8080, (conf: Config)=>{
    console.log(`The server running on http://${conf.hostname}:${conf.port}`);
});
```

## Authentication

### How to set up digest authentication
Digest access authentication is one of the agreed-upon methods a web server can use to negotiate credentials, such as username or password, with a user's web browser.
```typescript
System.createRoute("/auth.html").URL("/authPage")
.AUTH("userName", "password");
```

### How to set up Google OAuth 2.0
You can use OAuth 2.0 with the Google API to retrieve user information.
```typescript
const client_id = "*******.apps.googleusercontent.com";
const client_secret = "*******";
const redirect_url = "http://localhost:8080/google_auth2";
System.GOOGLE_OAUTH2(client_id, client_secret, redirect_url).URL("/Login")
.LOGIN((
    req:        SystemRequest,
    res:        SystemResponse,
    user_info:  { [key:string]: string; }
)=>{
    // "user_info" is the user information received from Google API.
    console.log(user_info);
    res.setText(JSON.stringify(user_info));
});
```

## Easily manipulate JSON files
It provides functions to easily manipulate data in JSON files!
```typescript
import { PuddleJSON } from "https://github.com/PuddleServer/Puddle/raw/develop/mod.ts";

const USERS = PuddleJSON.USE("./users.json", {
    id:     ["UNIQUE", "NOT NULL", "AUTO INCREMENT"],
    name:   ["NOT NULL"],
    age:    []
});

USERS.INSERT({ name: "Steve", age: 20 });

USERS.SELECT({ id: 1 }).RESULT("name", "age");
USERS.SELECTIF( row => ({ age: Number(row.age) >= 18 }) ).RESULT();

USERS.SELECT({ id: 1 }, 1 ).UPDATE({ age: 21 });

USERS.SELECT({ age: null }).DELETE();
```