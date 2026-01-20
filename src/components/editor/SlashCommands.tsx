import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import type { Instance } from 'tippy.js';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Sparkles,
  Table,
  Calculator,
  Info,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  ChevronDown,
  Image,
  Link,
  Highlighter,
} from 'lucide-react';

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (props: { editor: any; range: any }) => void;
}

const commands: CommandItem[] = [
  {
    title: 'Text',
    description: 'Just start writing with plain text.',
    icon: <Type className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Large section heading.',
    icon: <Heading1 className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    icon: <Heading2 className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    icon: <Heading3 className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    icon: <List className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list.',
    icon: <ListOrdered className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'To-do List',
    description: 'Track tasks with a to-do list.',
    icon: <CheckSquare className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Capture a quote.',
    icon: <Quote className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code Block',
    description: 'Code with syntax highlighting.',
    icon: <Code className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'Divider',
    description: 'Visually divide blocks.',
    icon: <Minus className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: 'Table',
    description: 'Add a table with sorting.',
    icon: <Table className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    title: 'Math Equation',
    description: 'Add LaTeX math equation.',
    icon: <Calculator className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setMathBlock().run();
    },
  },
  {
    title: 'Info Callout',
    description: 'Blue information box.',
    icon: <Info className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout('info').run();
    },
  },
  {
    title: 'Warning Callout',
    description: 'Yellow warning box.',
    icon: <AlertTriangle className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout('warning').run();
    },
  },
  {
    title: 'Tip Callout',
    description: 'Green tip box.',
    icon: <Lightbulb className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout('tip').run();
    },
  },
  {
    title: 'Error Callout',
    description: 'Red error box.',
    icon: <AlertCircle className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCallout('error').run();
    },
  },
  {
    title: 'Toggle Block',
    description: 'Collapsible content section.',
    icon: <ChevronDown className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setToggle().run();
    },
  },
  {
    title: 'Image',
    description: 'Upload or embed an image.',
    icon: <Image className="h-5 w-5" />,
    command: ({ editor, range }) => {
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      }
    },
  },
  {
    title: 'Link',
    description: 'Create a hyperlink.',
    icon: <Link className="h-5 w-5" />,
    command: ({ editor, range }) => {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().deleteRange(range).setLink({ href: url }).run();
      }
    },
  },
  {
    title: 'Highlight',
    description: 'Highlight selected text.',
    icon: <Highlighter className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleHighlight().run();
    },
  },
  {
    title: 'Ask AI',
    description: 'Generate content with AI.',
    icon: <Sparkles className="h-5 w-5" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const event = new CustomEvent('open-ai-sidebar');
      window.dispatchEvent(event);
    },
  },
];

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="slash-command-menu">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            key={item.title}
            className={`slash-command-item ${index === selectedIndex ? 'is-selected' : ''}`}
            onClick={() => selectItem(index)}
          >
            <div className="slash-command-item-icon">{item.icon}</div>
            <div className="slash-command-item-content">
              <div className="slash-command-item-title">{item.title}</div>
              <div className="slash-command-item-description">{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="p-2 text-sm text-muted-foreground">No results</div>
      )}
    </div>
  );
});

CommandList.displayName = 'CommandList';

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: CommandItem }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          return commands.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: ReactRenderer<CommandListRef>;
          let popup: Instance[];

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },

            onUpdate(props: any) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return (component.ref as CommandListRef)?.onKeyDown(props);
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            },
          };
        },
      }),
    ];
  },
});
