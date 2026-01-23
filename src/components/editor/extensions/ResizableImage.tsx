import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { useCallback, useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

function ResizableImageNodeView({ node, updateAttributes, selected }: any) {
    const [width, setWidth] = useState(node.attrs.width)
    const [height, setHeight] = useState(node.attrs.height)
    const [resizing, setResizing] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })
    const [startDims, setStartDims] = useState({ width: 0, height: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setWidth(node.attrs.width)
        setHeight(node.attrs.height)
    }, [node.attrs.width, node.attrs.height])

    const onMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
        e.preventDefault()
        setResizing(true)
        setStartPos({ x: e.clientX, y: e.clientY })

        // Get current dimensions from the image element or node attributes
        const currentWidth = node.attrs.width ? parseInt(node.attrs.width) : (containerRef.current?.offsetWidth || 0)
        // We mainly care about width for resizing in this context usually, but let's track both

        setStartDims({
            width: currentWidth || 300, // Fallback
            height: 0
        })

        const onMouseMove = (e: MouseEvent) => {
            const diffX = e.clientX - startPos.x

            let newWidth = startDims.width + diffX

            if (newWidth < 100) newWidth = 100 // Min width

            updateAttributes({ width: newWidth })
            setWidth(newWidth)
        }

        const onMouseUp = () => {
            setResizing(false)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        // Need to attach to document to handle drag outside
        // We'll actually do a simpler version first: attach listeners here but use mutable refs or closure if needed
        // Actually, typical way:
        document.addEventListener('mousemove', (moveEvent) => {
            if (!resizing) return; // This won't work due to closure, need to define function inside
        })
    }, [])

    // Re-implementing resize logic cleanly

    const startResize = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const startX = e.clientX
        const startWidth = width ? parseInt(width) : (containerRef.current?.querySelector('img')?.offsetWidth || 300)

        const onMouseMove = (moveEvent: MouseEvent) => {
            const currentX = moveEvent.clientX
            const diff = currentX - startX
            const newWidth = Math.max(100, startWidth + diff)

            setWidth(newWidth)
            updateAttributes({ width: newWidth })
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    return (
        <NodeViewWrapper className="resize-image-wrapper relative inline-block group">
            <div
                ref={containerRef}
                className={cn(
                    "relative",
                    selected && "ring-2 ring-primary rounded-lg"
                )}
                style={{ width: width ? `${width}px` : 'auto', maxWidth: '100%' }}
            >
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt}
                    className="rounded-lg max-w-full h-auto"
                />
                {/* Resize Handle */}
                <div
                    className={cn(
                        "absolute right-2 bottom-2 w-4 h-4 bg-primary/50 rounded cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity",
                        selected && "opacity-100"
                    )}
                    onMouseDown={startResize}
                />
            </div>
        </NodeViewWrapper>
    )
}

export const ResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
            },
            height: {
                default: null,
            },
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageNodeView)
    },
})
