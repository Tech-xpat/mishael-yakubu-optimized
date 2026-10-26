import { useState, useEffect } from 'react';
import { firestore } from '../../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Plus, Loader2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '../ImageUpload';

interface AIProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: any;
}

const AdminAIAutomation = () => {
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    const q = query(collection(firestore, 'aiAutomation'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AIProject[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as AIProject);
        });
        setProjects(data.sort((a, b) => b.createdAt - a.createdAt));
        setLoading(false);
      },
      (error) => {
        console.error('Error:', error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.title?.trim()) {
      toast.error('Project title is required');
      return;
    }
    
    if (formData.title.trim().length < 3) {
      toast.error('Project title must be at least 3 characters long');
      return;
    }
    
    if (!formData.imageUrl) {
      toast.error('Project image is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateDoc(doc(firestore, 'aiAutomation', editingId), {
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim(),
          updatedAt: new Date(),
        });
        toast.success('Project updated successfully');
      } else {
        await addDoc(collection(firestore, 'aiAutomation'), {
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim(),
          createdAt: new Date(),
        });
        toast.success('Project added successfully');
      }
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
      });
      setEditingId(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = error?.message || (editingId ? 'Failed to update project' : 'Failed to add project');
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (project: AIProject) => {
    setFormData({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
    });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(firestore, 'aiAutomation', id));
        toast.success('Project deleted');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  if (loading) {
    return <div className="text-white/60">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Add Project Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">AI Automation Projects</h2>
        <button
          onClick={() => {
            if (showForm && !editingId) {
              setShowForm(false);
            } else if (!showForm) {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">{editingId ? 'Edit Project' : 'Add New Project'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Project title"
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Project description"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Image *
              </label>
              <ImageUpload
                onUploadComplete={(url) =>
                  setFormData({ ...formData, imageUrl: url })
                }
                folder="aiAutomation"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 transition-all font-medium flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={18} className="animate-spin" />}
                {submitting ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Project' : 'Add Project')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 border border-white/20 rounded-lg hover:border-white/50 transition-colors text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-white/60">No projects yet</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition-all flex items-start gap-4"
            >
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white truncate">{project.title}</h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Edit project"
                    >
                      <Edit2 size={18} className="text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white/60">{project.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAIAutomation;
