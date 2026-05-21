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
            <h2 className="pageTitle">
              Welcome to Admin Panel
            </h2>
            <p className="pageDescription">
              Select an option from the sidebar to manage content.
            </p>
            <div className="cardGrid">
              <div className="gridCard">
                <h3 className="gridCardTitle">
                  ✓ Pending Skills
                </h3>
                <p className="gridCardText">
                  Review and approve/reject pending skills
                </p>
              </div>
              <div className="gridCard">
                <h3 className="gridCardTitle">
                  📁 Categories
                </h3>
                <p className="gridCardText">
                  View all skill categories
                </p>
              </div>
              <div className="gridCard">
                <h3 className="gridCardTitle">
                  🎓 Base Skills
                </h3>
                <p className="gridCardText">
                  View all base skills
                </p>
              </div>
              <div className="gridCard">
                <h3 className="gridCardTitle">
                  🚨 Reports
                </h3>
                <p className="gridCardText">
                  Manage user reports
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboardContent">
      {renderContent()}
    </div>
  );
}
