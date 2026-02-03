import React from 'react';
import './DailyReport.css';
import ActivityCard from './ActivityCard';
import VitalsCard from './VitalsCard';
import TrendCard from './TrendCard';
import DeviceCard from './DeviceCard';
import AIInsightEnhanced from './AIInsightEnhanced';
import ActivityMapBaidu from './ActivityMapBaidu';

function DailyReport({ report }) {
  return (
    <div className="daily-report">
      <div className="report-grid">
        {/* 左侧主要卡片 */}
        <div className="main-cards">
          <ActivityCard activity={report.activity} />
          <AIInsightEnhanced 
            petId={report.petId}
            date={report.date}
            reportData={report}
          />
          <ActivityMapBaidu 
            petId={report.petId}
            date={report.date}
          />
        </div>

        {/* 右侧次要卡片 */}
        <div className="side-cards">
          <VitalsCard vitals={report.vitals} />
          <TrendCard trend={report.trend} />
          <DeviceCard device={report.device} />
        </div>
      </div>
    </div>
  );
}

export default DailyReport;
