import { Gauge, Counter } from "prom-client";

export const httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "endpoint", "status"] as const,
});

export const httpRequestDurationSeconds = new Gauge({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "endpoint", "status"] as const,
});

export const importsTotal = new Counter({
    name: "imports_total",
    help: "Total number of imports",
    labelNames: ["type", "user", "status"] as const,
});

export const ingestedTracksTotal = new Counter({
    name: "ingested_tracks_total",
    help: "Total number of ingested tracks from Spotify API",
    labelNames: ["user"] as const,
});

export const ingestedAlbumsTotal = new Counter({
    name: "ingested_albums_total",
    help: "Total number of ingested albums from Spotify API",
    labelNames: ["user"] as const,
});

export const ingestedArtistsTotal = new Counter({
    name: "ingested_artists_total",
    help: "Total number of ingested artists from Spotify API",
    labelNames: ["user"] as const,
});