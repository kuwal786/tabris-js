import {Tab, TabFolder, TextView, contentView} from 'tabris';

const tabFolder = new TabFolder({
  left: 0, top: 0, right: 0, bottom: 0,
  paging: true,
  tabBarLocation: 'hidden'
}).appendTo(contentView);

for (let i = 1; i <= 3; i++) {
  createTab('Page ' + i);
}

function createTab(text) {
  const tab = new Tab().appendTo(tabFolder);
  new TextView({
    centerX: 0, centerY: 0,
    text
  }).appendTo(tab);
}
