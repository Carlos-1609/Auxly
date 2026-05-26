// Thin wrappers around Spotify Web API endpoints.
// Throw on non-2xx so callers can rely on the contract: returns data or throws.

const SPOTIFY_BASE = "https://api.spotify.com/v1";

type TopTracksOpts = {
  limit?: number;
  timeRange?: "short_term" | "medium_term" | "long_term";
};

export type SpotifyTrack = {
  uri: string;
  id: string;
  name: string;
};

export type CreatedSpotifyPlaylist = {
  id: string;
  name: string;
  externalUrl: string;
};

const assertOk = async (r: Response, label: string) => {
  if (r.ok) return;
  const body = await r.text().catch(() => "");
  throw new Error(`${label} failed (${r.status}): ${body || r.statusText}`);
};

export const getTopTracks = async (
  token: string,
  opts: TopTracksOpts = {}
): Promise<SpotifyTrack[]> => {
  const { limit = 10, timeRange = "short_term" } = opts;
  const r = await fetch(
    `${SPOTIFY_BASE}/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  await assertOk(r, "Spotify top tracks");
  const data = await r.json();
  return data.items as SpotifyTrack[];
};

export const createSpotifyPlaylist = async (
  token: string,
  userId: string,
  opts: { name: string; description?: string; public?: boolean }
): Promise<CreatedSpotifyPlaylist> => {
  const r = await fetch(`${SPOTIFY_BASE}/users/${userId}/playlists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: opts.name,
      description: opts.description ?? "",
      public: opts.public ?? false,
    }),
  });
  await assertOk(r, "Spotify create playlist");
  const data = await r.json();
  return {
    id: data.id,
    name: data.name,
    externalUrl: data.external_urls?.spotify ?? "",
  };
};

export const addTracksToSpotifyPlaylist = async (
  token: string,
  playlistId: string,
  uris: string[]
): Promise<void> => {
  if (uris.length === 0) return;
  const r = await fetch(`${SPOTIFY_BASE}/playlists/${playlistId}/tracks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris }),
  });
  await assertOk(r, "Spotify add tracks");
};

export type SpotifyMe = {
  id: string;
  displayName: string;
};

export const getCurrentSpotifyUser = async (
  token: string
): Promise<SpotifyMe> => {
  const r = await fetch(`${SPOTIFY_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await assertOk(r, "Spotify /me");
  const data = await r.json();
  return { id: data.id, displayName: data.display_name ?? data.id };
};

export type SpotifyRefreshResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

export const refreshSpotifyAccessToken = async (
  clientId: string,
  refreshToken: string
): Promise<SpotifyRefreshResponse> => {
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    }).toString(),
  });
  await assertOk(r, "Spotify token refresh");
  return r.json();
};
