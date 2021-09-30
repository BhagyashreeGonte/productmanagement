//
// 'use strict';
//
// const Hapi = require('hapi');
//
// const init = async () => {
//
//     const server = Hapi.server({
//         port: 3000,
//         host: 'localhost'
//     });
//
//     server.route({
//
//         method: 'GET',
//         path: '/hello',
//         handler: ( request, reply ) => {
//           return true;
//         }
//
//     });
//
//     await server.start();
//     console.log('Server running on %s', server.info.uri);
// };
//
// process.on('unhandledRejection', (err) => {
//
//     console.log(err);
//     process.exit(1);
// });
//
// init();

var Glue = require('glue');
const { Pool } = require("pg");
const { manifest,storage } = require("./config");
const options = {
    relativeTo: __dirname
}
const startServer = async function () {
    try {
        const server = await Glue.compose(manifest, options);
        server.decorate("request", "config");
        console.log(storage);
        const pool = new Pool(storage.PgSQLDB);
        const client = await pool.connect();
        server.decorate("request", "pool", client);
        await server.start();
      console.log("Server is listening on " + server.info.uri.toLowerCase());
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer();
