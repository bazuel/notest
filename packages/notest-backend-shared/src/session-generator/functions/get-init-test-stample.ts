export function getInitTestSampleCode(
  testTimeout: number,
  viewPort: { width: number; height: number }
): string {
  return `
    import {Page, Browser, chromium, selectors, request} from "playwright";
    
    global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
        
    jest.setTimeout(${testTimeout});    
    
    let page: Page;
    const viewport = { width: ${viewPort.width}, height: ${viewPort.height} };
    const browserOptions = { headless: false };
    
    async function initContext() {
      const browser: Browser = await chromium.launch(browserOptions);
      return await browser.newContext({ viewport }).then((context) => {
        addCookies(context);
        return context;
      });
    }
    
    async function initPage() {
      const context = await initContext();
      page = await context.newPage();
    }
  
    async function end() {
      await page.close();
    }
    
    beforeAll(async () => {
      await initPage();
      await selectors.register('xy', createTagNameEngine);
    });
    
    afterAll(async () => {
      await end();
    });
    
    const createTagNameEngine = () => ({
      query(root, selector) {
          const x = +selector.split(',')[0]
          const y = +selector.split(',')[1]
          return root.elementFromPoint(x,y);
      },
  
      queryAll(root, selector) {
          const x = +selector.split(',')[0]
          const y = +selector.split(',')[1]
          return root.elementsFromPoint(x,y);
      }
    });
  `;
}
