import { SwarmUnitPage } from './app.po';

describe('swarm-unit App', () => {
  let page: SwarmUnitPage;

  beforeEach(() => {
    page = new SwarmUnitPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
