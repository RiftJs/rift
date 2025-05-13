import chalk, { ChalkInstance } from "chalk";
import { inspect } from "util";

/**
 * LogFlags control which log levels are enabled for the Logger.
 */
export enum LogFlags
{
    None = 0,
    Error = 1 << 0,
    Warning = 1 << 1,
    Info = 1 << 2,
    Debug = 1 << 3,
    Verbose = 1 << 4,

    All = Error | Warning | Info | Debug | Verbose,
}

/**
 * Logger provides static methods for logging messages at various levels (error, warning, info, debug, verbose).
 * Supports colored output and log level filtering.
 */
export class Logger
{
    static flags: LogFlags = LogFlags.All;

    /**
     * Writes a message to the console with the specified color and category.
     * @param color The chalk color instance.
     * @param message The message or object to log.
     * @param category Optional log category label.
     */
    protected static write(color: ChalkInstance, message: string | any, category?: string): void
    {
        const date = new Date();
        const timestamp = date.toLocaleTimeString("en-US", { hour12: false });

        if (!category)
        {
            category = "LOG";
        }
        const prefix = color(`[${category}]`);

        // Escape problematic characters for safe console output
        function escapeConsole(str: string): string
        {
            // Only escape control characters, not normal \n
            return str
                // .replace(/\r/g, "\\r")
                // .replace(/\n/g, "\\n")
                // .replace(/\t/g, "\\t")
                // .replace(/\f/g, "\\f")
                // .replace(/\v/g, "\\v");
        }

        if (message === null || message === undefined)
        {
            message = String(message);
        }

        if (typeof message === "object")
        {
            if (message instanceof Error)
            {
                message = `${escapeConsole(message.message)}\nStack Trace:\n${escapeConsole(message.stack ?? "")}`;
            }
            else
            {
                message = escapeConsole(inspect(message, {
                    showHidden: false,
                    depth: Infinity,
                    colors: true,
                }));
            }
        }
        else
        {
            message = escapeConsole(String(message));
        }

        // Print message as-is, so newlines are preserved
        console.log(`${timestamp} ${prefix} ${color(message)}`);
    }

    /**
     * Logs a message at the default log level.
     */
    static log(message: string | any, category?: string): void
    {

        // check if log enabled in the flags
        if ((this.flags & LogFlags.All) === 0)
        {
            return;
        }

        this.write(chalk.white, message, category ?? "LOG");
    }

    /**
     * Logs an error message and optional stack trace.
     */
    static error(message: string | any, stack?: string, category?: string): void
    {
        if ((this.flags & LogFlags.Error) === 0)
        {
            return;
        }
        this.write(chalk.red, message, category ?? "ERROR");
        if (stack)
        {
            this.write(chalk.red, `Stack trace: ${stack}`, category ?? "ERROR");
        }
    }

    /**
     * Logs a warning message.
     */
    static warning(message: string | any, category?: string): void
    {
        if ((this.flags & LogFlags.Warning) === 0)
        {
            return;
        }
        this.write(chalk.yellow, message, category ?? "WARNING");
    }

    /**
     * Logs an info message.
     */
    static info(message: string | any, category?: string): void
    {
        if ((this.flags & LogFlags.Info) === 0)
        {
            return;
        }
        this.write(chalk.green, message, category ?? "INFO");
    }

    /**
     * Logs a debug message.
     */
    static debug(message: string | any, category?: string): void
    {
        if ((this.flags & LogFlags.Debug) === 0)
        {
            return;
        }
        this.write(chalk.cyan, message, category ?? "DEBUG");
    }

    /**
     * Logs a verbose message.
     */
    static verbose(message: string | any, category?: string): void
    {
        if ((this.flags & LogFlags.Verbose) === 0)
        {
            return;
        }
        this.write(chalk.magenta, message, category ?? "VERBOSE");
    }

}