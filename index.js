'use strict';

const hapi = require(`hapi`);
const config = require(`./config.json`);

const server = new hapi.Server();

server.connection({
    port: config.port
});

server.register([
    require(`vision`),
    require(`inert`)
], () => {
    server.views({
        engines: {
            hbs: require('handlebars')
        },
        relativeTo: __dirname,
        path: `./themes/${config.theme}`,
        layout: true,
        layoutPath: `./themes/${config.theme}/layout/`,
        partialsPath: `./themes/${config.theme}/partials/`
    });

    server.route(require(`./routes.js`))
});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log(`Server running at: ${server.info.uri}`)
});