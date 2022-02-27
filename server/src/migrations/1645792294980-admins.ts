import { getAllUsers, setUserAdmin } from '../database';

export const up = async () => {
  const users = await getAllUsers();
  await Promise.all(users.map((user) => setUserAdmin(user._id.toString(), true)));
};

export const down = async () => {};
