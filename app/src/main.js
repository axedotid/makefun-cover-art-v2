import { renderCover, LAYOUTS, GRADES } from './cover.js';

const canvas = document.getElementById('coverCanvas');
const dropZone = document.getElementById('dropZone');
const photoInput = document.getElementById('photoInput');
const thumbs = document.getElementById('thumbs');
const layoutChips = document.getElementById('layoutChips');
const gradeChips = document.getElementById('gradeChips');
const captionInput = document.getElementById('caption');
const sizeSel = document.getElementById('size');
const exportBtn = document.getElementById('exportBtn');

const state = { photos: [], layout: 'duo', grade: 'sunset' };

LAYOUTS.forEach(l => {
  const b = document.createElement('button');
  b.textContent = l; b.dataset.layout = l;
  if (l === state.layout) b.classList.add('on');
  b.onclick = () => { state.layout = l; layoutChips.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.layout === l)); render(); };
  layoutChips.appendChild(b);
});

Object.keys(GRADES).forEach(g => {
  const b = document.createElement('button');
  b.textContent = g; b.dataset.grade = g;
  if (g === state.grade) b.classList.add('on');
  b.onclick = () => { state.grade = g; gradeChips.querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.grade === g)); render(); };
  gradeChips.appendChild(b);
});

function addPhotos(files) {
  for (const f of files) {
    if (!f.type.startsWith('image/')) continue;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      state.photos.push(img);
      const t = document.createElement('img');
      t.src = url; t.onclick = () => { thumbs.querySelectorAll('img').forEach(x => x.classList.remove('sel')); t.classList.add('sel'); };
      thumbs.appendChild(t);
      render();
    };
    img.src = url;
  }
}

dropZone.onclick = () => photoInput.click();
photoInput.onchange = e => addPhotos(e.target.files);
dropZone.ondragover = e => { e.preventDefault(); };
dropZone.ondrop = e => { e.preventDefault(); addPhotos(e.dataTransfer.files); };
captionInput.oninput = render;

function render() {
  const [w, h] = sizeSel.value.split('x').map(Number);
  renderCover(canvas, { photos: state.photos, layout: state.layout, grade: state.grade, captionText: captionInput.value, width: w, height: h });
}

sizeSel.onchange = render;
exportBtn.onclick = () => {
  render();
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vice-cover-' + sizeSel.value + '.png';
    a.click();
  }, 'image/png');
};

render();

// auto-load the bundled sample so the app never opens empty
fetch('./samples/sample.jpg').then(r => r.blob()).then(b => addPhotos([new File([b], 'sample.jpg', { type: 'image/jpeg' })])).catch(() => {});
