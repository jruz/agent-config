import type { Rule } from "eslint";
import type { JSXAttribute } from "estree-jsx";

const noInlineStyles: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow inline style attribute on JSX elements",
    },
    messages: {
      noInlineStyles: "Inline styles are not allowed. Use CSS modules instead.",
    },
    schema: [],
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    return {
      JSXAttribute(node: JSXAttribute & Rule.NodeParentExtension) {
        if (node.name.type === "JSXIdentifier" && node.name.name === "style") {
          context.report({ node, messageId: "noInlineStyles" });
        }
      },
    };
  },
};

export default noInlineStyles;
