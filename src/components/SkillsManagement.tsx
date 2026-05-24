'use client';

import { useState, useEffect } from 'react';
import { adminSkillApi } from '@/services/adminApi';
import { Check, X, Loader, AlertCircle } from 'lucide-react';

interface Skill {
  id: string;
  attributes: {
    title: string;
    description: string;
    status: string;
    createdAt: string;
    user?: {
      data: {
        attributes: {
          displayName?: string;
          username: string;
        };
      };
    };
    category?: {
      data: {
        attributes: {
          name: string;
        };
      };
    };
  };
}

export default function SkillsManagement() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [showReasonForm, setShowReasonForm] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPendingSkills();
  }, []);

  const loadPendingSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminSkillApi.getPendingSkills();
      setSkills(response?.data || []);
    } catch (err: any) {
      setError('Failed to load pending skills');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminSkillApi.approveSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
      setSuccessMessage('Skill approved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to approve skill');
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const reason = rejectionReason[id] || 'Rejected by admin';
      await adminSkillApi.rejectSkill(id, reason);
      setSkills(skills.filter((s) => s.id !== id));
      setShowReasonForm(null);
      setRejectionReason({});
      setSuccessMessage('Skill rejected successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to reject skill');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="sectionTitle">Pending Skills</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sectionHeader">
        <h2 className="sectionTitle">Pending Skills</h2>
        <p className="sectionSubtitle">
          Review and approve/reject pending skills ({skills.length})
        </p>
      </div>

      {error && (
        <div className="alertError">
          <AlertCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alertSuccess">
          {successMessage}
        </div>
      )}

      {skills.length === 0 ? (
        <div className="noDataAlert">
          <p className="noDataText">No pending skills to review</p>
        </div>
      ) : (
        <div>
          {skills.map((skill) => (
            <div key={skill.id} className="card">
              <div className="cardHeader">
                <div>
                  <h3 className="cardTitle">
                    {skill.attributes.title}
                  </h3>
                  <p className="cardDescription">
                    {skill.attributes.description}
                  </p>
                  <div className="cardMeta">
                    <span className="cardMetaItem">👤 {skill.attributes.user?.data?.attributes?.displayName || skill.attributes.user?.data?.attributes?.username || 'Unknown'}</span>
                    <span className="cardMetaItem">📁 {skill.attributes.category?.data?.attributes?.name || 'No category'}</span>
                    <span className="cardMetaItem">📅 {new Date(skill.attributes.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {showReasonForm === skill.id ? (
                <div className="rejectionForm">
                  <div className="formGroup">
                    <label className="formLabel">Rejection Reason:</label>
                    <textarea
                      className="textarea"
                      value={rejectionReason[skill.id] || ''}
                      onChange={(e) =>
                        setRejectionReason({ ...rejectionReason, [skill.id]: e.target.value })
                      }
                      placeholder="Enter rejection reason..."
                    />
                  </div>
                  <div className="buttonGroup">
                    <button
                      className="button buttonDanger"
                      onClick={() => handleReject(skill.id)}
                    >
                      Confirm Rejection
                    </button>
                    <button
                      className="button buttonPrimary"
                      onClick={() => setShowReasonForm(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="buttonGroup">
                  <button
                    className="button buttonSuccess"
                    onClick={() => handleApprove(skill.id)}
                  >
                    <Check size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    Approve
                  </button>
                  <button
                    className="button buttonDanger"
                    onClick={() => setShowReasonForm(skill.id)}
                  >
                    <X size={16} style={{ marginRight: '4px', display: 'inline' }} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
