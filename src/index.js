module.exports = class AhoCorasik {
  constructor(patterns) {
    this.root = this._createNodeRoot();
    this._breadthFirstTraversal = {};

    patterns.forEach((pattern, patternIndex) => {
      let currentNodePointer = this.root;
      let depth = 0;

      this._breadthFirstTraversal.first = 1;

      Array.from(pattern).forEach((charOfPattern) => {
        const nodeExists = currentNodePointer.child.has(charOfPattern);
        depth++;
        if (nodeExists) {
          currentNodePointer = currentNodePointer.child.get(charOfPattern);
        } else {
          const createdNode = this._createNode();
          currentNodePointer.child.set(charOfPattern, createdNode);
          currentNodePointer = createdNode;
          createdNode.depth = depth;
          if (depth >= 0) {
            if (!this._breadthFirstTraversal[depth]) {
              this._breadthFirstTraversal[depth] = [];
              this._breadthFirstTraversal.last = depth;
            }
            this._breadthFirstTraversal[depth].push(createdNode);
          }
        }
      });

      currentNodePointer.patternIndex.push(patternIndex);
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

    for (const entry of this.root.child.entries()) {
      const nodeAttachedToRoot = entry[1];

      nodeAttachedToRoot.suffixLink = this.root;
    };

    for (
      let levelIter = this._breadthFirstTraversal.first;
      levelIter <= this._breadthFirstTraversal.last;
      levelIter++
    ) {
      const level = this._breadthFirstTraversal[levelIter];

      for (const currentNodePointer of level) {
        for (const entry of currentNodePointer.child.entries()) {
          const [charKey, trieNode] = entry;
          let tmpNodePointer = currentNodePointer.suffixLink;

          while (
            !tmpNodePointer.child.has(charKey) &&
            !tmpNodePointer.isRoot
          ) {
            tmpNodePointer = tmpNodePointer.suffixLink;
          }

          if (tmpNodePointer.child.has(charKey)) {
            trieNode.suffixLink = tmpNodePointer.child.get(charKey);
          } else {
            trieNode.suffixLink = this.root;
          }
        }

        if (currentNodePointer.suffixLink.patternIndex.length) {
          currentNodePointer.outputLink = currentNodePointer.suffixLink;
        } else {
          currentNodePointer.outputLink =
            currentNodePointer.suffixLink.outputLink;
        }
      }
    }
  }

  search(text, onMatch) {
    let parentPointer = this.root;

    for (let textIter = 0; textIter < text.length; textIter++) {
      const char = text.charAt(textIter);

      if (parentPointer.child.has(char)) {
        // if link to char exists then follow the link
        parentPointer = parentPointer.child.get(char);

        if (parentPointer.patternIndex.length) {
          // if this node is marked then a pattern ends here
          onMatch(parentPointer.patternIndex, textIter);
        }

        let tempPointer = parentPointer.outputLink;

        while (tempPointer) {
          // follow all output links to get patterns ending here
          onMatch(tempPointer.patternIndex, textIter);
          tempPointer = tempPointer.outputLink;
        }
      } else {
        while (!parentPointer.isRoot && !parentPointer.child.has(char)) {
          // follow suffix link till matching suffix or root is found
          parentPointer = parentPointer.suffixLink;
        }

        if (parentPointer.child.has(char)) {
          textIter--;
        }
      }
    }
  }
};