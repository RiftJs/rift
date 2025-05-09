
const livereload = require("livereload");
const { resolve, join } = require("path");

const DIST = resolve(join("./example", "dist"));

const lrServer = livereload.createServer({
    exts: ['html', 'js', 'css'],
    //delay: 100,
    watchOptions: {
        recursive: true,
    },
});
lrServer.watch(DIST);