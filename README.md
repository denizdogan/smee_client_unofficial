# `smee_client_unofficial`

Unofficial Deno copy of [smee-client](https://github.com/probot/smee-client),
just because the Node.js package doesn't run on Deno.

> **WARNING:** This SHOULD be about as safe to use as the Node.js version but
> **use at your own risk!** I have intentionally changed as little as possible,
> even obvious things that could easily be improved.

So why doesn't smee-client run on Deno? Because smee-client uses Superagent
under the hood, and in turn Superagent uses a thing called `setNoDelay`,
[which does not exist in Deno](https://github.com/denoland/deno/issues/18316) at
the time of writing.

## Usage

```
import SmeeClient from "https://deno.land/x/smee_client_unofficial/mod.ts";

const smee = new SmeeClient({
  source: 'https://smee.io/abc123',
  target: 'http://localhost:3000/events',
  logger: console
})

const events = smee.start()

// Stop forwarding events
events.close()
```
