export interface AudioFeatures {
    id?: string;
    acousticness: number;
    danceability: number;
    duration_ms: number;
    energy: number;
    instrumentalness: number;
    key: number;
    liveness: number;
    loudness: number;
    mode: number;
    speechiness: number;
    tempo: number;
    time_signature: number;
    valence: number;
    type?: string;
    uri?: string;
    track_href?: string;
    analysis_url?: string;
}