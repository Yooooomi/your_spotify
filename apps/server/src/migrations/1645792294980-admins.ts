import { getAllUsers, setUserAdmin } from "../database";
import { startMigration } from "../tools/migrations";

export const up = async () => {
  startMigration("add admin role");
  const users = await getAllUsers(false);
  await Promise.all(users.map(user => setUserAdmin(user._id.toString(), true)));
};

export const down = async () => {};
