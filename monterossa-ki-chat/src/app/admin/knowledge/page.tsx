'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ExternalLink, 
  File, 
  Image as ImageIcon, 
  Video,
  Link as LinkIcon,
  Upload,
  X,
  Check,
  FolderOpen,
  Tag
} from 'lucide-react';

interface KnowledgeItem {
  id: string;
  type: string;
  title: string;
  content: string | null;
  url: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  category: string | null;
  tags: string | null;
  active: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  link: <LinkIcon className="w-5 h-5" />,
  file: <File className="w-5 h-5" />,
  image: <ImageIcon className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  text: <File className="w-5 h-5" />
};

const TYPE_COLORS: Record<string, string> = {
  link: 'text-blue-400 bg-blue-400/20',
  file: 'text-purple-400 bg-purple-400/20',
  image: 'text-pink-400 bg-pink-400/20',
  video: 'text-red-400 bg-red-400/20',
  text: 'text-green-400 bg-green-400/20'
};

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formType, setFormType] = useState('text');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formFile, setFormFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/knowledge');
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.content?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormType('text');
    setFormTitle('');
    setFormContent('');
    setFormUrl('');
    setFormCategory('');
    setFormTags('');
    setFormFile(null);
    setEditingItem(null);
  };

  const openModal = (item?: KnowledgeItem) => {
    if (item) {
      setEditingItem(item);
      setFormType(item.type);
      setFormTitle(item.title);
      setFormContent(item.content || '');
      setFormUrl(item.url || '');
      setFormCategory(item.category || '');
      setFormTags(item.tags || '');
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFile(file);
      if (!formTitle) {
        setFormTitle(file.name);
      }
      // Auto-detect type
      if (file.type.startsWith('image/')) setFormType('image');
      else if (file.type.startsWith('video/')) setFormType('video');
      else setFormType('file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let fileData = {};
      
      // Upload file if selected
      if (formFile) {
        const formData = new FormData();
        formData.append('file', formFile);
        formData.append('type', 'knowledge');
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.success) {
          fileData = {
            url: uploadData.data.url,
            fileName: uploadData.data.fileName,
            fileSize: uploadData.data.size,
            mimeType: uploadData.data.mimeType
          };
        }
      }

      const body = {
        ...(editingItem ? { id: editingItem.id } : {}),
        type: formType,
        title: formTitle,
        content: formContent || null,
        url: formType === 'link' ? formUrl : (fileData as Record<string, unknown>).url || null,
        category: formCategory || null,
        tags: formTags || null,
        ...fileData
      };

      const response = await fetch('/api/knowledge', {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        fetchItems();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setItems(items.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const toggleActive = async (item: KnowledgeItem) => {
    try {
      const response = await fetch('/api/knowledge', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, active: !item.active })
      });
      const data = await response.json();
      if (data.success) {
        setItems(items.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
      }
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-48"></div>
          <div className="h-12 bg-white/5 rounded-xl"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Wissensdatenbank</h1>
          <p className="text-white/50">Verwalten Sie Informationen für den KI-Chat</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#22d3bb] to-[#1aa395] text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Hinzufügen
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
          />
        </div>
      </div>

      {/* Category Tags */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSearch('')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              !search ? 'bg-[#22d3bb] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            Alle
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSearch(cat || '')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                search === cat ? 'bg-[#22d3bb] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <h3 className="text-xl font-semibold text-white/60 mb-2">
            {items.length === 0 ? 'Noch keine Einträge' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-white/40 mb-6">
            {items.length === 0 
              ? 'Fügen Sie Ihre erste Wissenseintrag hinzu'
              : 'Versuchen Sie einen anderen Suchbegriff'}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#22d3bb] text-white rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              Ersten Eintrag erstellen
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-[#0f2035] border rounded-xl p-5 transition-colors ${
                item.active ? 'border-white/10' : 'border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type] || TYPE_COLORS.text}`}>
                  {TYPE_ICONS[item.type] || TYPE_ICONS.text}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        {item.title}
                        {!item.active && (
                          <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded">Inaktiv</span>
                        )}
                      </h3>
                      {item.category && (
                        <span className="text-xs text-[#22d3bb]">{item.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.active ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'
                        }`}
                        title={item.active ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {item.content && (
                    <p className="text-sm text-white/50 mt-2 line-clamp-2">{item.content}</p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#22d3bb] hover:underline mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {item.url}
                    </a>
                  )}
                  {item.tags && (
                    <div className="flex items-center gap-2 mt-3">
                      <Tag className="w-3 h-3 text-white/30" />
                      <span className="text-xs text-white/40">{item.tags}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f2035] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingItem ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 rounded-lg hover:bg-white/10 text-white/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Selection */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Typ</label>
                <div className="grid grid-cols-4 gap-2">
                  {['text', 'link', 'file', 'image', 'video'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormType(type)}
                      className={`p-3 rounded-xl text-center transition-colors ${
                        formType === type
                          ? 'bg-[#22d3bb]/20 border-[#22d3bb] text-[#22d3bb]'
                          : 'bg-white/5 border-white/10 text-white/60'
                      } border`}
                    >
                      <div className="flex justify-center mb-1">{TYPE_ICONS[type]}</div>
                      <span className="text-xs capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Titel *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                  placeholder="Titel des Eintrags"
                />
              </div>

              {/* URL (for links) */}
              {formType === 'link' && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">URL *</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    required={formType === 'link'}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* File Upload */}
              {(formType === 'file' || formType === 'image' || formType === 'video') && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">Datei</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#22d3bb]/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto text-white/30 mb-3" />
                    {formFile ? (
                      <p className="text-white/70">{formFile.name}</p>
                    ) : (
                      <>
                        <p className="text-white/50">Klicken zum Hochladen</p>
                        <p className="text-xs text-white/30 mt-1">Max. 10MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept={formType === 'image' ? 'image/*' : formType === 'video' ? 'video/*' : '*'}
                  />
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Inhalt / Beschreibung</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50 resize-none"
                  placeholder="Beschreiben Sie den Inhalt..."
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Kategorie</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                  placeholder="z.B. Produkte, Services, FAQ"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Tags (kommagetrennt)</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#22d3bb]/50"
                  placeholder="z.B. wichtig, preise, kontakt"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-5 py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={uploading || !formTitle}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-[#22d3bb] to-[#1aa395] text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {uploading ? 'Wird gespeichert...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
