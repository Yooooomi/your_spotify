import { Gauge, Counter, collectDefaultMetrics } from "prom-client";

export class Metrics {
  static httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "endpoint", "status"] as const,
  });

  static httpRequestDurationNanoseconds = new Gauge({
    name: "http_request_duration_nanoseconds",
    help: "Duration of HTTP requests in nanoseconds",
    labelNames: ["method", "endpoint", "status"] as const,
  });

  static importsTotal = new Counter({
    name: "imports_total",
    help: "Total number of imports",
    labelNames: ["type", "user", "status"] as const,
  });

  static ingestedTracksTotal = new Counter({
    name: "ingested_tracks_total",
    help: "Total number of ingested tracks from Spotify API",
    labelNames: ["user"] as const,
  });

  static ingestedAlbumsTotal = new Counter({
    name: "ingested_albums_total",
    help: "Total number of ingested albums from Spotify API",
    labelNames: ["user"] as const,
  });

  static ingestedArtistsTotal = new Counter({
    name: "ingested_artists_total",
    help: "Total number of ingested artists from Spotify API",
    labelNames: ["user"] as const,
  });
}

collectDefaultMetrics();
