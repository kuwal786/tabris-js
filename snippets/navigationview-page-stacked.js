import {Button, NavigationView, Page, contentView} from 'tabris';

let pageCount = 0;

const navigationView = new NavigationView({
  left: 0, top: 0, right: 0, bottom: 0
}).appendTo(contentView);

createPage();

function createPage(title) {
  const page = new Page({
    title: title || 'Initial Page'
  }).appendTo(navigationView);
  new Button({
    left: 16, top: 16, right: 16,
    text: 'Create another page'
  }).on('select', () => createPage('Page ' + (++pageCount)))
    .appendTo(page);
  new Button({
    left: 16, top: 'prev() 16', right: 16,
    text: 'Go back'
  }).on('select', () => page.dispose())
    .appendTo(page);
  new Button({
    left: 16, top: 'prev() 16', right: 16,
    text: 'Go to initial page'
  }).on('select', () => {
    navigationView.pages().dispose();
    createPage();
  }).appendTo(page);
  return page;
}
