import { BaseEntity } from '@backend/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BodyPart,ImagingModality } from '../imagings';
import { DiagnosesReport } from './diagnoses-reports.entity';
import { TemplateType } from '@backend/shared-enums';

@Entity({ name: 'report_templates' })
export class ReportTemplate extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'report_templates_id' })
  reportTemplatesId!: string;

  @Column({ name: 'template_name', type: 'varchar', length: 255 })
  templateName!: string;

  @Column({ name: 'template_type', type: 'enum', enum: TemplateType })
  templateType!: TemplateType;

  @Column({ type: 'uuid' })
  ownerUserId!: string;

  @Column({ type: 'uuid', name: 'modality_id', nullable: true })
  modalityId!: string;

  // body part id
  @Column({ type: 'uuid', name: 'body_part_id', nullable: true })
  bodyPartId!: string;
  @Column({ type: 'boolean', default: false })
  isPublic!: boolean;

  //   @Column({ type: 'json', nullable: true })
  //   templateStructure!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  descriptionTemplate!: string;
  @Column({ type: 'text', nullable: true })
  technicalTemplate!: string;

  @Column({ type: 'text', nullable: true })
  findingsTemplate!: string;

  @Column({ type: 'text', nullable: true })
  conclusionTemplate!: string;

  @Column({ type: 'text', nullable: true })
  recommendationTemplate!: string;


  @OneToMany(
    () => DiagnosesReport,
    (diagnosisReport) => diagnosisReport.reportTemplate
  )
  diagnosisReports!: DiagnosesReport[];

  modality?: ImagingModality;
  bodyPart?: BodyPart;
}
