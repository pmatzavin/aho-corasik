module.exports = class AhoCorasik {
  constructor(patterns) {
    this.root = this._createNodeRoot();
    this._breadthFirstTraversal = {};

    patterns.forEach((pattern, patternIndex) => {
      let currentNodePtr = this.root;
      let depth = 0;

      this._breadthFirstTraversal.first = 1;

      Array.from(pattern).forEach((charOfPattern) => {
        const nodeExists = currentNodePtr.child.has(charOfPattern);
        depth++;
        if (nodeExists) {
          currentNodePtr = currentNodePtr.child.get(charOfPattern);
        } else {
          const createdNode = this._createNode();
          currentNodePtr.child.set(charOfPattern, createdNode);
          currentNodePtr = createdNode;
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

      currentNodePtr.patternIndex.push(patternIndex);
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

      for (const currentNodePtr of level) {
        for (const entry of currentNodePtr.child.entries()) {
          const [charKey, trieNode] = entry;
          let tmpNodePtr = currentNodePtr.suffixLink;

          while (
            !tmpNodePtr.child.has(charKey) &&
            !tmpNodePtr.isRoot
          ) {
            tmpNodePtr = tmpNodePtr.suffixLink;
          }

          if (tmpNodePtr.child.has(charKey)) {
            trieNode.suffixLink = tmpNodePtr.child.get(charKey);
          } else {
            trieNode.suffixLink = this.root;
          }
        }

        if (currentNodePtr.suffixLink.patternIndex.length) {
          currentNodePtr.outputLink = currentNodePtr.suffixLink;
        } else {
          currentNodePtr.outputLink =
            currentNodePtr.suffixLink.outputLink;
        }
      }
    }
  }

  search(text, onMatch) {
    let parentPtr = this.root;

    for (let textIter = 0; textIter < text.length; textIter++) {
      const char = text.charAt(textIter);

      if (parentPtr.child.has(char)) {
        // if link to char exists then follow the link
        parentPtr = parentPtr.child.get(char);

        if (parentPtr.patternIndex.length) {
          // patterns ends here
          onMatch(parentPtr.patternIndex, textIter);
        }

        let tempPtr = parentPtr.outputLink;

        while (tempPtr) {
          // follow all output links to get patterns ending here
          onMatch(tempPtr.patternIndex, textIter);
          tempPtr = tempPtr.outputLink;
        }
      } else {
        while (!parentPtr.isRoot && !parentPtr.child.has(char)) {
          // follow suffix link till matching suffix or root is found
          parentPtr = parentPtr.suffixLink;
        }

        if (parentPtr.child.has(char)) {
          textIter--;
        }
      }
    }
  }
};