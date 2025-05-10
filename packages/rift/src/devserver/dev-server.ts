import { existsSync, readFileSync, ReadStream } from "fs";
import { join } from "path";
import { Logger } from "src/core/logger";

export class DevServer
{
    constructor(
        public readonly servePath: string,
        public readonly port: number = 3000,
        public readonly host: string = "0.0.0.0",
        public readonly liveReloadPort: number = 35729,
    )
    {
    }

    get liveReloadScript(): string
    {
        return `<script src="http://127.0.0.1:${this.liveReloadPort}/livereload.js?snipver=1"></script>`;
    }

    async serve(): Promise<void>
    {
        const fastifyStatic = (await import("@fastify/static")).default;
        const fastify = (await import("fastify")).default;
        const app = fastify();
        app.register(fastifyStatic, {
            root: this.servePath,
            prefix: "/",
            decorateReply: true // important so we can customize .send()
        });


        app.addHook("onSend", async (req, reply, payload: ReadStream) =>
        {
            if (reply.statusCode == 404)
            {
                const htmlPath = join(this.servePath, '404.html');
                if (existsSync(htmlPath))
                {
                    const content = readFileSync(htmlPath, 'utf8');

                    reply.header("Content-Type", "text/html");
                    payload = Buffer.from(content, "utf-8") as any;
                }
            }

            let contentType = reply.getHeader("Content-Type") as string;
            if (contentType && contentType.includes("text/html"))
            {
                let content = "";
                if (payload instanceof Buffer)
                {
                    content = payload.toString("utf-8");
                }

                if (payload instanceof ReadStream)
                {
                    content = await new Promise<string>((resolve, reject) =>
                    {
                        let data = "";
                        payload.on("data", chunk => data += chunk);
                        payload.on("end", () => resolve(data));
                        payload.on("error", reject);
                    });
                }

                if (content.includes("</body>"))
                {
                    content = content.replace("</body>", this.liveReloadScript + "</body>");
                }
                else if (content.includes("</html>"))
                {
                    content = content.replace("</html>", this.liveReloadScript + "</html>");
                }
                else
                {
                    content += this.liveReloadScript;
                }

                payload = Buffer.from(content, "utf-8") as any;

                return payload;

            }

            return payload;
        });


        return new Promise((resolve, reject) =>
        {
            app.listen({ port: this.port, host: this.host }, (err: Error | null) =>
            {
                if (err)
                {
                    Logger.error(err.message, "Rift");
                    reject(err);
                }

                Logger.success(`🚀 Dev Server is running on ${Logger.colors.cyan(`http://${this.host}:${this.port}`)}`, "Rift");
                Logger.debug(`Serving files from ${this.servePath}`, "Rift");
                resolve();
            });
        });


    }

    async livereload()
    {
        const livereload = (await import("livereload")).default;

        const lrServer = livereload.createServer({
            delay: 100,
            exts: ['html', 'js', 'css', 'json'],
            port: this.liveReloadPort,
        });

        lrServer.watch(this.servePath);
        Logger.success(`💻 LiveReload is running on ${Logger.colors.cyan(`http://${this.host}:${this.liveReloadPort}`)}`, "Rift");
    }
};