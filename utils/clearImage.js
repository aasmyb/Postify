const fs = require('fs');
const path = require('path');

module.exports = (fileName, collection) => {
  const filePath = path.join(
    __dirname,
    '..',
    'public',
    'img',
    collection,
    fileName
  );
  fs.unlink(filePath, err => console.log(err));
};
