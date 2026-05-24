'use client';

import { useState, useEffect } from 'react';
import { adminCategoryApi } from '@/services/adminApi';
import { AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  attributes: {
    name: string;
    description?: string;
    createdAt: string;
  };
}

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminCategoryApi.getAll();
      setCategories(response?.data || []);
    } catch (err: any) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="sectionTitle">Categories</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sectionHeader">
        <h2 className="sectionTitle">Categories</h2>
        <p className="sectionSubtitle">
          All available categories ({categories.length})
        </p>
      </div>

      {error && (
        <div className="alertError">
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
          <span>{error}</span>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="noDataAlert">
          <p className="noDataText">No categories found</p>
        </div>
      ) : (
        <div className="tableResponsive">
          <table className="table">
            <thead>
              <tr>
                <th className="th">Name</th>
                <th className="th">Description</th>
                <th className="th">Created</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="tr">
                  <td className="td" style={{ fontWeight: '600' }}>{category.attributes.name}</td>
                  <td className="td">{category.attributes.description || '-'}</td>
                  <td className="td">{new Date(category.attributes.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
