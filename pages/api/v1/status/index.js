import database from "infra/database.js";

export default async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersion = await database.query("SHOW server_version;");
  const versionRaw = databaseVersion.rows[0].server_version;
  const version = versionRaw.split(" ")[0];

  const databaseMaxConnection = await database.query("SHOW max_connections;");
  const maxConnections = databaseMaxConnection.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseConnectionActive = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const connectionActive = databaseConnectionActive.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: version,
        max_connections: parseInt(maxConnections),
        opened_connections: parseInt(connectionActive),
      },
    },
  });
}
