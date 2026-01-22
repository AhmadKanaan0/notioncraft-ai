import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { getHierarchicalIndexes, TableOfContents } from '@tiptap/extension-table-of-contents';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import DragHandle from '@tiptap/extension-drag-handle';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import Dropcursor from '@tiptap/extension-dropcursor';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import { common, createLowlight } from 'lowlight';
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { SlashCommands } from './SlashCommands';
import { BubbleToolbar } from './BubbleToolbar';
import { ContentItemMenu } from './menus/ContentItemMenu/ContentItemMenu';
import { TableBubbleMenu } from './TableBubbleMenu';
import { Callout } from './extensions/CalloutExtension';
import { Toggle } from './extensions/ToggleExtension';
import { MathBlock, MathInline } from './extensions/MathExtension';
import { DataTable } from './extensions/DataTableExtension';
import { FontSize } from './extensions/FontSizeExtension';
import { LinkDialog } from './modals/LinkDialog';

const lowlight = createLowlight(common);

interface NotionEditorProps {
  content: any;
  onUpdate: (content: any) => void;
  placeholder?: string;
  pageId?: string;
  onToCUpdate?: (items: any[]) => void;
}

export const NotionEditor = forwardRef<any, NotionEditorProps>(({ content, onUpdate, placeholder = "Type '/' for commands...", pageId, onToCUpdate }, ref) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [counts, setCounts] = useState({ characters: 0, words: 0 });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        dropcursor: false,
        codeBlock: false,
      }),
      Dropcursor.configure({
        color: '#3b82f6',
        width: 4,
        class: 'drop-cursor-line',
      }),
      TableOfContents.configure({
        getIndex: getHierarchicalIndexes,
        onUpdate: (content) => {
          onToCUpdate?.(content);
        },
      }),
      Placeholder.configure({
        placeholder,
        includeChildren: true,
        showOnlyCurrent: false,
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
        HTMLAttributes: {
          class: 'rounded-sm px-1',
        },
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
      FontFamily,
      FontSize,
      Color,
      // Custom extensions
      Callout,
      Toggle,
      MathBlock,
      MathInline,
      DataTable,
      SlashCommands,
    ],
    content: content?.content || '',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[calc(100vh-200px)] px-4 py-2',
      },
    },
    onCreate: ({ editor }) => {
      setCounts({
        characters: editor.storage.characterCount?.characters() ?? 0,
        words: editor.storage.characterCount?.words() ?? 0,
      });
    },
    onUpdate: ({ editor }) => {
      // Trigger character count update
      setCounts({
        characters: editor.storage.characterCount?.characters() ?? 0,
        words: editor.storage.characterCount?.words() ?? 0,
      });

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onUpdate({ content: editor.getHTML() });
      }, 500);
    },
  });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDialogConfig, setLinkDialogConfig] = useState<{
    title: string;
    initialValue: string;
    type: 'link' | 'image';
    onConfirm: (url: string) => void;
  }>({
    title: "Insert Link",
    initialValue: "",
    type: 'link',
    onConfirm: () => { },
  });

  const openLinkDialog = (config: typeof linkDialogConfig) => {
    setLinkDialogConfig(config);
    setLinkDialogOpen(true);
  };

  useEffect(() => {
    const handleOpenDialog = (e: any) => {
      openLinkDialog(e.detail);
    };

    window.addEventListener('open-link-dialog', handleOpenDialog);
    return () => window.removeEventListener('open-link-dialog', handleOpenDialog);
  }, []);

  useImperativeHandle(ref, () => editor);

  useEffect(() => {
    if (editor && pageId) {
      const targetContent = content?.content || '';
      editor.commands.setContent(targetContent);
    }
  }, [editor, pageId]); // Reset content only when pageId changes

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
      <TableBubbleMenu editor={editor} />
      <ContentItemMenu editor={editor} />
      <EditorContent editor={editor} />

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        title={linkDialogConfig.title}
        initialValue={linkDialogConfig.initialValue}
        type={linkDialogConfig.type}
        onConfirm={linkDialogConfig.onConfirm}
      />
      {/* Character count footer */}
      <div className="fixed bottom-4 right-4 z-50 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border shadow-sm pointer-events-none">
        {counts.characters} characters · {counts.words} words
      </div>
    </div>
  );
});
