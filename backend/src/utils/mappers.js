export function toFeRole(dbRole) {
  switch (dbRole) {
    case 'ADMIN': return 'Admin';
    case 'ASSET_MANAGER': return 'Asset Manager';
    case 'DEPARTMENT_HEAD': return 'Department Head';
    case 'EMPLOYEE': return 'Employee';
    default: return dbRole;
  }
}

export function toDbRole(feRole) {
  switch (feRole) {
    case 'Admin': return 'ADMIN';
    case 'Asset Manager': return 'ASSET_MANAGER';
    case 'Department Head': return 'DEPARTMENT_HEAD';
    case 'Employee': return 'EMPLOYEE';
    default: return feRole ? feRole.toUpperCase() : 'EMPLOYEE';
  }
}

export function toFeStatus(dbStatus) {
  if (!dbStatus) return '';
  switch (dbStatus.toUpperCase()) {
    case 'AVAILABLE': return 'Available';
    case 'ALLOCATED': return 'Allocated';
    case 'RESERVED': return 'Reserved';
    case 'UNDER_MAINTENANCE': return 'Maintenance';
    case 'LOST': return 'Lost';
    case 'RETIRED': return 'Retired';
    case 'DISPOSED': return 'Disposed';
    case 'ACTIVE': return 'Active';
    case 'INACTIVE': return 'Inactive';
    case 'PENDING': return 'Pending';
    case 'APPROVED': return 'Approved';
    case 'REJECTED': return 'Rejected';
    case 'UPCOMING': return 'Upcoming';
    case 'ONGOING': return 'Ongoing';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return dbStatus;
  }
}

export function toDbStatus(feStatus) {
  if (!feStatus) return '';
  switch (feStatus) {
    case 'Available': return 'AVAILABLE';
    case 'Allocated': return 'ALLOCATED';
    case 'Reserved': return 'RESERVED';
    case 'Maintenance': return 'UNDER_MAINTENANCE';
    case 'Lost': return 'LOST';
    case 'Retired': return 'RETIRED';
    case 'Disposed': return 'DISPOSED';
    case 'Active': return 'ACTIVE';
    case 'Inactive': return 'INACTIVE';
    case 'Pending': return 'PENDING';
    case 'Approved': return 'APPROVED';
    case 'Rejected': return 'REJECTED';
    case 'Upcoming': return 'UPCOMING';
    case 'Ongoing': return 'ONGOING';
    case 'Completed': return 'COMPLETED';
    case 'Cancelled': return 'CANCELLED';
    default: return feStatus.toUpperCase();
  }
}

export function toFeUser(user) {
  if (!user) return null;
  return {
    id: `emp-${user.id}`,
    name: user.name,
    email: user.email,
    role: toFeRole(user.role),
    department: user.department ? user.department.name : '',
    status: toFeStatus(user.status)
  };
}

export function toFeDepartment(dept) {
  if (!dept) return null;
  return {
    id: `dept-${dept.id}`,
    name: dept.name,
    head: dept.head ? dept.head.name : '-',
    parentDept: dept.parentDepartment ? dept.parentDepartment.name : '-',
    status: toFeStatus(dept.status)
  };
}

export function toFeCategory(cat) {
  if (!cat) return null;
  return {
    id: `cat-${cat.id}`,
    name: cat.name,
    description: cat.description
  };
}

export function toFeAsset(asset) {
  if (!asset) return null;

  // Compile history dynamically
  const history = [];

  // 1. Add registration history
  history.push({
    date: asset.acquisitionDate ? asset.acquisitionDate.toISOString().split('T')[0] : asset.createdAt.toISOString().split('T')[0],
    action: 'Registered',
    performedBy: 'System',
    notes: 'Initial registration'
  });

  // 2. Add resource bookings
  if (asset.bookings && Array.isArray(asset.bookings)) {
    asset.bookings.forEach(b => {
      history.push({
        date: b.createdAt.toISOString().split('T')[0],
        action: `Resource Booked: ${b.title || 'Reservation'}`,
        performedBy: b.user ? b.user.name : 'System',
        notes: `Status: ${toFeStatus(b.status)}`
      });
    });
  }

  // 3. Add maintenance tickets
  if (asset.maintenance && Array.isArray(asset.maintenance)) {
    asset.maintenance.forEach(m => {
      history.push({
        date: m.createdAt.toISOString().split('T')[0],
        action: `Maintenance Ticket: ${m.description}`,
        performedBy: m.reporter ? m.reporter.name : 'System',
        notes: `Notes: ${m.notes || ''}`
      });
    });
  }

  // 4. Add transfer requests
  if (asset.transfers && Array.isArray(asset.transfers)) {
    asset.transfers.forEach(t => {
      history.push({
        date: t.createdAt.toISOString().split('T')[0],
        action: `Transfer Request: ${toFeStatus(t.status)}`,
        performedBy: t.requester ? t.requester.name : 'System',
        notes: `Reason: ${t.reason || ''}`
      });
    });
  }

  // Sort history descending by date
  history.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    id: asset.tag,
    name: asset.name,
    category: asset.category ? asset.category.name : '',
    status: toFeStatus(asset.status),
    location: asset.location,
    assignedTo: asset.user ? asset.user.name : '',
    department: asset.department ? asset.department.name : '',
    image: '',
    documents: asset.serialNo ? [asset.serialNo] : [], // Use serial number or similar
    history: history,
    qrCode: `${asset.tag}-${asset.name.replace(/\s+/g, '').toUpperCase()}`
  };
}

export function toFeTransfer(t) {
  if (!t) return null;
  return {
    id: `tr-${t.id}`,
    assetId: t.asset.tag,
    assetName: t.asset.name,
    fromEmployee: t.currentHolder ? t.currentHolder.name : '',
    toEmployee: t.targetUser ? t.targetUser.name : '',
    reason: t.reason || 'Asset relocation',
    status: toFeStatus(t.status),
    timestamp: t.createdAt.toISOString()
  };
}

export function toFeBooking(b) {
  if (!b) return null;
  return {
    id: `bk-${b.id}`,
    resource: b.asset ? b.asset.name : '',
    title: b.title || 'Resource Reservation',
    // We format times as string "HH:MM" and date as "YYYY-MM-DD"
    startTime: b.startTime.toISOString().substring(11, 16),
    endTime: b.endTime.toISOString().substring(11, 16),
    bookedBy: b.user ? b.user.name : 'System',
    date: b.startTime.toISOString().split('T')[0],
    status: toFeStatus(b.status)
  };
}

export function toFeMaintenance(m) {
  if (!m) return null;
  return {
    id: `maint-${m.id}`,
    assetId: m.asset ? m.asset.tag : '',
    title: m.description,
    notes: m.notes || '',
    status: m.status === 'PENDING' ? 'Pending' :
            m.status === 'APPROVED' ? 'Approved' :
            m.status === 'IN_PROGRESS' ? 'In Progress' :
            m.status === 'RESOLVED' ? 'Resolved' : m.status, // Match expected frontend status
    technician: m.technician ? m.technician.name : '',
    dateReported: m.createdAt.toISOString().split('T')[0]
  };
}

export function toFeAudit(audit) {
  if (!audit) return null;
  return {
    id: `aud-${audit.id}`,
    title: audit.name,
    itemCount: audit.auditItems ? audit.auditItems.length : 0,
    auditors: audit.auditors ? audit.auditors.map(a => a.name) : [],
    status: toFeStatus(audit.status),
    dateCreated: audit.createdAt.toISOString().split('T')[0],
    items: audit.auditItems ? audit.auditItems.map(item => ({
      assetId: item.asset.tag,
      name: item.asset.name,
      location: item.asset.location,
      verification: item.status === 'PENDING' ? 'Pending' :
                    item.status === 'VERIFIED' ? 'Verified' :
                    item.status === 'MISSING' ? 'Missing' :
                    item.status === 'DAMAGED' ? 'Damaged' : item.status
    })) : [],
    discrepancyReportGenerated: audit.status === 'COMPLETED' || audit.status === 'Closed'
  };
}

export function toFeNotification(n) {
  if (!n) return null;
  
  // Calculate relative time or format date
  const diffMs = new Date() - n.createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  let timeStr = 'Just now';
  if (diffMins >= 60) {
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs >= 24) {
      timeStr = `${Math.floor(diffHrs / 24)}d ago`;
    } else {
      timeStr = `${diffHrs}h ago`;
    }
  } else if (diffMins > 0) {
    timeStr = `${diffMins}m ago`;
  }

  return {
    id: `n-${n.id}`,
    type: n.type,
    message: n.message,
    time: timeStr,
    category: n.type === 'Asset Assigned' ? 'Alerts' :
              n.type === 'Maintenance Approved' ? 'Approvals' :
              n.type === 'Booking Confirmed' ? 'Bookings' : 'Alerts',
    read: n.isRead
  };
}
