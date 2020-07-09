import {addParameters, addDecorator} from '@storybook/react';
import axaTheme from './axa-theme';
import {withA11y} from '@storybook/addon-a11y';
import {withKnobs} from '@storybook/addon-knobs';
import {addReadme} from 'storybook-readme';

addDecorator(withKnobs);
addDecorator(withA11y);
addDecorator(addReadme);

addParameters({
    options: {
        isFullScreen: false,
        showNav: true,
        showPanel: true,
        panelPosition: 'bottom',
        sortStoriesByKind: false,
        hierarchySeparator: /\/|\./,
        hierarchyRootSeparator: /\|/,
        sidebarAnimations: true,
        enableShortcuts: true,
        theme: axaTheme
    }
});
