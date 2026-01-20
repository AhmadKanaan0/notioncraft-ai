import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import { Info, AlertTriangle, Lightbulb, AlertCircle } from 'lucide-react';

export type CalloutType = 'info' | 'warning' | 'tip' | 'error';

const calloutConfig: Record<CalloutType, { icon: React.ReactNode; className: string }> = {
  info: {
    icon: <Info className="h-5 w-5" />,
    className: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5" />,
    className: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
  },
  tip: {
    icon: <Lightbulb className="h-5 w-5" />,
    className: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  },
  error: {
    icon: <AlertCircle className="h-5 w-5" />,
    className: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  },
};

function CalloutComponent({ node }: NodeViewProps) {
  const type = (node.attrs.type as CalloutType) || 'info';
  const config = calloutConfig[type];

  return (
    <NodeViewWrapper className="my-3">
      <div className={`flex gap-3 p-4 rounded-lg border ${config.className}`}>
        <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
        <NodeViewContent className="flex-1 prose prose-sm max-w-none" />
      </div>
    </NodeViewWrapper>
  );
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-callout-type') || 'info',
        renderHTML: (attributes) => ({
          'data-callout-type': attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-callout': '' }, HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },

  addCommands() {
    return {
      setCallout:
        (type: CalloutType) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { type },
            content: [{ type: 'paragraph' }],
          });
        },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type: CalloutType) => ReturnType;
    };
  }
}
