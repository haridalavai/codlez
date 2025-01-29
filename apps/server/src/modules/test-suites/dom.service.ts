import { Page } from 'puppeteer';
import { buildDomTree } from './build-dom-tree';
import { Injectable } from '@nestjs/common';
import { DOMElementNode } from './dom';

@Injectable()
export class DomService {
  async getClickableElements(page: Page) {
    const elementTree = await this.buildDomTree(page);
    const selectorMap = this.createSelectorMap(elementTree);

    return { elementTree, selectorMap };
  }

  async buildDomTree(page: Page) {
    const evalPage = await buildDomTree(page);
    const htmlToDict = this.parseNode(evalPage);
    return htmlToDict;
  }

  private parseNode(nodeData: any, parent: any = null) {
    if (!nodeData) {
      return null;
    }

    if (nodeData.type === 'TEXT_NODE') {
      const textNode = {
        text: nodeData.text,
        isVisible: nodeData.isVisible,
        parent,
      };

      return textNode;
    }

    const tagName = nodeData.tagName;

    const elementNode: DOMElementNode = new DOMElementNode(
      tagName,
      nodeData.xpath,
      nodeData.attributes || {},
      [],
      nodeData.isVisible || false,
      nodeData.isInteractive || false,
      nodeData.isTopElement || false,
      nodeData.highlightIndex,
      nodeData.shadowRoot || false,
      parent,
    );

    const children: any[] = [];
    for (const child of nodeData.children || []) {
      if (child) {
        const childNode = this.parseNode(child, elementNode);
        if (childNode) {
          children.push(childNode);
        }
      }
    }

    elementNode.children = children;

    return elementNode;
  }

  private createSelectorMap(elementTree: any) {
    const selectorMap = new Map<string, DOMElementNode>();

    const processNode = (node: DOMElementNode) => {
      if (node) {
        if (node.highlightIndex) {
          selectorMap.set(node.highlightIndex.toString(), node);
        }

        // for (const child of node?.children) {
        //   processNode(child);
        // }
        if (node.children)
          for (let i = 0; i < node.children.length; i++) {
            processNode(node.children[i]);
          }
      }
    };

    processNode(elementTree);
    return selectorMap;
  }
}
