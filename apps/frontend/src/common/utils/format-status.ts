/**
 * Utility functions for formatting status values for display
 * Handles uppercase, underscores, and provides consistent formatting across the app
 */

/**
 * Formats a status string for display by:
 * - Replacing underscores with spaces
 * - Capitalizing each word
 * @param status - The status string to format (e.g., "PENDING_APPROVAL", "in_progress")
 * @returns Formatted string (e.g., "Pending Approval", "In Progress")
 */
export const formatStatus = (status: string | null | undefined): string => {
  if (!status) return '—';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Formats a role string for display
 * @param role - The role string to format
 * @returns Formatted role string
 */
export const formatRole = (role: string | null | undefined): string => {
  if (!role) return '—';
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Formats a date/datetime string for display with both date and time
 * @param date - The date string, Date object, or undefined
 * @param options - Optional configuration
 * @returns Formatted datetime string (e.g., "Dec 14, 2025 12:30 AM")
 */
export const formatDateTime = (
  date: string | Date | null | undefined,
  options?: {
    showTime?: boolean;
    showSeconds?: boolean;
  }
): string => {
  if (!date) return '—';
  
  const { showTime = true, showSeconds = false } = options || {};
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) return '—';
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    
    if (showTime) {
      dateOptions.hour = 'numeric';
      dateOptions.minute = '2-digit';
      dateOptions.hour12 = true;
      if (showSeconds) {
        dateOptions.second = '2-digit';
      }
    }
    
    return dateObj.toLocaleDateString('en-US', dateOptions);
  } catch {
    return '—';
  }
};

/**
 * Formats a date string for display (date only, no time)
 * @param date - The date string, Date object, or undefined
 * @returns Formatted date string (e.g., "Dec 14, 2025")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  return formatDateTime(date, { showTime: false });
};

/**
 * Modal styling constants following the physician patient-study design pattern
 */
export const modalStyles = {
  // Dialog content
  dialogContent: "w-[70vw] max-w-[1200px] sm:max-w-[70vw] h-[90vh] max-h-[90vh] flex flex-col border-0 p-0 overflow-hidden bg-slate-50",
  
  // Header
  dialogHeader: "flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-200 shrink-0 px-6 pt-6 bg-white",
  dialogTitle: "text-xl font-bold text-slate-900",
  
  // Footer
  dialogFooter: "flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white shrink-0",
  
  // Hero section (top gradient section)
  heroSection: "rounded-xl bg-gradient-to-br from-teal-50 to-slate-50 p-6 border border-teal-200/50 shadow-sm flex flex-col gap-6",
  heroTitle: "text-2xl font-bold text-slate-900",
  heroSubtitle: "text-sm text-slate-600 flex items-center gap-2",
  heroLabel: "text-xs font-semibold text-teal-600 uppercase tracking-wide flex items-center gap-2",
  
  // Content sections
  section: "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm",
  sectionHeader: "flex items-center gap-2 mb-4",
  sectionIconContainer: "p-2 bg-teal-100 rounded-lg",
  sectionIcon: "w-5 h-5 text-teal-600",
  sectionTitle: "text-lg font-bold text-slate-900",
  sectionLabel: "text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3 flex items-center gap-2",
  
  // Info cards
  infoCard: "bg-white/80 backdrop-blur rounded-lg p-4 border border-slate-100 transition-all hover:shadow-md hover:border-teal-200/50 flex items-start gap-3",
  infoCardLabel: "text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1",
  infoCardValue: "text-sm font-medium text-slate-900",
  infoCardLarge: "text-lg font-semibold text-slate-900",
  
  // Grid info items  
  gridCard: "group bg-white border border-slate-200/60 rounded-xl p-5 transition-all hover:shadow-md hover:border-teal-200/50",
  gridCardLabel: "flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3",
  gridCardIcon: "w-4 h-4 text-teal-600",
  gridCardValue: "text-lg font-semibold text-slate-900",
  
  // Form sections
  formSection: "bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm space-y-4",
  formSectionHeader: "flex items-center gap-2 text-lg font-bold text-slate-900 mb-4",
  formLabel: "text-sm font-medium text-slate-700",
  
  // Badge styles
  badge: {
    green: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 transition-colors",
    blue: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200 transition-colors",
    amber: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200 transition-colors",
    red: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200 transition-colors",
    purple: "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 transition-colors",
    slate: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 transition-colors",
    teal: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 transition-colors",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200 transition-colors",
  },
  
  // Animated dot for status
  statusDot: {
    green: "w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2",
    blue: "w-2 h-2 bg-blue-500 rounded-full mr-2",
    amber: "w-2 h-2 bg-amber-500 rounded-full animate-pulse mr-2",
    red: "w-2 h-2 bg-red-500 rounded-full mr-2",
    slate: "w-2 h-2 bg-slate-500 rounded-full mr-2",
    teal: "w-2 h-2 bg-teal-500 rounded-full mr-2",
  },
  
  // Button styles
  primaryButton: "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-lg transition-all hover:shadow-md font-medium",
  secondaryButton: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-all font-medium",
  dangerButton: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all hover:shadow-md font-medium",
} as const;

/**
 * Get badge color class based on status type
 */
export const getStatusBadgeColor = (status: string | boolean | null | undefined): keyof typeof modalStyles.badge => {
  if (typeof status === 'boolean') {
    return status ? 'green' : 'slate';
  }
  
  const statusLower = String(status || '').toLowerCase();
  
  // Active/Available/Approved states
  if (['active', 'available', 'approved', 'completed', 'verified', 'online', 'yes', 'true'].includes(statusLower)) {
    return 'green';
  }
  
  // Pending/In Progress states
  if (['pending', 'pending_approval', 'in_progress', 'processing', 'waiting'].includes(statusLower)) {
    return 'amber';
  }
  
  // Info/Scheduled states
  if (['scheduled', 'assigned', 'reserved', 'info'].includes(statusLower)) {
    return 'blue';
  }
  
  // Inactive/Maintenance states
  if (['inactive', 'maintenance', 'disabled', 'offline', 'no', 'false'].includes(statusLower)) {
    return 'slate';
  }
  
  // Error/Rejected states
  if (['error', 'rejected', 'failed', 'cancelled', 'canceled', 'occupied'].includes(statusLower)) {
    return 'red';
  }
  
  // Special states
  if (['special', 'premium', 'vip'].includes(statusLower)) {
    return 'purple';
  }
  
  return 'slate';
};

/**
 * Check if status should have animated dot
 */
export const shouldAnimateDot = (status: string | null | undefined): boolean => {
  const statusLower = String(status || '').toLowerCase();
  return ['pending', 'pending_approval', 'in_progress', 'processing', 'waiting'].includes(statusLower);
};

