import colors from "colors";

export enum LogFlags
{
    None = 0,
    Info = 1 << 0,
    Debug = 1 << 1,
    Verbose = 1 << 2,
    Trace = 1 << 3,
    Success = 1 << 4,
    Warning = 1 << 5,
    Error = 1 << 6,
};

export class Logger
{
    static colors = colors;

    static flags: LogFlags = LogFlags.Info | LogFlags.Success | LogFlags.Warning | LogFlags.Error;


    static log(message: string, name?: string)
    {
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgWhite.black(`[${name}]`)} ${colors.white(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.white(message)}`);
        }
    }

    static info(message: string, name?: string)
    {
        if (!(Logger.flags & LogFlags.Info)) return;
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgBlue.white(`[${name}]`)} ${colors.blue(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.blue(message)}`);
        }
    }

    static warn(message: string, name?: string)
    {
        if (!(Logger.flags & LogFlags.Warning)) return;
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgYellow.black(`[${name}]`)} ${colors.yellow(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.yellow(message)}`);
        }
    }

    static error(message: string, name?: string)
    {
        if (!(Logger.flags & LogFlags.Error)) return;
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgRed.white(`[${name}]`)} ${colors.red(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.red(message)}`);
        }
    }

    static success(message: string, name?: string)
    {
        if (!(Logger.flags & LogFlags.Success)) return;
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgGreen.black(`[${name}]`)} ${colors.green(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.green(message)}`);
        }
    }

    static debug(message: string, name?: string)
    {
        if (!(Logger.flags & LogFlags.Debug)) return;
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgWhite.black(`[${name}]`)} ${colors.gray(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.gray(message)}`);
        }
    }

    static verbose(message: string, name?: string)
    {
        if (!(Logger.flags & LogFlags.Verbose)) return;
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgMagenta.white(`[${name}]`)} ${colors.magenta(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.magenta(message)}`);
        }
    }

    static trace(message: string, name?: string)
    {
        if (!(Logger.flags & LogFlags.Trace)) return;
        const timestamp = colors.gray(`[${new Date().toLocaleTimeString('en-GB')}]`);
        if (name !== undefined)
        {
            console.log(`${timestamp} ${colors.bgCyan.black(`[${name}]`)} ${colors.cyan(message)}`);
        }
        else
        {
            console.log(`${timestamp} ${colors.cyan(message)}`);
        }
    }
}