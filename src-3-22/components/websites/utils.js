import Resizer from 'react-image-file-resizer';

export const resizeFile = (file, maxWidth = 300, maxHeight = 300) =>
  new Promise(resolve => {
    Resizer.imageFileResizer(
      file,
      maxWidth,
      maxHeight,
      'PNG',
      100,
      0,
      uri => {
        resolve(uri);
      },
      'blob',
    );
  });

export const draftJSEditorContent = (editorContent) => {
  const firstTag = editorContent.slice(0, 3);

  if (!firstTag.includes('<p>'))
    return `<p></p>${editorContent}`

  return editorContent
}

export const DefaultColor = {
  primary: 'var(--app-skyblue-dark)',
  primaryText: 'var(--app-white)',
  secondary: 'var(--app-blue-dark)',
  secondaryText: 'var(--app-white)',
  tertiary: 'var(--app-yellow-dark)',
  highlightText: 'var(--app-skyblue-dark)',
  footerBg: 'var(--app-blue-dark)',
  headingColor: 'var(--app-blue-dark)',
  bodyBg: 'var(--app-white)',
};
