import os
from typing import Any, Dict, List, Optional

from flask import Flask, abort, jsonify, request
from spotipyFree import Spotify

app = Flask(__name__)

SPOTIFY_EMAIL = os.environ.get("EMAIL")
SPOTIFY_COOKIES = os.environ.get("COOKIES")

if not SPOTIFY_EMAIL or not SPOTIFY_COOKIES:
    raise RuntimeError("Missing Spotify login environment variables. Set EMAIL and COOKIES.")

SPOTIFY = Spotify(email=SPOTIFY_EMAIL, cookies=SPOTIFY_COOKIES)
SPOTIFY.startLastPlayedListener()
def get_spotify_client() -> Spotify:
    return SPOTIFY


def parse_ids_query() -> List[str]:
    ids = request.args.getlist("ids")
    if ids:
        return ids
    raw_ids = request.args.get("ids")
    if not raw_ids:
        abort(400, description="Missing ids query parameter")
    return [value.strip() for value in raw_ids.split(",") if value.strip()]


def chunked(values: List[str], chunk_size: int) -> List[List[str]]:
    return [values[i : i + chunk_size] for i in range(0, len(values), chunk_size)]

@app.route("/api/recentlyPlayed")
def recently_played():
    sp = get_spotify_client()
    after = request.args.get("after")
    limit = int(request.args.get("limit", 50))
    
    try:
        all_recent = list(sp.recentlyPlayed)  # deque (converted to list) with the history of the last 50 songs played
        if after:
            after_timestamp = int(after)
            # Filter items played after the given timestamp
            # Assume played_at is in milliseconds
            filtered_items = [item for item in all_recent if int(item.get("played_at", 0)) > after_timestamp]
        else:
            filtered_items = all_recent
        
        # Return paginated response similar to Spotify API
        items = filtered_items[:limit]
        next_url = None
        if len(filtered_items) > limit:
            # Continue from the last item's played_at
            last_item = items[-1]
            next_after = last_item.get("played_at")
            next_url = f"/api/recentlyPlayed?after={next_after}&limit={limit}"
        
        response_data = {
            "items": items,
            "next": next_url
        }
    except:
        abort(400, description="Error fetching data from Spotify")

    return jsonify(response_data)

@app.route("/api/me")
def me():
    sp = get_spotify_client()
    data = sp.me()
    return jsonify(data)


@app.route("/api/playlists")
def playlists():
    """ Not yet working in spotipyFree """
    return

    sp = get_spotify_client()
    items = []
    offset = 0

    while True:
        page = sp.current_user_playlists(limit=50, offset=offset)
        items.extend(page.get("items", []))
        if not page.get("next"):
            break
        offset += 50

    return jsonify({"items": items})


@app.route("/api/play", methods=["POST"])
def play():
    """ Not yet working in spotipyFree """
    return

    sp = get_spotify_client()
    payload = request.get_json(silent=True) or {}
    track_uri = payload.get("track_uri")
    if not track_uri:
        abort(400, description="Missing track_uri")

    sp.start_playback(uris=[track_uri])
    return jsonify({})


@app.route("/api/playlists/<playlist_id>/tracks", methods=["POST"])
def add_to_playlist(playlist_id: str):
    """ Not yet working in spotipyFree """
    return

    sp = get_spotify_client()
    payload = request.get_json(silent=True) or {}
    ids = payload.get("ids")
    if not isinstance(ids, list) or any(not isinstance(item, str) for item in ids):
        abort(400, description="Missing or invalid ids")

    uris = [f"spotify:track:{track_id}" for track_id in ids]
    sp.playlist_add_items(playlist_id, uris)
    return jsonify({})


@app.route("/api/playlists", methods=["POST"])
def create_playlist():
    """ Not yet working in spotipyFree """
    return

    sp = get_spotify_client()
    payload = request.get_json(silent=True) or {}
    name = payload.get("name")
    ids = payload.get("ids")
    if not isinstance(name, str) or not isinstance(ids, list):
        abort(400, description="Missing or invalid name or ids")

    user_info = sp.current_user()
    spotify_user_id = user_info.get("id")
    if not spotify_user_id:
        abort(400, description="Unable to resolve Spotify user id")

    created = sp.user_playlist_create(
        user=spotify_user_id,
        name=name,
        public=True,
        collaborative=False,
        description="",
    )
    uris = [f"spotify:track:{track_id}" for track_id in ids]
    if uris:
        sp.playlist_add_items(created["id"], uris)

    return jsonify(created)


@app.route("/api/tracks/<track_id>")
def get_track(track_id: str):
    sp = get_spotify_client()
    try:
        track = sp.track(track_id)
    except:
        abort(404)

    return jsonify(track)


@app.route("/api/tracks")
def get_tracks():
    sp = get_spotify_client()
    ids = parse_ids_query()
    tracks: List[Optional[Dict[str, Any]]] = []
    for group in chunked(ids, 50):
        result = sp.tracks(group)
        tracks.extend(result.get("tracks", []))

    return jsonify(tracks)


@app.route("/api/albums/<album_id>")
def get_album(album_id: str):
    sp = get_spotify_client()
    try:
        album = sp.album(album_id)
    except:
        abort(404)

    return jsonify(album)


@app.route("/api/albums")
def get_albums():
    sp = get_spotify_client()
    ids = parse_ids_query()
    albums: List[Optional[Dict[str, Any]]] = []
    for group in chunked(ids, 50):
        result = sp.albums(group)
        albums.extend(result.get("albums", []))

    return jsonify(albums)


@app.route("/api/artists/<artist_id>")
def get_artist(artist_id: str):
    sp = get_spotify_client()
    try:
        artist = sp.artist(artist_id)
    except:
        abort(404)

    return jsonify(artist)


@app.route("/api/artists")
def get_artists():
    sp = get_spotify_client()
    ids = parse_ids_query()
    artists: List[Optional[Dict[str, Any]]] = []
    for group in chunked(ids, 50):
        result = sp.artists(group)
        artists.extend(result.get("artists", []))

    return jsonify(artists)


@app.route("/api/search")
def search():
    sp = get_spotify_client()
    track = request.args.get("track", "")
    artist = request.args.get("artist", "")
    if not track or not artist:
        abort(400, description="Missing track or artist query parameter")

    query = f"track:{track}+artist:{artist}"
    result = sp.search(q=query, type="track", limit=10)
    items = result.get("tracks", {}).get("items", [])
    return jsonify(items[0] if items else None)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("SPOTIPY_PROXY_PORT", 5000)))
