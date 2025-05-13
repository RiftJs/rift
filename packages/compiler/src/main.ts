import 'source-map-support/register';
import { getDiagnosticMessage } from './diagnostics/message';
import { CompilerError } from './error/error';
import { Lexer, LexerMode } from './lexer/lexer';
import { RiftSource } from './source/source';
import { inspectToken } from './diagnostics/inspect';
import { TokenKind } from './lexer/tokens';
import { Logger } from './utils/logger';
import { RiftParser } from './parser/parser';
import { getModuleDiagnostics } from './diagnostics/ast';

/**
 * Entry point for the Rift compiler. Loads a test HTML file, parses it, and prints diagnostics.
 * Handles and logs compiler errors with stack traces.
 */
async function run()
{

    try
    {
        let source = RiftSource.fromFile("./src/tests/test.html");

        let parser = new RiftParser(source)

        let module = parser.parse();

        let message = getModuleDiagnostics(module);
        console.log(message);

    }
    catch (e: any)
    {
        if (e instanceof CompilerError)
        {
            let message = getDiagnosticMessage(e);
            console.log(message);
            console.error(e.stack);
        }
    }
    
    //let lexer = new Lexer(source);

    // try
    // {
    //     while (true)
    //     {
    //         let token = lexer.next();

    //         if (token === null)
    //         {
    //             console.log("End of file");
    //             break;
    //         }

    //         Logger.debug(tokenInspect(token));

    //         // Upon first parsing we want to push the matter mode out
    //         if (token.kind == TokenKind.MatterContent)
    //         {
    //             lexer.popMode();
    //             lexer.pushMode(LexerMode.HtmlText);
    //         }

    //         if (token.kind == TokenKind.ScriptCode)
    //         {
    //             console.log("Script code", token.code);

    //         }
    //         // debug <style> tags
    //         if (token.kind == TokenKind.HtmlTagStart)
    //         {
    //             lexer.pushMode(LexerMode.HtmlTag);
    //         }

    //         if (token.kind == TokenKind.HtmlTagStart)
    //         {
    //             let id = lexer.peek(0);
    //             console.log("peek", tokenInspect(id));
    //             if (id && id?.kind == TokenKind.Identifier)
    //             {
    //                 if (id.identifier == "style")
    //                 {
    //                     Logger.debug(tokenInspect(lexer.next()));
    //                     Logger.debug(tokenInspect(lexer.next()));
    //                     lexer.popMode();
    //                     lexer.pushMode(LexerMode.Css);
    //                 }

    //                 if (id.identifier == "script")
    //                 {
    //                     Logger.debug(tokenInspect(lexer.next()));
    //                     Logger.debug(tokenInspect(lexer.next()));
    //                     lexer.popMode();
    //                     lexer.pushMode(LexerMode.Script);
    //                 }
    //             }
    //         }

    //         // debug </style> tags
    //         if (token.kind == TokenKind.GreaterThan)
    //         {
    //             // if we're in css mode, pop the mode
    //             if (lexer.getMode() == LexerMode.Css)
    //             {
    //                 lexer.popMode();
    //                 lexer.pushMode(LexerMode.HtmlTag);
    //             }
    //         }

    //         if (token.kind == TokenKind.HtmlTagEnd)
    //         {
    //             lexer.popMode();
    //         }

    //     }
    // }
    // catch (e: any)
    // {
    //     if (e instanceof CompilerError)
    //     {
    //         let message = getDiagnosticMessage(e);
    //         console.log(message);
    //         console.error(e.stack);
    //     }

    // }

}

run().then(() =>
{
    console.log("Done");
}).catch((err) =>
{
    console.error(err);
});