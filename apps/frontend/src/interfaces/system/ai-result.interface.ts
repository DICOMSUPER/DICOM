export interface AiResultDiagnosis {
  inference_id: string;
  image: {
    width: number;
    height: number;
  };
  predictions: PredictionMetadata[];
}

export interface PredictionMetadata {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  points: { x: number; y: number }[];
  class_id: number;
  detection_id: string;
}
