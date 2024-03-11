import { getTracks } from "../database";
import { UserModel, TrackModel } from "../database/Models";
import { Database } from "../tools/database";
import { startMigration } from "../tools/migrations";
import { getIdsHandlingMax } from "../spotify/dbTools";
import { AudioFeatures } from "../database/schemas/audioFeatures";
import { logger } from "../tools/logger";
const AudioFeaturesUrl = "https://api.spotify.com/v1/audio-features";
export async function up() {
    startMigration("add_audio_features");
    for await (const user of UserModel.find()) {
        // Get all track.ids without audio features
        const trackIds = await TrackModel.find({ audio_features:{$exists: false}, id:{$exists: true} }).select("id");
        if (trackIds.length === 0) {
            continue;
        }
        const numberTracks = trackIds.length;
        // loop in chunks of 100
        for (let i = 0; i < trackIds.length; i += 100) {
            const ids = trackIds.slice(i, i + 100).map(e => e.id);
            const tracks = await getTracks(ids);
            const AudioFeatures = await getIdsHandlingMax<AudioFeatures>(user.id, AudioFeaturesUrl, ids, 100, "audio_features");
            for (const track of tracks) {
                const trackAudioFeatures = AudioFeatures.find(feature => feature && feature.id === track.id);
                if (!trackAudioFeatures) {
                    logger.error(`No audio features found for track ${track.id}`);
                    continue;
                }
                const { id, uri, type, track_href, analysis_url, ...trackAudioFeaturesSmall } = trackAudioFeatures;
                track.audio_features = trackAudioFeaturesSmall;
                
                await track.save();
            }
            logger.info(
                `Storing AudioFeatures: ${(i+100)} / ${numberTracks} (${Math.round((i+100) / numberTracks * 10000) / 100}%)`
            );
        }
        
    }
    logger.info("Finished adding audio features");
}
  
export async function down() {}