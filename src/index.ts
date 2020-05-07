import Parser from './libs/Parser';
import { NodeType } from './types';

export const parse = (rawJsxCode: string): NodeType[] => {
  return new Parser().parseJSX(rawJsxCode);
};

export { NodeType };

export const searchByAttr = (
  nodes: NodeType[],
  searchFunction: (value: NodeType) => {},
  maxDepth = Infinity
): NodeType[] => {
  const results = [];
  const queue: NodeType[] = [...nodes];
  let childs = [];
  while (queue.length && maxDepth) {
    const node: NodeType = queue.shift();
    if (node && searchFunction(node)) {
      results.push(node);
    }
    if (Array.isArray(node?.children) && node?.children?.length) {
      childs.push(...node.children);
    }

    if (!queue.length) {
      queue.push(...childs);
      childs = [];
      maxDepth--;
    }
  }
  return results;
};
