import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

function ToggleComponent() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <NodeViewWrapper className="my-2">
      <div className="border rounded-lg overflow-hidden bg-muted/30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full p-3 text-left hover:bg-muted/50 transition-colors"
          contentEditable={false}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">Toggle block</span>
        </button>
        {isOpen && (
          <div className="px-4 pb-3 pl-9">
            <NodeViewContent className="prose prose-sm max-w-none" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const Toggle = Node.create({
  name: 'toggle',
  group: 'block',
  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'div[data-toggle]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-toggle': '' }, HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleComponent);
  },

  addCommands() {
    return {
      setToggle:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: 'paragraph' }],
          });
        },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggle: {
      setToggle: () => ReturnType;
    };
  }
}
