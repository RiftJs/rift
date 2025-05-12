import { node } from "../../ast/node";
import { LexerState } from "../../lexer/lexer";
import { Token, TokenType } from "../../lexer/tokens";
import { Logger } from "../../utils/logger";
import { ParserContext } from "../context";

export function parseForStatement(context: ParserContext, token: Token): boolean
{
    console.log("Parsing for statement:", token.kind);

    context.expect(TokenType.OpenParenthesis);
    context.consume();

    let aliasIdentifier = context.expect(TokenType.Identifier);
    context.consume();

    let forMethodIdentifier = context.expect(TokenType.Identifier);
    context.consume();

    let collectionIdentifier = context.expect(TokenType.Identifier);
    context.consume();

    context.expect(TokenType.CloseParenthesis);
    context.consume();

    context.expect(TokenType.OpenCurlyBracket);
    context.consume();


    let blockNode = node("block", token.position, {
        for: null,
    });

    let foreachStatementNode = node("foreach-statement", token.position, {
        collection: collectionIdentifier.name,
        alias: aliasIdentifier.name,
        index: "$index",
        block: null,
    });

    blockNode.for = foreachStatementNode;
    foreachStatementNode.block = blockNode;

    context.parentNodeToCurrent(foreachStatementNode);
    context.setCurrentNode(foreachStatementNode);

    context.parentNodeToCurrent(blockNode)
    context.setCurrentNode(blockNode);

    context.lexer.state(LexerState.TextParsing);

    Logger.verbose(`for statement: alias=${aliasIdentifier.name}, method=${forMethodIdentifier.name}, collection=${collectionIdentifier.name}`);


    // let foreachStatementNode = node("foreach-statement", token.position, {
    //     item: "items",
    //     alias: "item",
    //     index: "$index",
    // });

    // context.add(foreachStatementNode);

    return true;
}