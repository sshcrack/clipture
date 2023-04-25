import { useDisclosure } from "@chakra-ui/react";
import React, {
    RefObject, useEffect, useRef,
    useState
} from "react";
import { ReactSetState } from 'src/types/reactUtils';

type Props = {
    setOpen?: ReactSetState<boolean>
};

type MousePosition = {
    x: number;
    y: number;
};

type ContextMenuState = {
    isOpen: boolean;
    closeMenu: () => void;
    openMenu: () => void;
    menuRef?: RefObject<HTMLDivElement>;
    position: MousePosition;
    setPosition: React.Dispatch<React.SetStateAction<MousePosition>>;
};

export const ContextMenuContext = React.createContext<ContextMenuState>({
    isOpen: false,
    closeMenu: () => {/**/ },
    openMenu: () => {/**/ },
    menuRef: undefined,
    position: { x: 0, y: 0 },
    setPosition: () => {/**/ },
});

export const ContextMenu = ({ children, setOpen }: React.PropsWithChildren<Props>) => {
    const { isOpen, onClose: closeMenu, onOpen: openMenu } = useDisclosure();
    const [position, setPosition] = useState<MousePosition>({ x: -10000, y: -10000 });
    const [prevOpen, setPrevOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (prevOpen !== isOpen)
            setOpen && setOpen(isOpen)

        setPrevOpen(isOpen)
    }, [isOpen])
    return (
        <ContextMenuContext.Provider
            value={{
                isOpen,
                closeMenu,
                openMenu,
                menuRef,
                position,
                setPosition,
            }}
        >
            {children}
        </ContextMenuContext.Provider>
    );
};
