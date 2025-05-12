import { LexerState } from "../../lexer/lexer";
import { Token, TokenType } from "../../lexer/tokens";
import { ParserContext } from "../context";
import { parseForStatement } from "./for-statement.parser";

export function parseStatement(context: ParserContext, token: Token): boolean
{
    if (token.kind === TokenType.Statement)
    {
        if (token.identifier == "for")
        {
            return parseForStatement(context, token);
        }

        throw context.error(`Unknown statement: ${token.identifier}`, token.position);
    }

    if (token.kind === TokenType.OpenCurlyBracket)
    {
        console.log("Entering block:", token);

        // Enter block
        let blockNode = context.createChildNode("block", token.position, {
            for: null,
        });
        context.lexer.state(LexerState.TextParsing);
        context.setCurrentNode(blockNode);

        context.parser.events.emit("blockStart", blockNode);

        return true;
    }

    if (token.kind === TokenType.CloseCurlyBracket)
    {
        if (context.currentNode.kind !== "block")
        {
            throw context.error(`Expected block, but got ${context.currentNode.kind}`, token.position);
        }

        context.lexer.state(LexerState.TextParsing);

        context.parser.events.emit("blockEnd", context.currentNode);

        context.currentNode = context.currentNode.parent!;

        // Exit foreach statement
        if (context.currentNode.kind === "foreach-statement")
        {
            context.currentNode = context.currentNode.parent!;
        }

        // Exit block

        return true;
    }

    throw context.error(`Expected statement, but got ${token.kind}`, token.position);
}