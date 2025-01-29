interface DomBaseNode {
  isVisible: boolean;
  highlightIndex?: number;
  parent: Partial<DomBaseNode>;
}

export class DOMTextNode implements DomBaseNode {
  constructor(
    public text: string,
    public type: string = 'TEXT_NODE',
    public isVisible: boolean,
    public parent: Partial<DomBaseNode>,
  ) {}

  hasParentWithHighlightIndex() {
    let current = this.parent;
    while (current) {
      if (current.highlightIndex) {
        return true;
      }
      current = current.parent;
    }
    return false;
  }
}

export class DOMElementNode implements DomBaseNode {
  constructor(
    public tagName: string,
    public xpath: string,
    public attributes: Record<string, string>,
    public children: DOMElementNode[],
    public isInteractive: boolean,
    public isTopElement: boolean,
    public isShadowRoot: boolean,
    public highlightIndex: number,
    public parent: Partial<DomBaseNode>,
    public isVisible: boolean,
  ) {}

  toString(): string {
    let tagStr = `<${this.tagName}`;

    // Add attributes
    for (const key in this.attributes) {
      if (this.attributes.hasOwnProperty(key)) {
        tagStr += ` ${key}="${this.attributes[key]}"`;
      }
    }
    tagStr += '>';

    // Add extra info
    const extras: string[] = [];
    if (this.isInteractive) {
      extras.push('interactive');
    }
    if (this.isTopElement) {
      extras.push('top');
    }
    if (this.isShadowRoot) {
      extras.push('shadow-root');
    }
    if (this.highlightIndex ) {
      extras.push(`highlight-index:${this.highlightIndex}`);
    }

    return tagStr + (extras.length > 0 ? ` (${extras.join(', ')})` : '');
  }
}
