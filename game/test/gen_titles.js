// Список статей и точных файлов для фото: tools/titles.json и tools/photo_files.json (читает tools/fetch_images.py)
const fs=require('fs'),path=require('path');
require('./harness.js')(`
const root=path.join(__dirname,'..','..','tools');
const titles=allTitles();fs.writeFileSync(path.join(root,'titles.json'),JSON.stringify(titles,null,1));
fs.writeFileSync(path.join(root,'photo_files.json'),JSON.stringify(PHOTO_FILE,null,1));
console.log('titles',titles.length,'files',Object.keys(PHOTO_FILE).length,'missing in titles:',Object.keys(PHOTO_FILE).filter(t=>!titles.includes(t)).join(', '));
`);
