function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    const msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

export function copyToClipboard(text: string) {
  const clip = (navigator as any).clipboard;
  if (!clip) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  clip.writeText(text).then(
    function () {
      console.log('Clipboard: ' + text);
    },
    function (err) {
      console.error('Could not copy text to clipboard: ', err);
    }
  );
}