import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function MathComponent({ node, updateAttributes, selected }: NodeViewProps) {
  const latex = node.attrs.latex as string || '';
  const display = node.attrs.display as boolean ?? true;
  const [isEditing, setIsEditing] = useState(!latex);
  const [value, setValue] = useState(latex);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing && containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode: display,
          throwOnError: false,
        });
      } catch (e) {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, display, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    updateAttributes({ latex: value });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setValue(latex);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <NodeViewWrapper className={display ? 'my-4' : 'inline'}>
        <div className={`${display ? 'block' : 'inline-block'} bg-muted rounded-lg p-3`}>
          {display ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent font-mono text-sm resize-none outline-none min-h-[60px]"
              placeholder="Enter LaTeX equation..."
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="bg-transparent font-mono text-sm outline-none min-w-[100px]"
              placeholder="LaTeX..."
            />
          )}
          <p className="text-xs text-muted-foreground mt-1">Press Enter to save, Escape to cancel</p>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className={display ? 'my-4' : 'inline'}>
      <div
        ref={containerRef}
        onClick={() => setIsEditing(true)}
        className={`
          ${display ? 'block text-center py-4' : 'inline px-1'}
          ${selected ? 'ring-2 ring-primary rounded' : ''}
          cursor-pointer hover:bg-muted/50 rounded transition-colors
        `}
      >
        {!latex && <span className="text-muted-foreground italic">Click to add equation</span>}
      </div>
    </NodeViewWrapper>
  );
}

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
      display: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-math-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-math-block': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathComponent);
  },

  addCommands() {
    return {
      setMathBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex: '', display: true },
          });
        },
    };
  },
});

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: '',
      },
      display: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-math-inline]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-math-inline': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathComponent);
  },

  addCommands() {
    return {
      setMathInline:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex: '', display: false },
          });
        },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: () => ReturnType;
    };
    mathInline: {
      setMathInline: () => ReturnType;
    };
  }
}
