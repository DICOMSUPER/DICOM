import { PartialType } from '@nestjs/swagger';
import { CreateImageSegmentationLayerDto } from './create-image-segmentation-layer.dto';

export class UpdateImageSegmentationLayerDto extends PartialType(
  CreateImageSegmentationLayerDto
) {}
