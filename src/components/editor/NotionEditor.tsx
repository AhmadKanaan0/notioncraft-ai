import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef } from 'react';
import { SlashCommands } from './SlashCommands';
import { BubbleToolbar } from './BubbleToolbar';
import { Callout } from './extensions/CalloutExtension';
import { Toggle } from './extensions/ToggleExtension';
import { MathBlock, MathInline } from './extensions/MathExtension';

const lowlight = createLowlight(common);

interface NotionEditorProps {
  content: any;
  onUpdate: (content: any) => void;
  placeholder?: string;
}

export function NotionEditor({ content, onUpdate, placeholder = "Type '/' for commands..." }: NotionEditorProps) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        dropcursor: {
          color: 'hsl(var(--primary))',
          width: 2,
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'notion-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'code-block-lowlight',
        },
      }),
      // New extensions
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 cursor-pointer hover:text-primary/80',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      CharacterCount.configure({
        limit: null,
      }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
      // Custom extensions
      Callout,
      Toggle,
      MathBlock,
      MathInline,
      SlashCommands,
    ],
    content: content?.content || '',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-4 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onUpdate({ content: editor.getHTML() });
      }, 500);
    },
  });

  useEffect(() => {
    if (editor && content?.content !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== content.content) {
        editor.commands.setContent(content.content || '');
      }
    }
  }, [editor, content?.content]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  const characterCount = editor.storage.characterCount;

  return (
    <div className="relative">
      <BubbleToolbar editor={editor} />
      <EditorContent editor={editor} />
      {/* Character count footer */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border">
        {characterCount?.characters()} characters · {characterCount?.words()} words
      </div>
    </div>
  );
}
