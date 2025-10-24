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
    Trash2,
    Undo,
    Zap,
    Paintbrush,
    CircleDot,
    Globe
} from 'lucide-react';

export const lengthToolsMenu = [
  { item: 'Length Tool', icon: Ruler },
  { item: 'Height', icon: Ruler },
  { item: 'Circle', icon: Circle },
  { item: 'Elliptical ROI', icon: Ellipsis },
  { item: 'Rectangle ROI', icon: Square },
  { item: 'Bidirectional', icon: ArrowDownLeft },
  { item: 'Angle', icon: RotateCcw },
  { item: 'Cobb Angle', icon: RotateCcw },
  { item: 'Arrow Annotate', icon: Pen },
  { item: 'Spline ROI', icon: Spline },
  { item: 'SegmentBidirectional', icon: ArrowDownLeft },
  { item: 'ScaleOverlay', icon: Ruler },
];

export const shapeToolsMenu = [
  { item: 'Magnify', icon: Search },
  { item: 'PlanarRotate', icon: RotateCcw },
  { item: 'TrackballRotate', icon: RotateCcw },
  { item: 'OrientationMarker', icon: Camera },
  { item: 'ETDRSGrid', icon: Grid3X3 },
  { item: 'ReferenceLines', icon: Link },
  { item: 'OverlayGrid', icon: Grid3X3 },
  { item: 'Reset', icon: RotateCcw },
];

export const annotationToolsMenu = [
  { item: 'KeyImage', icon: Camera },
  { item: 'Label', icon: Pen },
  { item: 'DragProbe', icon: Search },
  { item: 'PaintFill', icon: Pen },
  { item: 'Eraser', icon: RotateCcw },
  { item: 'ClearSegmentation', icon: Trash2 },
  { item: 'UndoAnnotation', icon: Undo },
  { item: 'Freehand', icon: Pen },
  { item: 'Spline ROI', icon: Spline },
  { item: 'Livewire tool', icon: Zap },
];

export const segmentationToolsMenu = [
  { item: 'Brush', icon: Paintbrush },
  { item: 'CircleScissors', icon: CircleDot },
  { item: 'RectangleScissors', icon: Square },
  { item: 'SphereScissors', icon: Globe },
  { item: 'Eraser', icon: Trash2 },
  { item: 'ClearSegmentation', icon: Trash2 },
];

export const mainTools = [
  { icon: Search, tooltip: 'Zoom' },
  { icon: Move, tooltip: 'Pan' },
  { icon: ScanLine, tooltip: 'Window Level' },
  { icon: Camera, tooltip: 'Capture' },
  { icon: Grid3X3, tooltip: 'Change layout' },

];