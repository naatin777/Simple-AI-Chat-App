import { createDb } from "@/lib/db/create-db";

const databaseUrl = process.env.DATABASE_URL ?? "./data/sqlite.db";

const connection = createDb(databaseUrl);

export const db = connection.db;
export const sqlite = connection.sqlite;
