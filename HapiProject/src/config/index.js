const envKey = key => {
  const env = process.env.NODE_ENV || 'development';

  const configuration = {
    development: {
      host: 'localhost',
      port: 8001,
      storage: {
        PgSQLDB: {
          user: "postgres",
          password: "test",
          host: "localhost",
          port: 5432,
          database: "productdb"
          // max: 15,
          // idleTimeoutMillis: 10000,        //10 Sec
          // connectionTimeoutMillis : 30000   //30 Sec
        }
      },
      swaggerOpts: {
        // grouping: "tags",
        info: {
          title: "Client APIs",
          description: "REST APIs to manage ACL of system and client users",
          version: "1.0"
        }
      }
    },
  };
  return configuration[env][key];
};

const manifest = {
    server: {
      host: envKey("host"),
      port: envKey("port"),
      routes: {
        cors: true
      },
      router: {
        stripTrailingSlash: true
      }
    },
    register: {
        plugins: [
          {
            plugin: "./controller",
            routes: {
              prefix: "/api"
            }
          },
          {
            plugin: "inert"
          },
          {
            plugin: "vision"
          },
          {
            plugin: require("hapi-swagger"),
            options: envKey("swaggerOpts")
          }
        ],
    }
};

exports.manifest = manifest;
exports.storage = envKey("storage");
