# API routes!

Must start with `api/` otherwise,  
/ => Error 404

## Investment

Root: /api/investment/

GET /{playerId}/all => Gets a list of past investments (up to 3 months) for the specified player id.

GET /{playerId}/latest => Gets the latest investment record for the specified player id.

POST / => Given a player's API key in the request body, create a new investment record.

## Player

Root: /api/player/

POST /add => Given a player's API key in the request body, create a new player in the database.  
 Eg. {APIKey: r4tu89nvkfs940t}
