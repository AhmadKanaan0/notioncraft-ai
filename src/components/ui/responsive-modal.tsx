"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

const ResponsiveModalContext = React.createContext<{ isMobile: boolean }>({
    isMobile: false,
})

const useResponsiveModal = () => {
    const context = React.useContext(ResponsiveModalContext)
    if (!context) {
        throw new Error("ResponsiveModal components must be used within ResponsiveModal")
    }
    return context
}

const ResponsiveModal = ({
    children,
    ...props
}: React.ComponentProps<typeof Dialog>) => {
    const isMobile = useIsMobile()
    const Modal = isMobile ? Drawer : Dialog

    return (
        <ResponsiveModalContext.Provider value={{ isMobile: isMobile }}>
            <Modal {...props}>{children}</Modal>
        </ResponsiveModalContext.Provider>
    )
}

const ResponsiveModalTrigger = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogTrigger>) => {
    const { isMobile } = useResponsiveModal()
    const Trigger = isMobile ? DrawerTrigger : DialogTrigger

    return <Trigger className={className} {...props} />
}

const ResponsiveModalContent = ({
    children,
    className,
    ...props
}: React.ComponentProps<typeof DialogContent>) => {
    const { isMobile } = useResponsiveModal()

    if (isMobile) {
        return (
            <DrawerContent className={className} {...props}>
                {children}
            </DrawerContent>
        )
    }

    return (
        <DialogContent className={className} {...props}>
            {children}
        </DialogContent>
    )
}

const ResponsiveModalHeader = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogHeader>) => {
    const { isMobile } = useResponsiveModal()
    const Header = isMobile ? DrawerHeader : DialogHeader

    return <Header className={className} {...props} />
}

const ResponsiveModalTitle = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogTitle>) => {
    const { isMobile } = useResponsiveModal()
    const Title = isMobile ? DrawerTitle : DialogTitle

    return <Title className={className} {...props} />
}

const ResponsiveModalDescription = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogDescription>) => {
    const { isMobile } = useResponsiveModal()
    const Description = isMobile ? DrawerDescription : DialogDescription

    return <Description className={className} {...props} />
}

const ResponsiveModalFooter = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogFooter>) => {
    const { isMobile } = useResponsiveModal()

    if (isMobile) {
        return <DrawerFooter className={className} {...props} />
    }

    return <DialogFooter className={className} {...props} />
}

const ResponsiveModalClose = ({
    className,
    ...props
}: React.ComponentProps<typeof DialogClose>) => {
    const { isMobile } = useResponsiveModal()
    const Close = isMobile ? DrawerClose : DialogClose

    return <Close className={className} {...props} />
}

export {
    ResponsiveModal,
    ResponsiveModalTrigger,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
    ResponsiveModalDescription,
    ResponsiveModalFooter,
    ResponsiveModalClose,
}
