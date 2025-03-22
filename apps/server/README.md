# Your Spotify server

# Table of contents

- [Prometheus](#prometheus)

## Prometheus

You can access various prometheus metrics through `/metrics`:

- **http_requests_total**: Total number of HTTP requests
- **http_request_duration_nanoseconds**: Duration of HTTP requests in nanoseconds
- **imports_total**: Total number of imports
- **ingested_tracks_total**: Total number of ingested tracks from Spotify API
- **ingested_albums_total**: Total number of ingested albums from Spotify API
- **ingested_artists_total**: Total number of ingested artists from Spotify API

You will need to define to environment variable in the server:

- **PROMETHEUS_USERNAME**: the basic auth username expected by the server to authorize the request
- **PROMETHEUS_PASSWORD**: the expected password

Those values are to be referenced in the configuration of your Prometheus instance:

```yml
scrape_configs:
  - job_name: "your_spotify"
    basic_auth:
      username: "myuser"      # PROMETHEUS_USERNAME
      password: "mypassword"  # PROMETHEUS_PASSWORD
    static_configs:
      - targets: ["example.com:443"]
```