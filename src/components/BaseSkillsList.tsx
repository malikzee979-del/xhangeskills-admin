'use client';

import { useState, useEffect } from 'react';
import { adminBaseSkillApi } from '@/services/adminApi';

interface BaseSkill {
  id: string;
  attributes: {
    name: string;
    description?: string;
    createdAt: string;
  };
}

export default function BaseSkillsList() {
  const [baseSkills, setBaseSkills] = useState<BaseSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBaseSkills();
  }, []);

  const loadBaseSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminBaseSkillApi.getAll();
      setBaseSkills(response?.data || []);
    } catch (err: any) {
      setError('Failed to load base skills');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="sectionTitle">Base Skills</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sectionHeader">
        <h2 className="sectionTitle">Base Skills</h2>
        <p className="sectionSubtitle">
          Base skills in the system ({baseSkills.length})
        </p>
      </div>

      {error && (
        <div className="alertError">
          <span>{error}</span>
        </div>
      )}

      {baseSkills.length === 0 ? (
        <div className="noDataAlert">
          <p className="noDataText">No base skills found</p>
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
              {baseSkills.map((skill) => (
                <tr key={skill.id} className="tr">
                  <td className="td" style={{ fontWeight: '600' }}>{skill.attributes.name}</td>
                  <td className="td">{skill.attributes.description || '-'}</td>
                  <td className="td">{new Date(skill.attributes.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
