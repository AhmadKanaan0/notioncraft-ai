'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Subscript,
  Superscript,
  Palette,
  Unlink,
  Type,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BubbleToolbarProps {
  editor: Editor;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Purple', value: '#ddd6fe' },
];

const TEXT_COLORS = [
  { name: 'Default', value: 'inherit' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
];

const FONT_FAMILIES = [
  { name: 'Default', value: '' },
  { name: 'Sans Serif', value: 'ui-sans-serif, system-ui, sans-serif' },
  { name: 'Serif', value: 'ui-serif, Georgia, serif' },
  { name: 'Mono', value: 'ui-monospace, monospace' },
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
];

const FONT_SIZES = [
  { name: 'Small', value: '12px' },
  { name: 'Normal', value: '' },
  { name: 'Large', value: '18px' },
  { name: 'XL', value: '24px' },
  { name: 'XXL', value: '32px' },
];

export function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [fontFamilyOpen, setFontFamilyOpen] = useState(false);
  const [fontSizeOpen, setFontSizeOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (!hasSelection) {
      // Don't hide if a popover is open
      const isAnyPopoverOpen = showLinkInput || fontFamilyOpen || fontSizeOpen || highlightOpen || textColorOpen;
      if (!isAnyPopoverOpen) {
        setIsVisible(false);
      }
      return;
    }

    const { view } = editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);

    let left = (start.left + end.left) / 2;
    let top = start.top - 50;

    // Boundary constraints
    const padding = 20;
    const toolbarWidth = toolbarRef.current?.offsetWidth || 400; // Fallback to estimated width
    const toolbarHeight = toolbarRef.current?.offsetHeight || 44;

    // Viewport width check
    const minLeft = toolbarWidth / 2 + padding;
    const maxLeft = window.innerWidth - toolbarWidth / 2 - padding;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    // Viewport height check (top)
    if (top < padding) {
      top = end.bottom + 10; // Show below selection if no space above
    }

    setPosition({ top, left });
    setIsVisible(true);
  }, [editor, showLinkInput, fontFamilyOpen, fontSizeOpen, highlightOpen, textColorOpen]);

  useEffect(() => {
    if (!editor) return;

    editor.on('selectionUpdate', updatePosition);

    const handleBlur = () => {
      // Delay to allow toolbar interaction
      setTimeout(() => {
        const isAnyPopoverOpen = showLinkInput || fontFamilyOpen || fontSizeOpen || highlightOpen || textColorOpen;
        if (!isAnyPopoverOpen) {
          setIsVisible(false);
        }
      }, 200);
    };

    editor.on('blur', handleBlur);

    editor.on('blur', handleBlur);

    const handleGlobalDragStart = () => {
      setIsDragging(true);
      document.body.classList.add('is-dragging');
    };

    const handleGlobalDragEnd = () => {
      setIsDragging(false);
      document.body.classList.remove('is-dragging');
    };

    // Use window events to capture drags from anywhere (like the handle)
    window.addEventListener('dragstart', handleGlobalDragStart);
    window.addEventListener('dragend', handleGlobalDragEnd);
    window.addEventListener('drop', handleGlobalDragEnd);

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('blur', handleBlur);
      window.removeEventListener('dragstart', handleGlobalDragStart);
      window.removeEventListener('dragend', handleGlobalDragEnd);
      window.removeEventListener('drop', handleGlobalDragEnd);
    };
  }, [editor, updatePosition, showLinkInput, fontFamilyOpen, fontSizeOpen, highlightOpen, textColorOpen]);

  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';

    const event = new CustomEvent('open-link-dialog', {
      detail: {
        title: previousUrl ? 'Edit Link' : 'Insert Link',
        type: 'link',
        initialValue: previousUrl,
        onConfirm: (url: string) => {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
      }
    });
    window.dispatchEvent(event);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
    disabled,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        'h-8 w-8 p-0 hover:bg-accent',
        isActive && 'bg-accent text-accent-foreground'
      )}
      title={title}
    >
      {children}
    </Button>
  );

  const Divider = () => <div className="w-px h-5 bg-border mx-0.5" />;

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed z-50 flex items-center gap-0.5 p-1 rounded-lg bg-popover border border-border shadow-lg transition-all duration-200",
        "overflow-x-auto scrollbar-hide",
        isVisible && !isDragging ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
      )}
      style={{
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100vw - 20px)',
      }}
    >
      {/* Font selectors */}
      <Popover open={fontFamilyOpen} onOpenChange={setFontFamilyOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onMouseDown={(e) => e.preventDefault()}
            title="Font Family"
          >
            <Type className="h-4 w-4 mr-1" />
            Font
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          {FONT_FAMILIES.map((font) => (
            <Button
              key={font.value}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              style={{ fontFamily: font.value || 'inherit' }}
              onMouseDown={(e) => {
                e.preventDefault();
                if (font.value) {
                  // Try the extension command, fallback to mark if not available
                  if (typeof editor.commands.setFontFamily === 'function') {
                    editor.chain().focus().setFontFamily(font.value).run();
                  } else {
                    editor.chain().focus().setMark('textStyle', { fontFamily: font.value }).run();
                  }
                } else {
                  if (typeof editor.commands.unsetFontFamily === 'function') {
                    editor.chain().focus().unsetFontFamily().run();
                  } else {
                    editor.chain().focus().unsetMark('textStyle').run();
                  }
                }
              }}
            >
              {font.name}
            </Button>
          ))}
        </PopoverContent>
      </Popover>

      <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onMouseDown={(e) => e.preventDefault()}
            title="Font Size"
          >
            Size
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-24 p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
          {FONT_SIZES.map((size) => (
            <Button
              key={size.value}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onMouseDown={(e) => {
                e.preventDefault();
                if (size.value) {
                  if (typeof editor.commands.setFontSize === 'function') {
                    editor.chain().focus().setFontSize(size.value).run();
                  } else {
                    editor.chain().focus().setMark('textStyle', { fontSize: size.value }).run();
                  }
                } else {
                  if (typeof editor.commands.unsetFontSize === 'function') {
                    editor.chain().focus().unsetFontSize().run();
                  } else {
                    editor.chain().focus().unsetMark('textStyle').run();
                  }
                }
              }}
            >
              {size.name}
            </Button>
          ))}
        </PopoverContent>
      </Popover>

      <Divider />

      {/* Text formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Subscript/Superscript */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive('subscript')}
        title="Subscript"
      >
        <Subscript className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive('superscript')}
        title="Superscript"
      >
        <Superscript className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      {/* Link */}
      <div className="flex items-center">
        <ToolbarButton
          onClick={handleSetLink}
          isActive={editor.isActive('link')}
          title="Add/Edit Link"
        >
          <Link className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton
            onClick={handleRemoveLink}
            title="Remove Link"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Unlink className="h-4 w-4" />
          </ToolbarButton>
        )}
      </div>

      <Divider />

      {/* Highlight */}
      <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              'h-8 w-8 p-0 hover:bg-accent',
              editor.isActive('highlight') && 'bg-accent text-accent-foreground'
            )}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color.value }}
                onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                title={color.name}
              />
            ))}
            <button
              className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center text-xs"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              title="Remove highlight"
            >
              ✕
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Text Color */}
      <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            className="h-8 w-8 p-0 hover:bg-accent"
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.value}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center"
                style={{ color: color.value === 'inherit' ? undefined : color.value }}
                onClick={() => {
                  if (color.value === 'inherit') {
                    editor.chain().focus().unsetColor().run();
                  } else {
                    editor.chain().focus().setColor(color.value).run();
                  }
                }}
                title={color.name}
              >
                A
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Divider />

      {/* Text Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
