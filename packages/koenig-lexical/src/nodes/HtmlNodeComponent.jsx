import CardContext from '../context/CardContext';
import KoenigComposerContext from '../context/KoenigComposerContext.jsx';
import React from 'react';
import {$getNodeByKey} from 'lexical';
import {ActionToolbar} from '../components/ui/ActionToolbar.jsx';
import {DESELECT_CARD_COMMAND, EDIT_CARD_COMMAND, SHOW_CARD_VISIBILITY_SETTINGS_COMMAND} from '../plugins/KoenigBehaviourPlugin.jsx';
import {HtmlCard} from '../components/ui/cards/HtmlCard';
import {SettingsPanel} from '../components/ui/SettingsPanel.jsx';
import {SnippetActionToolbar} from '../components/ui/SnippetActionToolbar.jsx';
import {ToolbarMenu, ToolbarMenuItem, ToolbarMenuSeparator} from '../components/ui/ToolbarMenu.jsx';
import {VisibilitySettings} from '../components/ui/VisibilitySettings.jsx';
import {useKoenigSelectedCardContext} from '../context/KoenigSelectedCardContext.jsx';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useVisibilityToggle} from '../hooks/useVisibilityToggle.js';

export function HtmlNodeComponent({nodeKey, html}) {
    const [editor] = useLexicalComposerContext();
    const cardContext = React.useContext(CardContext);
    const {cardConfig, darkMode} = React.useContext(KoenigComposerContext);
    const [showSnippetToolbar, setShowSnippetToolbar] = React.useState(false);

    const {showVisibilitySettings} = useKoenigSelectedCardContext();

    const isContentVisibilityEnabled = cardConfig?.feature?.contentVisibility || false;

    const {visibilityOptions, toggleVisibility} = useVisibilityToggle(editor, nodeKey, cardConfig);

    const settingsTabs = [
        {id: 'visibility', label: 'Visibility'}
    ];

    const updateHtml = (value) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.html = value;
        });
    };

    const handleToolbarEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        editor.dispatchCommand(EDIT_CARD_COMMAND, {cardKey: nodeKey, focusEditor: false});
    };

    // TODO: this isn't used? <HtmlCard> does not have a prop for `onBlur`
    const onBlur = (event) => {
        if (event?.relatedTarget?.className !== 'kg-prose') {
            editor.dispatchCommand(DESELECT_CARD_COMMAND, {cardKey: nodeKey});
        }
    };

    const visibilitySettings = (
        <VisibilitySettings
            toggleVisibility={toggleVisibility}
            visibilityOptions={visibilityOptions}
        />
    );

    const handleVisibilityToggle = React.useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        editor.dispatchCommand(SHOW_CARD_VISIBILITY_SETTINGS_COMMAND, {cardKey: nodeKey});
    }, [editor, nodeKey]);

    return (
        <>
            <HtmlCard
                darkMode={darkMode}
                html={html}
                isEditing={cardContext.isEditing}
                updateHtml={updateHtml}
                onBlur={onBlur}
            />

            <ActionToolbar
                data-kg-card-toolbar="html"
                isVisible={showSnippetToolbar}
            >
                <SnippetActionToolbar onClose={() => setShowSnippetToolbar(false)} />
            </ActionToolbar>

            <ActionToolbar
                data-kg-card-toolbar="html"
                isVisible={(cardContext.isSelected && !showSnippetToolbar && !cardContext.isEditing)}
            >
                <ToolbarMenu>
                    <ToolbarMenuItem
                        dataTestId="edit-html"
                        icon="edit"
                        isActive={false}
                        label="Edit"
                        onClick={handleToolbarEdit}
                    />
                    {isContentVisibilityEnabled && (
                        <>
                            <ToolbarMenuSeparator />
                            <ToolbarMenuItem
                                dataTestId="show-visibility"
                                icon="visibility"
                                isActive={showVisibilitySettings}
                                label="Visibility"
                                onClick={handleVisibilityToggle}
                            />
                        </>
                    )}
                    <ToolbarMenuSeparator hide={!cardConfig.createSnippet} />
                    <ToolbarMenuItem
                        dataTestId="create-snippet"
                        hide={!cardConfig.createSnippet}
                        icon="snippet"
                        isActive={false}
                        label="Save as snippet"
                        onClick={() => setShowSnippetToolbar(true)}
                    />
                </ToolbarMenu>
            </ActionToolbar>

            {isContentVisibilityEnabled && showVisibilitySettings && cardContext.isSelected && (
                <SettingsPanel
                    darkMode={darkMode}
                    defaultTab="visibility"
                    tabs={settingsTabs}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    {{
                        visibility: visibilitySettings
                    }}
                </SettingsPanel>
            )}
        </>
    );
}
