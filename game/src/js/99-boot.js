/* ================= BOOT ================= */
if(window.IMG_MANIFEST){Object.assign(IMG,window.IMG_MANIFEST);imgTried=true;fixPhotos();}
// 0.25: фото для кинохроники (ключи «x:…») — вшиты рядом с игрой
if(window.IMG_EXTRA)Object.assign(IMG,window.IMG_EXTRA);
if(window.MUSIC_MANIFEST){AU.tracks=window.MUSIC_MANIFEST;}
loadImages();
showMainMenu();
