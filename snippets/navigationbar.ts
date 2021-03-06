import { Picker, TextView, contentView, navigationBar, NavigationBar } from 'tabris';

const THEMES: Array<NavigationBar['theme']> = ['default', 'light', 'dark'];
const DISPLAY_MODES: Array<NavigationBar['displayMode']> = ['default', 'float', 'hide'];
const BACKGROUNDS = [navigationBar.background, 'rgba(0, 0, 0, 0.25)', 'red', 'green', 'blue'];

createTextView('Theme', 'theme');
createTextView('Display mode', 'displayMode');
createTextView('Background', 'background');
createTextView('Height', 'height');

new Picker({
  left: '#displayMode 16', baseline: '#theme', right: 16,
  itemCount: THEMES.length,
  itemText: index => THEMES[index]
}).onSelect(({index}) => navigationBar.theme = THEMES[index])
  .appendTo(contentView);

new Picker({
  left: '#displayMode 16', baseline: '#displayMode', right: 16,
  itemCount: DISPLAY_MODES.length,
  itemText: index => DISPLAY_MODES[index]
}).onSelect(({index}) => navigationBar.displayMode = DISPLAY_MODES[index])
  .appendTo(contentView);

new Picker({
  left: '#displayMode 16', baseline: '#background', right: 16,
  itemCount: BACKGROUNDS.length,
  itemText: index => `${BACKGROUNDS[index]}`
}).onSelect(({index}) => navigationBar.background = BACKGROUNDS[index])
  .appendTo(contentView);

new TextView({
  left: '#displayMode 16', baseline: '#height', right: 16,
  text: `${navigationBar.height}`
}).appendTo(contentView);

function createTextView(text: string, id: string) {
  new TextView({
    id,
    left: 16, top: 'prev() 16',
    text
  }).appendTo(contentView);
}
