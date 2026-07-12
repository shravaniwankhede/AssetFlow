/**
 * AssetFlow AI Copilot - Service Layer
 * Exposes methods to process messages and simulate intelligent ERP responses.
 */

// Helper to check navigation phrases
const checkNavigationCommand = (message) => {
  const msg = message.toLowerCase().trim();
  
  if (msg.includes('open reports') || msg.includes('go to reports')) {
    return { action: 'NAVIGATE', data: { route: '/reports' }, reply: 'Opening **Reports & Analytics** page for you.' };
  }
  if (msg.includes('go to dashboard') || msg.includes('open dashboard') || msg.includes('show dashboard')) {
    return { action: 'NAVIGATE', data: { route: '/dashboard' }, reply: 'Navigating to **Dashboard** overview.' };
  }
  if (msg.includes('open maintenance') || msg.includes('go to maintenance') || msg.includes('show maintenance')) {
    return { action: 'NAVIGATE', data: { route: '/maintenance' }, reply: 'Taking you to **Maintenance Management** (Kanban board).' };
  }
  if (msg.includes('open assets') || msg.includes('go to assets') || msg.includes('show assets') || msg.includes('show inventory')) {
    return { action: 'NAVIGATE', data: { route: '/assets' }, reply: 'Opening **Asset Registration** inventory list.' };
  }
  if (msg.includes('open allocations') || msg.includes('go to allocations') || msg.includes('show allocations')) {
    return { action: 'NAVIGATE', data: { route: '/allocation' }, reply: 'Opening **Asset Allocation & Transfer**.' };
  }
  if (msg.includes('open bookings') || msg.includes('go to bookings') || msg.includes('show bookings') || msg.includes('book resource')) {
    return { action: 'NAVIGATE', data: { route: '/resources' }, reply: 'Taking you to the **Resource Booking** timeline.' };
  }
  if (msg.includes('open org setup') || msg.includes('go to org setup') || msg.includes('open organization') || msg.includes('go to organization')) {
    return { action: 'NAVIGATE', data: { route: '/organization' }, reply: 'Opening **Organization Setup** controls.' };
  }
  if (msg.includes('open audits') || msg.includes('go to audits') || msg.includes('show audits') || msg.includes('audit cycle')) {
    return { action: 'NAVIGATE', data: { route: '/audit' }, reply: 'Taking you to **Audit Logs & Cycles**.' };
  }
  if (msg.includes('open notifications') || msg.includes('go to notifications') || msg.includes('show notifications')) {
    return { action: 'NAVIGATE', data: { route: '/notifications' }, reply: 'Opening your **Notifications** panel.' };
  }

  return null;
};

// Process message using live ERP context state
export const sendMessage = async (message, history, erpContext) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const { assets = [], bookings = [], maintenanceTickets = [], audits = [], currentUser = {} } = erpContext || {};
  const msg = message.toLowerCase().trim();

  // 1. Check for Navigation Commands
  const navCmd = checkNavigationCommand(message);
  if (navCmd) {
    return navCmd;
  }

  // 2. Intelligent ERP Queries
  
  // Find available laptops
  if (msg.includes('available laptops') || msg.includes('find available laptops')) {
    const laptops = assets.filter(a => a.category.toLowerCase().includes('laptop') && a.status === 'Available');
    if (laptops.length === 0) {
      return {
        reply: 'There are currently no available laptops in the inventory. All units are either allocated or under maintenance.',
        action: null,
        data: {}
      };
    }
    
    let table = '| Tag | Name | Location | Status |\n|---|---|---|---|\n';
    laptops.forEach(l => {
      table += `| \`${l.id}\` | ${l.name} | ${l.location} | **${l.status}** |\n`;
    });

    return {
      reply: `I found **${laptops.length} available laptops** in the database:\n\n${table}\nWould you like me to allocate one?`,
      action: 'SUGGEST_ACTION',
      data: { type: 'allocate' }
    };
  }

  // Show my allocated assets
  if (msg.includes('my allocated assets') || msg.includes('show my allocated') || msg.includes('my assets')) {
    const name = currentUser?.name || 'Priya Shah';
    const myAssets = assets.filter(a => a.assignedTo === name);
    
    if (myAssets.length === 0) {
      return {
        reply: `You currently have **no assets allocated** directly to your name (${name}).`,
        action: null,
        data: {}
      };
    }

    let table = '| Tag | Name | Location | Status |\n|---|---|---|---|\n';
    myAssets.forEach(a => {
      table += `| \`${a.id}\` | ${a.name} | ${a.location} | **${a.status}** |\n`;
    });

    return {
      reply: `Here are the **${myAssets.length} assets** allocated to you, **${name}**:\n\n${table}`,
      action: null,
      data: {}
    };
  }

  // Pending maintenance
  if (msg.includes('pending maintenance') || msg.includes('maintenance queue') || msg.includes('show maintenance requests')) {
    const pending = maintenanceTickets.filter(t => t.status !== 'Resolved');
    
    if (pending.length === 0) {
      return {
        reply: 'Great news! There are **no pending maintenance requests** in the queue. All tickets are resolved.',
        action: null,
        data: {}
      };
    }

    let table = '| ID | Title | Asset | Status | Tech |\n|---|---|---|---|---|\n';
    pending.forEach(t => {
      table += `| \`${t.id}\` | ${t.title} | \`${t.assetId}\` | *${t.status}* | ${t.technician || 'Unassigned'} |\n`;
    });

    return {
      reply: `There are currently **${pending.length} unresolved maintenance tickets**:\n\n${table}\nTo manage these, you can say "Open Maintenance".`,
      action: 'SUGGEST_ACTION',
      data: { type: 'maintenance' }
    };
  }

  // Today's Dashboard Summary
  if (msg.includes('dashboard summary') || msg.includes('status report') || msg.includes('summary of today')) {
    const totalAssets = assets.length;
    const allocated = assets.filter(a => a.status === 'Allocated').length;
    const maintenance = assets.filter(a => a.status === 'Under Maintenance').length;
    const activeBookings = bookings.filter(b => b.status === 'Upcoming').length;

    return {
      reply: `### 📊 AssetFlow Operations Summary
Here is your live enterprise operational snapshot:

*   **Total Inventory**: **${totalAssets}** assets registered.
*   **Active Allocations**: **${allocated}** units currently deployed in departments.
*   **Maintenance Workload**: **${maintenance}** units undergoing diagnostics/repairs.
*   **Upcoming Bookings**: **${activeBookings}** active room/resource sessions scheduled for today.

*Would you like to drill down into reports? Say "Open Reports".*`,
      action: null,
      data: {}
    };
  }

  // Audit summary
  if (msg.includes('audit summary') || msg.includes('audit status')) {
    const activeAudits = audits.filter(a => !a.discrepancyReportGenerated);
    
    if (activeAudits.length === 0) {
      return {
        reply: 'There are **no active audit cycles** running. The last cycle was successfully verified and closed.',
        action: null,
        data: {}
      };
    }

    return {
      reply: `### 📋 Audit Information
We have **${activeAudits.length} active audit cycles** currently running:

*   **Cycle**: \`${activeAudits[0].id}\`
*   **Auditor**: ${activeAudits[0].auditor}
*   **Status**: Verification in Progress
*   **Audited Items**: ${activeAudits[0].auditedItems.length} assets scanned.

*Say "Open Audits" to review discrepancy flags.*`,
      action: null,
      data: {}
    };
  }

  // Who has Asset AF-0012?
  if (msg.includes('who has asset') || msg.includes('owner of')) {
    // Extract asset tag (e.g. AF-0114, AF-0021, etc.)
    const tagMatch = message.toUpperCase().match(/AF-\d{4}/);
    if (!tagMatch) {
      return {
        reply: 'Please provide the asset tag in `AF-XXXX` format (e.g., *Who has asset AF-0114?*).',
        action: null,
        data: {}
      };
    }

    const tag = tagMatch[0];
    const asset = assets.find(a => a.id === tag);

    if (!asset) {
      return {
        reply: `Could not find any asset with tag **${tag}** in the registration database.`,
        action: null,
        data: {}
      };
    }

    if (asset.status === 'Allocated' && asset.assignedTo) {
      return {
        reply: `Asset **${tag}** (${asset.name}) is currently **allocated** to **${asset.assignedTo}** in the **${asset.department || 'unassigned'}** department.`,
        action: null,
        data: {}
      };
    }

    return {
      reply: `Asset **${tag}** (${asset.name}) is currently **${asset.status}** and located at **${asset.location || 'Warehouse'}**. It is not assigned to any individual.`,
      action: null,
      data: {}
    };
  }

  // Book conference room
  if (msg.includes('book conference room') || msg.includes('book room') || msg.includes('reserve room')) {
    return {
      reply: 'To book a meeting room, please select your resource from the schedule timeline. I can open the scheduling panel for you.\n\n*Click the quick action below to open bookings.*',
      action: 'SUGGEST_ACTION',
      data: { type: 'navigate_booking', route: '/resources' }
    };
  }

  // Fallback generic response
  return {
    reply: `I received your request: "${message}".

As your **AssetFlow AI Copilot**, I can help you:
*   🔍 **Find items**: *"Find available laptops"* or *"Who has asset AF-0114?"*
*   📊 **Summarize stats**: *"Dashboard summary"* or *"Pending maintenance"*
*   📂 **Access pages**: *"Open Reports"*, *"Go to Dashboard"*, or *"Open Maintenance"*
*   📅 **Check assignments**: *"Show my allocated assets"*

How can I assist you further?`,
    action: null,
    data: {}
  };
};

export const startConversation = () => {
  return [
    {
      id: 'welcome',
      sender: 'ai',
      text: `### Welcome to AssetFlow AI Copilot! 🤖
I am your enterprise assistant. Ask me questions about assets, check allocation logs, inspect maintenance status, or navigate the dashboard.

Here are a few things you can ask me:
1. *Show my allocated assets*
2. *Find available laptops*
3. *Open Reports*
4. *Pending Maintenance*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
};
