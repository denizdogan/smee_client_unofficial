// deno-lint-ignore-file no-explicit-any
import validator from "npm:validator@13.7.0";
import EventSource from "npm:eventsource@2.0.2";
import url from "node:url";
import querystring from "npm:querystring";

type Severity = "info" | "error";

interface Options {
  source: string;
  target: string;
  logger?: Pick<Console, Severity>;
}

class Client {
  source: string;
  target: string;
  logger: Pick<Console, Severity>;
  events!: EventSource;

  constructor({ source, target, logger = console }: Options) {
    this.source = source;
    this.target = target;
    this.logger = logger!;

    if (!validator.isURL(this.source)) {
      throw new Error("The provided URL is invalid.");
    }
  }

  onmessage(msg: any) {
    const data = JSON.parse(msg.data);

    const target = url.parse(this.target, true);
    const mergedQuery = Object.assign(target.query, data.query);
    target.search = querystring.stringify(mergedQuery);

    delete data.query;

    const body = data.body;
    delete data.body;

    const headers = new Headers();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    });

    fetch(url.format(target), { method: "POST", body: JSON.stringify(body) })
      .then((res) => {
        this.logger.info(`POST ${res.url} - ${res.status}`);
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  onopen() {
    this.logger.info("Connected", this.events.url);
  }

  onerror(err: any) {
    this.logger.error(err);
  }

  start() {
    const events = new EventSource(this.source);

    // Reconnect immediately
    (events as any).reconnectInterval = 0; // This isn't a valid property of EventSource

    events.addEventListener("message", this.onmessage.bind(this));
    events.addEventListener("open", this.onopen.bind(this));
    events.addEventListener("error", this.onerror.bind(this));

    this.logger.info(`Forwarding ${this.source} to ${this.target}`);
    this.events = events;

    return events;
  }
}

export default Client;
