import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import dcmjs from 'dcmjs';
import { DicomInstancesRepository } from './modules/dicom-instances/dicom-instances.repository';
import { DicomSeriesRepository } from './modules/dicom-series/dicom-series.repository';
import { DicomStudiesRepository } from './modules/dicom-studies/dicom-studies.repository';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ImagingModalityRepository } from './modules/imaging-modalities/imaging-modalities.repository';
import { ImagingOrderRepository } from './modules/imaging-orders/imaging-orders.repository';
import { ThrowMicroserviceException } from '@backend/shared-utils';
import { IMAGING_SERVICE } from '../constant/microservice.constant';
import { DicomStudyStatus } from '@backend/shared-enums';

export interface DICOMMetadata {
  // General Image Information
  '50000005': number;
  '50000010': number;
  '50000020': string;
  '50000030': [string, string];
  '50000103': number;
  '50000104': number;
  '50000105': number;
  '50000106': number;
  '50000110': [number, number];
  '50000112': number;
  '50000114': number;

  // Pixel Data (ArrayBuffer example)
  '50003000': ArrayBuffer[];

  // Image Attributes
  _vrMap: { PixelData: string };
  ImageType: string[];
  SOPClassUID: string;
  SOPInstanceUID: string;
  StudyDate: string;
  StudyTime: string;
  AccessionNumber: string;
  Modality: string;
  Manufacturer: string;
  InstitutionName: string;
  InstitutionAddress: string;
  ReferringPhysicianName: string[];
  StudyDescription: string;
  PerformingPhysicianName: string[];
  RETIRED_LossyImageCompressionRetired: string;
  SourceImageSequence: Array<{
    _vrMap: object;
    ReferencedSOPClassUID: string;
    ReferencedSOPInstanceUID: string;
  }>;

  // Software and System Info
  '00090010': string;
  '00091002': ArrayBuffer[];
  '00091003': ArrayBuffer[];
  '00091005': ArrayBuffer[];

  // Patient Information
  PatientName: { Alphabetic: string };
  PatientID: string;
  PatientBirthDate: string;
  PatientSex: string;

  // X-ray Settings
  KVP: number | null;
  FrameTime: number;
  Exposure: number | null;
  RadiationSetting: string;
  PositionerMotion: string;
  PositionerPrimaryAngle: number;
  PositionerSecondaryAngle: number;

  // Image Series Information
  '00190010': string;
  '00191030': number;
  StudyInstanceUID: string;
  SeriesInstanceUID: string;
  StudyID: string;
  SeriesNumber: number;
  InstanceNumber: number | null;
  PatientOrientation: string;

  // DICOM Specific Info
  '00210010': string;
  '00211013': number;
  SamplesPerPixel: number;
  PhotometricInterpretation: string;
  NumberOfFrames: number;
  FrameIncrementPointer: number;
  Rows: number;
  Columns: number;
  BitsAllocated: number;
  BitsStored: number;
  HighBit: number;
  PixelRepresentation: number;
  PixelIntensityRelationship: string;
  RecommendedViewingMode: string;
  RWavePointer: number[];
  MaskSubtractionSequence: Array<{
    _vrMap: object;
    MaskOperation: string;
    MaskFrameNumbers: number;
  }>;

  '00290010': string;
  '00291000': Array<{
    _vrMap: object;
    '00290010': string;
    '00291001': unknown[];
    '00291002': unknown[];
    '00291003': number;
  }>;
}

@Injectable()
export class AppService {
  constructor(
    @Inject()
    private readonly dicomInstancesRepository: DicomInstancesRepository,
    @Inject()
    private readonly dicomSeriesRepository: DicomSeriesRepository,
    @Inject()
    private readonly dicomStudiesRepository: DicomStudiesRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @Inject()
    private readonly imagingModalityRepository: ImagingModalityRepository,
    @Inject()
    private readonly imagingOrderRepository: ImagingOrderRepository
  ) {}
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  extractMetadataFromFileBuffer = (buffer: Buffer) => {
    const dicomData = dcmjs.data.DicomMessage.readFile(buffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
      dicomData.dict
    );

    return dataset;
  };

  createDicomStructure = async (
    data: DICOMMetadata,
    orderId: string,
    performingTechnicianId: string,
    filePath: string
  ) => {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        let createSeries = false;
        //check imaging order
        const order = await this.imagingOrderRepository.findOne(
          {
            where: { id: orderId, isDeleted: false },
          },
          [],
          transactionalEntityManager
        );
        if (!order) {
          throw ThrowMicroserviceException(
            HttpStatus.NOT_FOUND,
            `Imaging order not found, orderId: ${orderId}`,
            IMAGING_SERVICE
          );
        }

        //check imaging modality
        const modality = await this.imagingModalityRepository.findOne(
          {
            where: { id: order.modalityId, isDeleted: false },
          },
          [],
          transactionalEntityManager
        );
        if (!modality) {
          throw ThrowMicroserviceException(
            HttpStatus.NOT_FOUND,
            `Imaging modality not found, modalityId: ${order.modalityId}`,
            IMAGING_SERVICE
          );
        }
        if (modality.modalityCode !== data.Modality) {
          throw ThrowMicroserviceException(
            HttpStatus.BAD_REQUEST,
            `ModalityCode of the selected modality( ${modality.modalityCode} ) mismatch with the metadata modality code ( ${data.Modality}), please verify`,
            IMAGING_SERVICE
          );
        }

        //check instance exist => if exist => error
        let instance = await this.dicomInstancesRepository.findOne(
          {
            where: { sopInstanceUid: data.SOPInstanceUID, isDeleted: false },
          },
          [],
          transactionalEntityManager
        );
        if (instance) {
          throw ThrowMicroserviceException(
            HttpStatus.BAD_REQUEST,
            `Instance with SOPInstanceUID:${data.SOPInstanceUID} extracted from metadata has already exist in database`,
            IMAGING_SERVICE
          );
        }

        //check study exist
        let study = await this.dicomStudiesRepository.findOne(
          {
            where: {
              studyInstanceUid: data.StudyInstanceUID,
              isDeleted: false,
            },
          },
          [],
          transactionalEntityManager
        );

        //study not exist, create study with 1 series count, flag no futher check for series
        if (!study) {
          createSeries = true;
          study = await this.dicomStudiesRepository.create({
            studyInstanceUid: data.StudyInstanceUID,
            patientId: order.patientId,
            patientCode: data.PatientID,
            orderId: order.id,
            modalityId: order.modalityId,
            studyDate: data.StudyDate,
            studyTime: data.StudyTime,
            studyDescription: data.StudyDescription,
            referringPhysicianId: order.orderingPhysicianId,
            performingTechnicianId: performingTechnicianId,
            studyStatus: DicomStudyStatus.IN_PROGRESS,
            numberOfSeries: 0,
            storagePath: null,
          });
        }

        let series;
        if (!createSeries) {
          //check series exist
          series = await this.dicomSeriesRepository.findOne(
            {
              where: {
                seriesInstanceUid: data.SeriesInstanceUID,
                isDeleted: false,
              },
            },
            [],
            transactionalEntityManager
          );

          if (!series) {
            createSeries = true;
          }
        }

        //if need to create series: increase series count in study, create series
        if (createSeries) {
          series = await this.dicomSeriesRepository.create({
            seriesInstanceUid: data.SeriesInstanceUID,
            studyId: study.id,
            seriesNumber: study.numberOfSeries + 1,
            seriesDescription: '',
            bodyPartExamined: order.bodyPart,
            seriesDate: data.StudyDate || 'NA',
            seriesTime: data.StudyTime || 'NA',
            protocolName: 'NA',
            numberOfInstances: 1,
          });
          study = await this.dicomStudiesRepository.update(study.id, {
            numberOfSeries: study.numberOfSeries + 1,
          });

          //update instance count for series
        } else {
          if (!series) {
            throw ThrowMicroserviceException(
              HttpStatus.INTERNAL_SERVER_ERROR,
              'Invariant violation: series must be defined to update instance count',
              IMAGING_SERVICE
            );
          }
          series = await this.dicomSeriesRepository.update(series.id, {
            numberOfInstances: series.numberOfInstances + 1,
          });
        }

        if (!series) {
          throw ThrowMicroserviceException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Invariant violation: series must be defined before creating instance',
            IMAGING_SERVICE
          );
        }

        const instanceNumber = series.numberOfInstances;

        instance = await this.dicomInstancesRepository.create({
          sopInstanceUid: data.SOPInstanceUID,
          sopClassUID: data.SOPClassUID,
          seriesId: series.id,
          instanceNumber: instanceNumber,
          filePath: filePath,
          fileName: data.SOPInstanceUID,
          numberOfFrame: data.NumberOfFrames,
          rows: data.Rows,
          columns: data.Columns,
        });
        return {
          study,
          series,
          instance,
        };
      }
    );
  };
}
