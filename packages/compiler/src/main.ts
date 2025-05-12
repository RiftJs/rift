import 'source-map-support/register';


import { readFileSync, writeFileSync } from "fs";
import { RiftDocumentNode } from './ast/document.node';
import { EvaluatorContext } from './evaluator/context';
import { Evaluator } from './evaluator/evaluator';
import { Lexer } from "./lexer/lexer";
import { LexerError } from "./lexer/lexer-error";
import { Parser } from './parser/parser';
import { ParserError } from './parser/parser-error';
import { Logger } from "./utils/logger";
import { EvaluationError } from './evaluator/error';
import { inspect } from 'util';


function renderFile(path: string, data: any): string
{
    let template = readFileSync(path).toString();


    let lexer = new Lexer(template);
    let parser = new Parser(lexer);


    try
    {



        let document = parser.parse();
        // debugAST(document);

        let evaluator = new Evaluator(document);

        let context = new EvaluatorContext(evaluator, data);

        let vdomDocument = evaluator.evaluate(data);
        

        console.log("VDOM Document:", inspect(vdomDocument, { showHidden: false, depth: Infinity, colors: true }));


        return vdomDocument.toHTML({
            renderMode: "minify",
        });
        // console.log("Lexer state:", inspect(lexer, { showHidden: false, depth: Infinity, colors: true }));
        // console.log("Parser state:", inspect(parser, { showHidden: false, depth: Infinity, colors: true }));

        // while (true)
        // {
        //     let token = lexer.nextToken();
        //     if (token === null)
        //     {
        //         Logger.log("End of file");
        //         break;
        //     }
        //     let value = tokenValueToString(token);
        //     // Safely format value for console output

        //     Logger.verbose(`${token.kind}[${value}]`);

        // }

    }
    catch (e: any)
    {
        if (e instanceof LexerError || e instanceof ParserError)
        {

            const lines = template.toString().split("\n");
            const lineNum = e.position.line;
            const colNum = e.position.column;
            const codeLine = lines[lineNum - 1] || "";

            Logger.error(`--> ${path}:${lineNum}:${colNum}`);
            Logger.error(`     ${codeLine}`);
            Logger.error(`     ${" ".repeat(colNum - 1)}^`);

        }

        if (e instanceof EvaluationError)
        {
            const lines = template.toString().split("\n");
            const lineNum = e.position?.line || 0;
            const colNum = Math.max(e.position?.column || 0, 1);
            const codeLine = lines[lineNum - 1] || "";

            Logger.error(`--> ${path}:${lineNum}:${colNum}`);
            Logger.error(`     ${codeLine}`);
            Logger.error(`     ${" ".repeat(colNum - 1)}^`);
        }

        Logger.error(e);

    }

    // parser.debugPrint();
    //debugAST(parser.document);
    return "";
}


let contents = renderFile("./src/tests/test.html", {
    siteTitle: "My Site",
    posts: [
        { title: "Post 1", content: "Content 1" },
        { title: "Post 2", content: "Content 2" },
        { title: "Post 3", content: "Content 3" },
        { title: "Post 1", content: "Content 1" },
        { title: "Post 2", content: "Content 2" },
        { title: "Post 3", content: "Content 3" },
        { title: "Post 1", content: "Content 1" },
        { title: "Post 2", content: "Content 2" },
        { title: "Post 3", content: "Content 3" },
        { title: "Post 1", content: "Content 1" },
        { title: "Post 2", content: "Content 2" },
        { title: "Post 3", content: "Content 3" },
        { title: "Post 1", content: "Content 1" },
        { title: "Post 2", content: "Content 2" },
        { title: "Post 3", content: "Content 3" },
        { title: "Post 1", content: "Content 1" },
        { title: "Post 2", content: "Content 2" },
        { title: "Post 3", content: "Content 3" },
    ]
})

writeFileSync("./output.html", contents, "utf-8");


function debugAST(document: RiftDocumentNode)
{
    Logger.log("AST:");
    const seen = new WeakSet();
    Logger.log(JSON.stringify(document, (key, value) =>
    {
        if (typeof value === "object" && value !== null)
        {
            if (seen.has(value)) return undefined; // 👈 skip circular refs
            seen.add(value);
        }
        return value;
    }, 4));
    Logger.log("AST END");
}