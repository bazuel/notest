import { selectors } from 'playwright';

export async function addPositionSelector() {
  const createTagNameEngine = () => ({
    query(root, selector) {
      const x = +selector.split(',')[0];
      const y = +selector.split(',')[1];
      return root.elementFromPoint(x, y);
    },
    queryAll(root, selector) {
      const x = +selector.split(',')[0];
      const y = +selector.split(',')[1];
      return root.elementsFromPoint(x, y);
    }
  });
  try {
    await selectors.register('xy', createTagNameEngine);
  } catch (e) {
    console.log('xy selector already registered');
  }
}
