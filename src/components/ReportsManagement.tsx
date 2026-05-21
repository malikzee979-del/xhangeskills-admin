'use client';

import { useState, useEffect } from 'react';
import { adminReportApi } from '@/services/adminApi';
import { AlertCircle } from 'lucide-react';

interface Report {
  id: string;
  attributes: {
    reason: string;
    status: string;
    description?: string;
    createdAt: string;
    reportedUser?: {
      data: {
        attributes: {
          displayName?: string;
          username: string;
        };
      };
    };
  };
}

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminReportApi.getAll();
      setReports(response?.data || []);
    } catch (err: any) {
      setError('Failed to load reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await adminReportApi.updateStatus(id, 'resolved');
      setReports(
        reports.map((r) =>
          r.id === id ? { ...r, attributes: { ...r.attributes, status: 'resolved' } } : r
        )
      );
      setSuccessMessage('Report marked as resolved!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to update report status');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="badgeOpen">Open</span>;
      case 'resolved':
        return <span className="badgeResolved">Resolved</span>;
      default:
        return <span className="skillBadge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="sectionTitle">Reports</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sectionHeader">
        <h2 className="sectionTitle">User Reports</h2>
        <p className="sectionSubtitle">
          Manage user reports and violations ({reports.length})
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

      {reports.length === 0 ? (
        <div className="noDataAlert">
          <p className="noDataText">No reports found</p>
        </div>
      ) : (
        <div>
          {reports.map((report) => (
            <div key={report.id} className="card">
              <div className="cardHeader">
                <div>
                  <h3 className="cardTitle">
                    {report.attributes.reason}
                  </h3>
                  {report.attributes.description && (
                    <p className="cardDescription">
                      {report.attributes.description}
                    </p>
                  )}
                  <div className="cardMeta">
                    <span className="cardMetaItem">👤 {report.attributes.reportedUser?.data?.attributes?.displayName || report.attributes.reportedUser?.data?.attributes?.username || 'Unknown'}</span>
                    <span className="cardMetaItem">📅 {new Date(report.attributes.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>{getStatusBadge(report.attributes.status)}</div>
              </div>

              {report.attributes.status !== 'resolved' && (
                <button
                  className="button buttonSuccess"
                  onClick={() => handleResolve(report.id)}
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
