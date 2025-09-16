import {
    ArrowDownLeft,
    Camera,
    Circle,
    Ellipsis,
    Grid3X3,
    Link,
    Move,
    Pen,
    RotateCcw,
    Ruler,
    ScanLine,
    Search,
    Spline,
    Square,
    Zap
} from 'lucide-react';

export const lengthToolsMenu = [
  { item: 'Length Tool', icon: Ruler },
  { item: 'Circle', icon: Circle },
  { item: 'Linear Annotation', icon: ArrowDownLeft },
];

export const shapeToolsMenu = [
  { item: 'Reset', icon: RotateCcw },
  { item: 'Rectangle', icon: Square },
  { item: 'Circle', icon: Circle },
];

export const annotationToolsMenu = [
  { item: 'Freehand', icon: Pen },
  { item: 'Spline ROI', icon: Spline },
  { item: 'Livewire tool', icon: Zap },
];

export const mainTools = [
  { icon: Search, tooltip: 'Zoom' },
  { icon: Move, tooltip: 'Pan' },
  { icon: ScanLine, tooltip: 'Window Level' },
  { icon: Camera, tooltip: 'Capture' },
  { icon: Grid3X3, tooltip: 'Change layout' },

];