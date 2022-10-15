import { useToast } from '@chakra-ui/react';
import React, { PropsWithChildren, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen } from "react-icons/ai";
import { BsTrashFill } from "react-icons/bs";
import { RenderLogger } from 'src/interfaces/renderLogger';
import { ReactSetState } from 'src/types/reactUtils';
import { ContextMenu } from './base/ContextMenu';
import { ContextMenuCategory } from './base/ContextMenuCategory';
import { ContextMenuItem } from './base/ContextMenuItem';
import { ContextMenuList } from './base/ContextMenuList';
import { ContextMenuTrigger } from './base/ContextMenuTrigger';
import RenameItem from './both/RenameItem';
import DeleteItem from './both/DeleteItem';
import ShareMenuItem from './cloud/ShareMenuItem';
import UploadMenuItem from './cloud/UploadMenuItem';

type Props = {
    clipName: string,
    setUpdate: ReactSetState<number>,
    setOpen?: ReactSetState<boolean>,
    uploaded: boolean,
    cloudDisabled: boolean
}

const log = RenderLogger.get("Components", "ClipContextMenu")
export default function ClipContextMenu({ children, clipName, setUpdate, setOpen, uploaded, cloudDisabled }: PropsWithChildren<Props>) {
    const { system, cloud } = window.api
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const [isCloudDeleting, setCloudDeleting] = useState(false)

    const toast = useToast()

    return <><ContextMenu setOpen={setOpen}>
        <ContextMenuTrigger>
            {children}
        </ContextMenuTrigger>
        <ContextMenuList>
            <ContextMenuCategory>{t("local")}</ContextMenuCategory>
            <ContextMenuItem
                onClick={() => system.open_clip(clipName)}
                leftIcon={<AiFillFolderOpen />}
            >{t("show_folder")}</ContextMenuItem>
            <RenameItem baseName={clipName} type={"clips"} uploaded={uploaded} setUpdate={setUpdate} />
            <DeleteItem baseName={clipName} setUpdate={setUpdate} />
            <ContextMenuCategory>{t("cloud")}</ContextMenuCategory>
            {!uploaded ?
                <UploadMenuItem clipName={clipName} disabled={cloudDisabled} setUpdate={setUpdate} /> :
                <ShareMenuItem clipName={clipName} />
            }
            <ContextMenuItem
                isDisabled={cloudDisabled || isCloudDeleting || !uploaded}
                colorScheme='red'
                isLoading={isCloudDeleting}
                onClick={() => {
                    setCloudDeleting(true)
                    cloud.deleteClip(clipName.replace(".clipped.mp4", ""))
                        .catch(e => {
                            log.error(e)
                            toast({
                                status: "error",
                                title: "Could not delete clip",
                                description: e?.stack ?? e,
                                duration: 4000
                            })
                        })
                        .finally(() => {
                            console.log("Sending update to outer")
                            setUpdate(Math.random())
                            setCloudDeleting(false)
                        })
                }}
                leftIcon={<BsTrashFill />}
            >{t("delete")}</ContextMenuItem>
        </ContextMenuList>
    </ContextMenu>
    </>
}