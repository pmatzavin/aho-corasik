module.exports = class AhoCorasick {
  constructor(patterns) {
    this.root = this._createNodeRoot();
    this._breadthFirstTraversal = [this.root];

    patterns.forEach((pattern, patternIter) => {
      let currentNodePtr = this.root;
      let depth = 0;

      Array.from(pattern).forEach((charOfPattern) => {
        depth++;

        const childForChar = currentNodePtr.child.get(charOfPattern);

        if (childForChar) {
          currentNodePtr = childForChar;
        } else {
          const createdNode = this._createNode();

          currentNodePtr.child.set(charOfPattern, createdNode);
          currentNodePtr = createdNode;

          if (this._breadthFirstTraversal.length < (depth + 1)) {
            this._breadthFirstTraversal.push([]);
          }

          this._breadthFirstTraversal[depth].push(createdNode);
        }
      });

      currentNodePtr.patternIndex.push(patternIter);
    });

    this._buildSuffixAndOutputLinks();
  }

  _createNode() {
    return {
      child: new Map(),
      suffixLink: undefined,
      outputLink: undefined,
      patternIndex: []
    }
  }

  _createNodeRoot() {
    const root = this._createNode();
    root.isRoot = true;
    return root;
  }

  _buildSuffixAndOutputLinks() {
    this.root.suffixLink = this.root;

    for (const [ _, child]  of this.root.child.entries()) {
      child.suffixLink = this.root;
    };

    for (const level of this._breadthFirstTraversal.slice(1)) {
      for (const currentNode of level) {
        for (const [ char, childNode ] of currentNode.child.entries()) {
          let nodePtr = currentNode.suffixLink;
          let childForChar = nodePtr.child.get(char);

          while (childForChar === undefined && !nodePtr.isRoot) {
            nodePtr = nodePtr.suffixLink;
            childForChar = nodePtr.child.get(char);
          }

          childNode.suffixLink = childForChar ? childForChar : this.root;
        }

        currentNode.outputLink = !currentNode.suffixLink.patternIndex.length ?
          currentNode.suffixLink.outputLink :
          currentNode.suffixLink;
      }
    }
  }

  search(text, onMatch) {
    let parentPtr = this.root;

    for (let textIter = 0; textIter < text.length; textIter++) {
      const char = text.charAt(textIter);

      const child = parentPtr.child.get(char);

      if (child !== undefined) {
        parentPtr = child;

        if (parentPtr.patternIndex.length) {
          onMatch(parentPtr.patternIndex, textIter);
        }

        let tempPtr = parentPtr.outputLink;

        while (tempPtr) {
          // follow all output links to get patterns ending here
          onMatch(tempPtr.patternIndex, textIter);
          tempPtr = tempPtr.outputLink;
        }
      } else {
        let hasChild = false;

        while (!parentPtr.isRoot && !hasChild) {
          // follow suffix link till matching suffix or root is found
          parentPtr = parentPtr.suffixLink;
          hasChild = parentPtr.child.has(char);
        }

        if (hasChild) {
          textIter--;
        }
      }
    }
  }
};
