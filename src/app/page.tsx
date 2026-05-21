'use client';

import { useSearchParams } from 'next/navigation';
import SkillsManagement from '@/components/SkillsManagement';
import CategoriesList from '@/components/CategoriesList';
import BaseSkillsList from '@/components/BaseSkillsList';
import ReportsManagement from '@/components/ReportsManagement';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'skills';

  const renderContent = () => {
    switch (tab) {
      case 'skills':
        return <SkillsManagement />;
      case 'categories':
        return <CategoriesList />;
      case 'base-skills':
        return <BaseSkillsList />;
      case 'reports':
        return <ReportsManagement />;
      default:
        return (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
              Welcome to Admin Panel
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
              Select an option from the sidebar to manage content.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  ✓ Pending Skills
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Review and approve/reject pending skills
                </p>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  📁 Categories
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  View all skill categories
                </p>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🎓 Base Skills
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  View all base skills
                </p>
              </div>
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  🚨 Reports
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Manage user reports
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ marginLeft: '250px', padding: '32px' }}>
      <div
        style={{
          maxWidth: '1200px',
        }}
      >
        {renderContent()}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          div {
            margin-left: 0 !important;
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
