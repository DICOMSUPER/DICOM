import { runBodyPartE2ETests } from './modules/body-part/body-part.test';
import { runDicomStudiesE2ETests } from './modules/dicom-study/dicom-studies.test';
import { runDicomSeriesE2ETests } from './modules/dicom-series/dicom-series.test';
import { runDicomInstanceE2ETests } from './modules/dicom-instances/dicom-instance.test';
import { runImageAnnotationsE2ETests } from './modules/image-annotations/image-annotations.test';
import { runImageSegmentationLayersE2ETests } from './modules/image-segmentation-layers/image-segmentation-layers.test';
import { runImagingModalitiesE2ETests } from './modules/imaging-modalities/imaging-modalities.test';
// import { runImagingOrderFormsE2ETests } from './modules/imaging-order-forms/imaging-order-forms.test'; // Requires SYSTEM_SERVICE and USER_SERVICE - not suitable for single microservice unit tests
import { runDicomStudySignatureE2ETests } from './modules/dicom-study-signature/dicom-study-signature.test';
import { runImagingOrdersE2ETests } from './modules/imaging-orders/imaging-orders.test';
import { runModalityMachinesE2ETests } from './modules/modality-machines/modality-machines.test';
import { runRequestProceduresE2ETests } from './modules/request-procedures/request-procedures.test';

runBodyPartE2ETests();
runDicomStudiesE2ETests();
runDicomSeriesE2ETests();
runDicomInstanceE2ETests();
runImageAnnotationsE2ETests();
runImageSegmentationLayersE2ETests();
runImagingModalitiesE2ETests();
// runImagingOrderFormsE2ETests(); // Commented out - requires external microservices (SYSTEM_SERVICE, USER_SERVICE)
runDicomStudySignatureE2ETests();
runImagingOrdersE2ETests();
runModalityMachinesE2ETests();
runRequestProceduresE2ETests();
