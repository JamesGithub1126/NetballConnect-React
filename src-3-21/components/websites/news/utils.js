export const generatePostUrlFromTitle = (title, path = '/news/') => {
    const titleForm = title
        .trim()
        .toLowerCase()
        .replace("'", '')
        .replace('’', '')
        .replace(/ /g, '-');

    return `${path}${titleForm}`;
};
