import mongoose from "mongoose";
import { MongoInfos } from "./meta.types";

export async function getMongoInfos(): Promise<MongoInfos> {
  if (!mongoose.connection.db) {
    throw new Error("Not connected to database, this should not happen");
  }
  const admin = mongoose.connection.db.admin();
  const infos = await admin.buildInfo();
  return infos as MongoInfos;
}

export async function getCompatibilityVersion(): Promise<{
  featureCompatibilityVersion: { version: string };
  ok: number;
}> {
  if (!mongoose.connection.db) {
    throw new Error("Not connected to database, this should not happen");
  }
  const admin = mongoose.connection.db.admin();
  const compat = await admin.command({
    getParameter: 1,
    featureCompatibilityVersion: 1,
  });
  return compat as {
    featureCompatibilityVersion: { version: string };
    ok: number;
  };
}

export async function setFeatureCompatibilityVersion(version: string) {
  if (!mongoose.connection.db) {
    throw new Error("Not connected to database, this should not happen");
  }
  const admin = mongoose.connection.db.admin();
  await admin.command({ setFeatureCompatibilityVersion: version });
}

export async function getDatabaseHealth(): Promise<{
  status: "UP" | "DOWN" | "READONLY";
  details?: {
    version: string;
    uptime: number;
    writable: boolean;
  };
  message?: string;
}> {
  if (!mongoose.connection.readyState || !mongoose.connection.db) {
    return { status: "DOWN", message: "Database not connected" };
  }

  try {
    const mongoInfos = await getMongoInfos();

    // Fetch server status to get uptime
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.command({ serverStatus: 1 });

    // Check for fsyncLock using db.currentOp()
    const currentOp = await admin.command({ currentOp: 1 });
    const isWriteLocked = currentOp.inprog.some((op: { desc: string, active: boolean }) => op.desc === 'fsyncLockWorker' && op.active);

    if (isWriteLocked) {
      return {
        status: "READONLY",
        details: {
          version: mongoInfos.version,
          uptime: serverStatus.uptime || 0,
          writable: false,
        },
        message: "Database is read-only (fsyncLock enabled)",
      };
    }

    // If no lock is detected, check if the DB is generally writable
    return {
      status: "UP",
      details: {
        version: mongoInfos.version,
        uptime: serverStatus.uptime || 0,
        writable: true,
      },
    };

  } catch (error) {
    console.error("Error querying database health:", error);
    return { status: "DOWN", message: "Error querying database health" };
  }
}
