# VueUse Playground


## Collaboration

Collaboration is done via web sockets.

### Server

The server runs on nodejs and uses fastify + fastify-websockets(ws). Each message sent to the server over
websockets must be defined in the following manner
```ts
{
  type: string
  payload: object
}
```

Each message has a well defined type for when you connect to a websocket server, you must identify yourself
via the following message.
```ts
{
  type: 'init',
  payload: {
    name: 'Yūji Itadori',
  }
}
```

Upon identifying with the server, the server will send a response as which the client will then use to identify
themselves in the future as well as provide a shareable session to others.
```ts
{
  type: 'init',
  payload: {
    id: '[Generated-ID]',
    name: 'Yūji Itadori',
    session: '[Generated-Session-ID]'
  }
}
```


