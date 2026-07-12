import React from 'react';
import { useAssetFlow } from '../../contexts/AssetFlowContext';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const { assets, departments } = useAssetFlow();

  const handleExport = (filename) => {
    toast.success(`Exporting ${filename}...`);
    setTimeout(() => {
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([`AssetFlow Report - ${filename}\nGenerated: ${new Date().toLocaleDateString()}\n`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success(`${filename} downloaded successfully!`);
    }, 1000);
  };

  // Calculate actual department allocations from assets
  const getDeptAllocationCount = (deptName) => {
    return assets.filter(a => a.department === deptName && a.status === 'Allocated').length;
  };

  // Find max count to set progress percentage
  const deptCounts = departments.map(d => ({
    name: d.name,
    count: getDeptAllocationCount(d.name)
  }));
  const maxDeptCount = Math.max(...deptCounts.map(d => d.count), 1);

  // Generate Booking Heatmap matrix (7 days x 24 hours)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [0, 6, 12, 18];

  // Helper to generate a realistic weekday/hour booking intensity (0 to 4)
  const getIntensityValue = (dayIdx, hourIdx) => {
    // Weekends (Sat, Sun) have low usage
    if (dayIdx >= 5) {
      if (hourIdx >= 10 && hourIdx <= 16) return 1;
      return 0;
    }
    // Work hours (9 AM - 6 PM) on weekdays have high/peak usage
    if (hourIdx >= 9 && hourIdx <= 17) {
      if (hourIdx === 10 || hourIdx === 14 || hourIdx === 15) return 4; // peak
      if (hourIdx === 11 || hourIdx === 16) return 3; // high
      return 2; // medium
    }
    // Early morning / Late evening
    if (hourIdx >= 7 && hourIdx <= 21) {
      return 1; // low
    }
    return 0; // empty
  };

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return '#f3eff4'; // empty/lightest purple
    if (intensity === 1) return '#d2c2cd'; // low usage
    if (intensity === 2) return '#ab91a3'; // medium usage
    if (intensity === 3) return '#724b68'; // high (accent mauve)
    return '#30183c'; // peak (primary eggplant)
  };

  return (
    <div className="reports-page">
      <div className="reports-header-row">
        <div>
          <span className="insights-label">Insight</span>
          <h1 className="page-heading">Reports & Analytics</h1>
          <p className="page-subheading">Master data — everything else in the system depends on these.</p>
        </div>
        <div className="export-actions-row">
          <button className="btn btn-secondary csv-btn" onClick={() => handleExport('assets.csv')}>
            <Download size={13} />
            assets.csv
          </button>
          <button className="btn btn-secondary csv-btn" onClick={() => handleExport('allocations.csv')}>
            <Download size={13} />
            allocations.csv
          </button>
          <button className="btn btn-secondary csv-btn" onClick={() => handleExport('maintenance.csv')}>
            <Download size={13} />
            maintenance.csv
          </button>
        </div>
      </div>

      {/* Reports Grid Layout */}
      <div className="reports-grid">
        {/* Card 1: Utilization */}
        <div className="card report-card">
          <span className="report-card-label">Utilization</span>
          <h3 className="report-card-title">Top allocated assets</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 400 160" className="reports-svg">
              <line x1="40" y1="130" x2="380" y2="130" stroke="#E2E8F0" strokeWidth="2" />
              <line x1="40" y1="90" x2="380" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="50" x2="380" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="10" x2="380" y2="10" stroke="#F1F5F9" strokeDasharray="3 3" />

              {/* Y-Axis Labels */}
              <text x="30" y="133" fontSize="9" textAnchor="end" fill="#94A3B8">0</text>
              <text x="30" y="93" fontSize="9" textAnchor="end" fill="#94A3B8">5</text>
              <text x="30" y="53" fontSize="9" textAnchor="end" fill="#94A3B8">10</text>
              <text x="30" y="13" fontSize="9" textAnchor="end" fill="#94A3B8">15</text>

              {/* Bars */}
              {/* Dell Latitude 5420 */}
              <rect x="70" y="42" width="28" height="88" fill="#30183c" rx="3" />
              <text x="84" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">DELL 5420</text>

              {/* MacBook Pro 16 */}
              <rect x="150" y="58" width="28" height="72" fill="#4a255d" rx="3" />
              <text x="164" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">MACBOOK</text>

              {/* HP EliteBook */}
              <rect x="230" y="74" width="28" height="56" fill="#724b68" rx="3" />
              <text x="244" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">ELITEBOOK</text>

              {/* iPad Pro 11 */}
              <rect x="310" y="98" width="28" height="32" fill="#96748e" rx="3" />
              <text x="324" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">IPAD PRO</text>
            </svg>
          </div>
        </div>

        {/* Card 2: Reliability */}
        <div className="card report-card">
          <span className="report-card-label">Reliability</span>
          <h3 className="report-card-title">Maintenance frequency</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 400 160" className="reports-svg">
              <line x1="40" y1="130" x2="380" y2="130" stroke="#E2E8F0" strokeWidth="2" />
              <line x1="40" y1="90" x2="380" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="50" x2="380" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
              <line x1="40" y1="10" x2="380" y2="10" stroke="#F1F5F9" strokeDasharray="3 3" />

              {/* Line path */}
              <path 
                d="M 60,110 Q 120,95 180,105 T 300,45 T 360,55" 
                fill="none" 
                stroke="#724b68" 
                strokeWidth="3" 
              />
              <circle cx="60" cy="110" r="4" fill="#724b68" />
              <circle cx="180" cy="105" r="4" fill="#724b68" />
              <circle cx="300" cy="45" r="4" fill="#724b68" />
              <circle cx="360" cy="55" r="4" fill="#724b68" />

              {/* Labels */}
              <text x="60" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">Q1</text>
              <text x="180" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">Q2</text>
              <text x="300" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">Q3</text>
              <text x="360" y="145" fontSize="9" textAnchor="middle" fill="#64748B" fontWeight="600">Q4</text>
            </svg>
          </div>
        </div>

        {/* Card 3: Distribution */}
        <div className="card report-card">
          <span className="report-card-label">Distribution</span>
          <h3 className="report-card-title">Department allocation</h3>
          <div className="dept-allocation-list">
            {deptCounts.map((dept, index) => {
              const percentage = Math.max(10, Math.round((dept.count / maxDeptCount) * 100));
              return (
                <div key={index} className="dept-allocation-item">
                  <span className="dept-name">{dept.name}</span>
                  <div className="dept-progress-container">
                    <div 
                      className="dept-progress-bar" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="dept-count">{dept.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 4: Peak Usage */}
        <div className="card report-card">
          <span className="report-card-label">Peak Usage</span>
          <h3 className="report-card-title">Booking heatmap (7d × 24h)</h3>
          <div className="heatmap-container">
            <svg viewBox="0 0 350 120" className="reports-svg">
              {/* Day Labels (Mon-Sun on y-axis) */}
              {days.map((day, dIdx) => (
                <text 
                  key={day} 
                  x="22" 
                  y={18 + dIdx * 12} 
                  fontSize="8" 
                  textAnchor="end" 
                  fill="#94A3B8"
                >
                  {day}
                </text>
              ))}

              {/* Heatmap Rectangles (7 days x 24 hours) */}
              {days.map((_, dIdx) => (
                Array.from({ length: 24 }).map((_, hIdx) => {
                  const val = getIntensityValue(dIdx, hIdx);
                  return (
                    <rect
                      key={`${dIdx}-${hIdx}`}
                      x={30 + hIdx * 12}
                      y={10 + dIdx * 12}
                      width="10"
                      height="10"
                      fill={getHeatmapColor(val)}
                      rx="1.5"
                      className="heatmap-cell"
                    >
                      <title>{`Hour ${hIdx}: Intensity ${val}`}</title>
                    </rect>
                  );
                })
              ))}

              {/* Hour Labels (0, 6, 12, 18 on x-axis) */}
              {hours.map(hour => (
                <text
                  key={hour}
                  x={35 + hour * 12}
                  y={104}
                  fontSize="8"
                  textAnchor="middle"
                  fill="#94A3B8"
                >
                  {hour}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
