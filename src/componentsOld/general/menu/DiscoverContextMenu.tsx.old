import React, { PropsWithChildren } from "react";
import { useTranslation } from 'react-i18next';
import { ReactSetState } from 'src/types/reactUtils';
import { ContextMenu } from './base/ContextMenu';
import { ContextMenuCategory } from './base/ContextMenuCategory';
import { ContextMenuList } from './base/ContextMenuList';
import { ContextMenuTrigger } from './base/ContextMenuTrigger';
import ShareMenuItem from "./cloud/ShareMenuItem"

type Props = {
    cloudId: string
    setOpen?: ReactSetState<boolean>
}

export default function DiscoverContextMenu({ children, cloudId, setOpen }: PropsWithChildren<Props>) {
    const { t } = useTranslation("general", { keyPrefix: "menu.context_menu" })

    return <>
        <ContextMenu setOpen={setOpen}>
            <ContextMenuTrigger>
                {children}
            </ContextMenuTrigger>
            <ContextMenuList>
                <ContextMenuCategory name={t("cloud")}>
                    <ShareMenuItem clipName={cloudId} cloud={{ cloudOnly: true, isPublic: true, id: cloudId }} />
                </ContextMenuCategory>
            </ContextMenuList>
        </ContextMenu>
    </>
}