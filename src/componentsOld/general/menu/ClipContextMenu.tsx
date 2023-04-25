import { SessionStatus } from '@backend/managers/auth/interfaces';
import { ClipCloudInfo } from '@backend/managers/clip/interface';
import { useToast } from '@chakra-ui/react';
import React, { PropsWithChildren, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AiFillFolderOpen } from "react-icons/ai";
import { BsTrashFill } from "react-icons/bs";
import { useSession } from 'src/componentsOld/hooks/useSession';
import { RenderLogger } from 'src/interfaces/renderLogger';
import { ReactSetState } from 'src/types/reactUtils';
import { ContextMenu } from './base/ContextMenu';
import { ContextMenuCategory } from './base/ContextMenuCategory';
import { ContextMenuItem } from './base/ContextMenuItem';
import { ContextMenuList } from './base/ContextMenuList';
import { ContextMenuTrigger } from './base/ContextMenuTrigger';
import DeleteItem from './both/DeleteItem';
import RenameItem from './both/RenameItem';
import ShareMenuItem from './cloud/ShareMenuItem';
import UploadMenuItem from './cloud/UploadMenuItem';
import VisibilityMenuItem from './cloud/VisibilityMenuItem';

type Props = {
    clipName: string,
    setUpdate: ReactSetState<number>,
    setOpen?: ReactSetState<boolean>,
    uploaded: boolean,
    cloudDisabled: boolean,
    tooLarge: boolean,
    cloud: ClipCloudInfo
}

const log = RenderLogger.get("Components", "ClipContextMenu")
export default function ClipContextMenu({ children, clipName, setUpdate, setOpen, uploaded, cloudDisabled, tooLarge, cloud: cloudInfo }: PropsWithChildren<Props>) {
    const { system, cloud } = window.api
    const { status } = useSession()
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    const [isCloudDeleting, setCloudDeleting] = useState(false)
    const isOffline = status === SessionStatus.OFFLINE || status === SessionStatus.LOADING


    const cloudOnly = cloudInfo?.cloudOnly
    const toast = useToast()

    const localItems = <>
        <ContextMenuCategory name={t("local")}>
            <ContextMenuItem
                onClick={() => system.open_clip(clipName)}
                leftIcon={<AiFillFolderOpen />}
            >{t("show_folder")}</ContextMenuItem>
            <RenameItem baseName={clipName} type={"clips"} uploaded={uploaded} setUpdate={setUpdate} />
            <DeleteItem baseName={clipName} setUpdate={setUpdate} />
        </ContextMenuCategory>
    </>

    return <><ContextMenu setOpen={setOpen}>
        <ContextMenuTrigger>
            {children}
        </ContextMenuTrigger>
        <ContextMenuList>
            {!cloudOnly && localItems}
            <ContextMenuCategory
                name={t("cloud")}
                disabled={isOffline}
                tooltip={isOffline ? t("offline_unavailable") : ""}
            >
                {!uploaded ?
                    <UploadMenuItem clipName={clipName} disabled={cloudDisabled} setUpdate={setUpdate} tooLarge={tooLarge} /> :
                    <ShareMenuItem clipName={clipName} cloud={cloudInfo} />
                }
                <ContextMenuItem
                    isDisabled={cloudDisabled || isCloudDeleting || !uploaded}
                    colorScheme='red'
                    isLoading={isCloudDeleting}
                    onClick={() => {
                        setCloudDeleting(true)
                        const method = cloudOnly ? "deleteId" : "deleteClip"
                        const deleteId = cloudOnly ? cloudInfo.id : clipName.replace(".clipped.mp4", "")
                        cloud[method](deleteId)
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
                                setUpdate(Math.random())
                                setCloudDeleting(false)
                            })
                    }}
                    leftIcon={<BsTrashFill />}
                >{t("delete")}</ContextMenuItem>
                {cloudInfo && <VisibilityMenuItem cloud={cloudInfo} setUpdate={setUpdate} />}
            </ContextMenuCategory>
        </ContextMenuList>
    </ContextMenu>
    </>
}