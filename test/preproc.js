/* eslint-disable no-unused-vars */
export default function (markdown, _options) {
  return new Promise((resolve, _reject) => {
    const output = markdown
      .split('\n')
      .map((line, index) => {
        if (!/^#/.test(line) || index === 0) return line;
        const is_vertical = /#\^/.test(line);
        return (is_vertical ? '\n----\n\n' : '\n---\n\n') + line.replace('#^', '#');
      })
      .join('\n');

    return resolve(output);
  });
}
