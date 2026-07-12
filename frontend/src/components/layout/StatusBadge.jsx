import React from 'react';
import { 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  Archive, 
  Trash2 
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Available': return 'badge badge-available';
      case 'Allocated': return 'badge badge-allocated';
      case 'Reserved': return 'badge badge-reserved';
      case 'Maintenance': return 'badge badge-maintenance';
      case 'Lost': return 'badge badge-lost';
      case 'Retired': return 'badge badge-retired';
      case 'Disposed': return 'badge badge-disposed';
      default: return 'badge';
    }
  };

  const getIcon = (status) => {
    const size = 12;
    switch (status) {
      case 'Available': return <CheckCircle2 size={size} />;
      case 'Allocated': return <UserCheck size={size} />;
      case 'Reserved': return <Clock size={size} />;
      case 'Maintenance': return <AlertTriangle size={size} />;
      case 'Lost': return <HelpCircle size={size} />;
      case 'Retired': return <Archive size={size} />;
      case 'Disposed': return <Trash2 size={size} />;
      default: return null;
    }
  };

  return (
    <span className={getBadgeClass(status)}>
      {getIcon(status)}
      {status}
    </span>
  );
};

export default StatusBadge;
