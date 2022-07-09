import { getAllUsers, getFirstInfo, storeInUser } from '../database';
import { UserModel } from '../database/Models';
import { User } from '../database/schemas/user';
import { logger } from '../tools/logger';
import { startMigration } from '../tools/migrations';
import { SpotifyAPI } from '../tools/spotifyApi';
import { deleteUser } from '../tools/user';

export const up = async () => {
  startMigration('switch to spotify login');
  let allUsers = await getAllUsers();

  // Delete users with no spotify access token
  const toDelete: string[] = allUsers
    .filter(u => Boolean(!u.accessToken || !u.refreshToken))
    .map(u => u._id.toString());

  allUsers = allUsers.filter(u => Boolean(u.accessToken && u.refreshToken));

  // Assign the spotify ID to each account having an access token
  // If an account is incorrect, just exit the migration
  await Promise.all(
    allUsers.map(async us => {
      const spotifyApi = new SpotifyAPI(us._id.toString());
      try {
        const res = await spotifyApi.me();
        us.spotifyId = res.id;
        await storeInUser('_id', us._id, { spotifyId: us.spotifyId });
      } catch (e) {
        logger.error(
          e,
          `Error on user ${us.username} while migrating, please try again later, if the problem perists, please open an issue. YourSpotify won't launch`,
        );
        process.exit(1);
      }
    }),
  );

  // Builds a record that lists every account that have the same SpotifyID
  // Deletes account that have no spotify id, they are not initialized
  const usersWithSameSpotifyID = allUsers.reduce<Record<string, User[]>>(
    (acc, curr) => {
      const { spotifyId } = curr;
      if (!spotifyId) {
        toDelete.push(curr._id.toString());
        return acc;
      }
      const existing = acc[spotifyId];
      if (existing) {
        existing.push(curr);
      } else {
        acc[spotifyId] = [curr];
      }
      return acc;
    },
    {},
  );

  // Deletes all the user marked as to be deleted
  await Promise.all(toDelete.map(d => deleteUser(d)));

  const userWithMultiple = Object.values(usersWithSameSpotifyID).filter(
    arr => arr.length > 1,
  );

  // For each Spotify ID that have more than one account
  // Keep the one that has the oldest first song listened
  const promises = userWithMultiple.map(async users => {
    const firsts = await Promise.all(
      users.map(u => getFirstInfo(u._id.toString())),
    );
    let min = new Date(3000, 1, 1).getTime();
    let chosen = 0;
    for (let i = 0; i < firsts.length; i += 1) {
      const first = firsts[i];
      if (first) {
        const ms = first.played_at.getTime();
        if (ms < min) {
          min = ms;
          chosen = i;
        }
      }
    }
    const duplicates = users.filter((_, k) => k !== chosen);
    await Promise.all(duplicates.map(d => deleteUser(d._id.toString())));
  });
  await Promise.all(promises);

  // Unsets the password from every account since you login with Spotify now
  // Unsets the activated field since now account are linked to Spotify
  await UserModel.updateMany(
    {},
    { $unset: { password: 1, activated: 1 } },
    { strict: false },
  );
  await UserModel.ensureIndexes();
};

export const down = async () => {};
