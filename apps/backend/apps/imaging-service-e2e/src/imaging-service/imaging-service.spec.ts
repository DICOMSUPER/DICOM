import { runBodyPartE2ETests } from './modules/body-part/body-part.test';
import { runDicomStudiesE2ETests } from './modules/dicom-study/dicom-studies.test';
import { runDicomSeriesE2ETests } from './modules/dicom-series/dicom-series.test';
import { runDicomInstanceE2ETests } from './modules/dicom-instances/dicom-instance.test';
import { runImageAnnotationsE2ETests } from './modules/image-annotations/image-annotations.test';
import { runImageSegmentationLayersE2ETests } from './modules/image-segmentation-layers/image-segmentation-layers.test';
import { runImagingModalitiesE2ETests } from './modules/imaging-modalities/imaging-modalities.test';
import { runImagingOrderFormsE2ETests } from './modules/imaging-order-forms/imaging-order-forms.test';
import { runDicomStudySignatureE2ETests } from './modules/dicom-study-signature/dicom-study-signature.test';

runBodyPartE2ETests();
runDicomStudiesE2ETests();
runDicomSeriesE2ETests();
runDicomInstanceE2ETests();
runImageAnnotationsE2ETests();
runImageSegmentationLayersE2ETests();
runImagingModalitiesE2ETests();
runImagingOrderFormsE2ETests();
runDicomStudySignatureE2ETests();
