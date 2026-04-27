import { useEffect, useRef, useState } from 'react';
import { api } from '../../api';

const EMPTY_FORM = { title: '', title_hindi: '', sort_order: 0, is_published: true, image: '' };

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageModal({ item, onSave, onClose }) {
  const [form,    setForm]    = useState(item ? { ...item, is_published: !!item.is_published } : EMPTY_FORM);
  const [preview, setPreview] = useState(item?.image || '');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select a valid image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); return; }
    try {
      const b64 = await fileToBase64(file);
      setPreview(b64);
      setForm(f => ({ ...f, image: b64 }));
      setError('');
    } catch { setError('Failed to read file.'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.image) { setError('Please select an image.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        title:       form.title,
        title_hindi: form.title_hindi,
        sort_order:  Number(form.sort_order) || 0,
        is_published: form.is_published,
        ...(form.image !== item?.image ? { image: form.image } : {}),
      };
      const saved = item
        ? await api.updateGalleryImage(item.id, payload)
        : await api.createGalleryImage({ ...payload, image: form.image });
      onSave(saved, !!item);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <h3>{item ? 'Edit Image' : 'Upload New Image'}</h3>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error" style={{ marginBottom: 'var(--s5)' }}>{error}</div>}
          <form id="gallery-form" onSubmit={submit}>
            {/* Image picker */}
            <div className="form-group" style={{ marginBottom: 'var(--s5)' }}>
              <label className="form-label">{item ? 'Replace Image (optional)' : 'Image *'}</label>
              <div
                style={{ border: '2px dashed var(--border-2)', borderRadius: 'var(--r2)', padding: 'var(--s5)', textAlign: 'center', cursor: 'pointer', background: 'var(--surface-2)' }}
                onClick={() => fileRef.current?.click()}
              >
                {preview
                  ? <img src={preview} alt="preview" style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--r1)' }} />
                  : <div style={{ color: 'var(--t3)', fontSize: '0.9rem' }}>Click to choose a photo<br /><span style={{ fontSize: '0.78rem' }}>JPEG · PNG · WEBP · max 10 MB</span></div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Caption (English)</label>
                <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Gangotri Temple" />
              </div>
              <div className="form-group">
                <label className="form-label">शीर्षक (Hindi)</label>
                <input className="form-input" style={{ fontFamily: 'var(--font-deva)' }} value={form.title_hindi} onChange={e => set('title_hindi', e.target.value)} placeholder="जैसे गंगोत्री मंदिर" />
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-input" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} min={0} />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--s3)', paddingTop: 'var(--s7)' }}>
                <input type="checkbox" id="gal_published" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
                <label htmlFor="gal_published" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>🌐 Published</label>
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" form="gallery-form" type="submit" disabled={saving}>
            {saving ? 'Saving...' : item ? 'Update' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageGallery() {
  const [images,   setImages]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // null | 'new' | image obj
  const [deleting, setDeleting] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const load = () => {
    setLoading(true);
    api.getAllGallery().then(setImages).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const onSave = (saved, isUpdate) => {
    setImages(imgs => isUpdate ? imgs.map(i => i.id === saved.id ? saved : i) : [...imgs, saved]);
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image from gallery?')) return;
    setDeleting(id);
    try { await api.deleteGalleryImage(id); setImages(imgs => imgs.filter(i => i.id !== id)); }
    catch (err) { alert(err.message); }
    finally { setDeleting(null); }
  };

  const togglePublish = async (img) => {
    try {
      const updated = await api.updateGalleryImage(img.id, { is_published: img.is_published ? 0 : 1 });
      setImages(imgs => imgs.map(i => i.id === updated.id ? updated : i));
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="admin-section-head" style={{ marginBottom: 'var(--s6)' }}>
        <h2 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-head)' }}>Photo Gallery</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal('new')}>+ Upload Image</button>
      </div>

      {loading
        ? <div className="spinner-center"><div className="spinner spinner-lg" /></div>
        : images.length === 0
          ? (
            <div style={{ textAlign: 'center', color: 'var(--t3)', padding: 'var(--s12)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--s4)' }}>🖼️</div>
              <div>No images yet. Upload your first photo!</div>
            </div>
          )
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--s5)' }}>
              {images.map(img => (
                <div key={img.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r3)', overflow: 'hidden', boxShadow: 'var(--sh1)' }}>
                  {/* Thumbnail */}
                  <div
                    style={{ aspectRatio: '4/3', overflow: 'hidden', cursor: 'zoom-in', position: 'relative' }}
                    onClick={() => setLightbox(img)}
                  >
                    <img src={img.image} alt={img.title || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {!img.is_published && (
                      <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20 }}>Hidden</span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: 'var(--s4)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--t1)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {img.title_hindi || img.title || <span style={{ color: 'var(--t3)' }}>Untitled</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--t3)', marginBottom: 'var(--s4)' }}>
                      Order: {img.sort_order} · {img.is_published ? '🟢 Published' : '🔴 Hidden'}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(img)} style={{ flex: 1 }}>Edit</button>
                      <button
                        className={`btn btn-sm ${img.is_published ? 'btn-ghost' : 'btn-outline'}`}
                        onClick={() => togglePublish(img)}
                        style={{ flex: 1, fontSize: '0.72rem' }}
                      >
                        {img.is_published ? 'Hide' : 'Publish'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(img.id)} disabled={deleting === img.id}>
                        {deleting === img.id ? '...' : '🗑'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      }

      {/* Upload / Edit modal */}
      {modal && (
        <ImageModal
          item={modal === 'new' ? null : modal}
          onSave={onSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Admin lightbox */}
      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox.image} alt={lightbox.title} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </div>
  );
}
