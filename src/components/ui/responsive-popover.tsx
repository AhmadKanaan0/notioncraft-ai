"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"

const ResponsivePopoverContext = React.createContext<{ isMobile: boolean }>({
    isMobile: false,
})

const useResponsivePopover = () => {
    const context = React.useContext(ResponsivePopoverContext)
    if (!context) {
        throw new Error("ResponsivePopover components must be used within ResponsivePopover")
    }
    return context
}

const ResponsivePopover = ({
    children,
    ...props
}: React.ComponentProps<typeof Popover>) => {
    const isMobile = useIsMobile()
    const Component = isMobile ? Drawer : Popover

    return (
        <ResponsivePopoverContext.Provider value={{ isMobile: isMobile }}>
            <Component {...props}>{children}</Component>
        </ResponsivePopoverContext.Provider>
    )
}

const ResponsivePopoverTrigger = ({
    className,
    ...props
}: React.ComponentProps<typeof PopoverTrigger>) => {
    const { isMobile } = useResponsivePopover()
    const Trigger = isMobile ? DrawerTrigger : PopoverTrigger

    return <Trigger className={className} {...props} />
}

const ResponsivePopoverContent = ({
    children,
    className,
    ...props
}: React.ComponentProps<typeof PopoverContent> & {
    side?: "top" | "right" | "bottom" | "left" | null
}) => {
    const { isMobile } = useResponsivePopover()

    if (isMobile) {
        return (
            <DrawerContent className={className}>
                <div className="mx-auto w-full">
                    {children}
                </div>
            </DrawerContent>
        )
    }

    return (
        <PopoverContent className={className} {...props}>
            {children}
        </PopoverContent>
    )
}

export {
    ResponsivePopover,
    ResponsivePopoverTrigger,
    ResponsivePopoverContent,
}
