import {
  // Navigation icons
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  X,
  Maximize2,
  Minimize2,
  
  // Medical/DICOM icons
  Activity,
  Layers,
  Image,
  Scan,
  Zap,
  Target,
  Square,
  Circle,
  Triangle,
  Ruler,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer,
  
  // UI icons
  Settings,
  Info,
  Eye,
  EyeOff,
  Download,
  Upload,
  Save,

  Share,
  Grid,
  List,
  Filter,
  Search,
  
  // Status icons
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  
  // Measurement tools
  Crosshair,
  Navigation,
  Compass,
  
  // Missing icon fallback
  HelpCircle,
  
  type LucideIcon,
} from 'lucide-react';

// Mapping OHIF icon names to Lucide icons
export const LucideIconMapping: Record<string, LucideIcon> = {
  // Navigation
  'SidePanelCloseLeft': ChevronLeft,
  'SidePanelCloseRight': ChevronRight,
  'NavigationPanelReveal': Menu,
  'ChevronDown': ChevronDown,
  'ChevronUp': ChevronUp,
  'Close': X,
  'Maximize': Maximize2,
  'Minimize': Minimize2,
  
  // Medical Tools
  'WindowLevel': Activity,
  'Zoom': ZoomIn,
  'Pan': Move,
  'StackScroll': Layers,
  'Length': Ruler,
  'Angle': Compass,
  'Rectangle': Square,
  'Ellipse': Circle,
  'Probe': Target,
  'Bidirectional': Navigation,
  'ArrowAnnotate': MousePointer,
  'Magnify': ZoomIn,
  'Reset': RotateCcw,
  'Invert': FlipVertical,
  'Rotate': RotateCw,
  'FlipH': FlipHorizontal,
  'FlipV': FlipVertical,
  
  // Studies/Series
  'Studies': Layers,
  'Series': Image,
  'Measurements': Ruler,
  'Segmentations': Scan,
  'Thumbnail': Grid,
  
  // UI Controls
  'Settings': Settings,
  'Info': Info,
  'Visible': Eye,
  'Hidden': EyeOff,
  'Download': Download,
  'Export': Upload,
  'Save': Save,
//   'Print': Print,
  'Share': Share,
  'List': List,
  'Grid': Grid,
  'Filter': Filter,
  'Search': Search,
  
  // Status
  'Warning': AlertCircle,
  'Success': CheckCircle,
  'Error': XCircle,
  'Clock': Clock,
  
  // Fallback
  'MissingIcon': HelpCircle,
};

// Helper function to get Lucide icon
export const getLucideIcon = (iconName: string): LucideIcon => {
  return LucideIconMapping[iconName] || LucideIconMapping.MissingIcon;
};