import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, useDisclosure, useToast } from '@chakra-ui/react';
import React, { PropsWithChildren, useContext, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen } from "react-icons/ai";
import { BsTrashFill } from "react-icons/bs";
import { ReactSetState } from 'src/types/reactUtils';
import { SelectionContext } from '../info/SelectionProvider';
import { ContextMenu } from './base/ContextMenu';
import { ContextMenuCategory } from './base/ContextMenuCategory';
import { ContextMenuItem } from './base/ContextMenuItem';
import { ContextMenuList } from './base/ContextMenuList';
import { ContextMenuTrigger } from './base/ContextMenuTrigger';
import DeleteItem from './both/DeleteItem';
import RenameItem from './both/RenameItem';

type Props = {
    videoName: string,
    setUpdate: ReactSetState<number>,
    setOpen?: ReactSetState<boolean>
}

export default function VideoContextMenu({ children, videoName, setUpdate, setOpen }: PropsWithChildren<Props>) {
    const { system } = window.api
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    return <>
        <ContextMenu setOpen={setOpen}>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuList>
                <ContextMenuCategory>{t("local")}</ContextMenuCategory>
                <ContextMenuItem
                    onClick={() => system.open_clip(videoName)}
                    leftIcon={<AiFillFolderOpen />}
                >{t("show_folder")}</ContextMenuItem>
                <RenameItem baseName={videoName} type={"videos"} setUpdate={setUpdate} />
                <DeleteItem baseName={videoName} setUpdate={setUpdate} />
            </ContextMenuList>
        </ContextMenu>
    </>
}