import React, { CSSProperties, useCallback } from 'react'
import { Grid } from 'react-virtualized'
import { MenuItemT, MenuListItem } from './menu-list-item'

export interface MenuListProps {
    rect: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    mainIndex: number;
    menulist: MenuItemT[];
    changeCheckState: (mainIndex: number, subIndex: number, check: boolean, isRadio?: boolean) => void;
}

type RendererProps = {
    columnIndex: number;
    rowIndex: number;
    key: string;
    style: CSSProperties;
}

export const MenuList: React.FC<MenuListProps> = ({ rect, mainIndex, menulist, changeCheckState }) => {
    const getRowHeight = useCallback(
        ({ index }: { index: number }): number => {
            const menuListItem = menulist[index]
            if (menuListItem.visiable === false) {
                return 0
            } else if (menuListItem.type === 'separator') {
                return 10
            } else {
                return 30
            }
        }, [menulist]
    )

    const MenuListRenderer = useCallback(({ key, rowIndex, style }: RendererProps) => (
        <MenuListItem key={key}
            curItem={menulist[rowIndex]}
            style={style}
            changeCheckState={changeCheckState}
            mainIndex={mainIndex}
            subIndex={rowIndex} />
    ), [menulist, changeCheckState, mainIndex])

    const menuListHeight = menulist.map((l, index) => getRowHeight({ index })).reduce((a, b) => a + b, 0)
    return (
        <div id="foldout-container" style={{
            position: 'absolute',
            top: rect.bottom,
            left: 0,
            width: '100%',
            height: `calc(100% - ${rect.bottom}px)`,
        }}>
            <div className="overlay" tabIndex={-1} />
            <div className="foldout" style={{
                position: 'absolute',
                marginLeft: rect.left,
                maxWidth: `calc(100% - ${rect.left}px)`,
                height: '100%',
                overflow: 'hidden',
                top: 0,
            }}>
                <div id="app-menu-foldout">
                    <div className="menu-pane" style={{
                        height: menuListHeight,
                        maxHeight: '100%',
                    }}>
                        <div className="list" role="menu">
                            {/*@ts-ignore*/}
                            <Grid
                                cellRenderer={MenuListRenderer}
                                columnCount={1}
                                rowCount={menulist.length}
                                columnWidth={240}
                                height={menuListHeight}
                                rowHeight={getRowHeight}
                                width={240}
                            />
                        </div>
                        <div className="menu-pane menu-endblock" />
                    </div>
                </div>
            </div>
        </div>
    )
}
