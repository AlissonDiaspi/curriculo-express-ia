
import { Injectable } from '@nestjs/common';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

import { TemplateLoaderService } from './template-loader.service.js';

import type {
  CreateResumeInput,
} from '../../resumes/schemas/resume.schema.js';

type ResumeContent = CreateResumeInput['content'];

export interface ResumeHeaderData {
  fullName: string;
  email: string;
  phone?: string;
  city?: string;
}

@Injectable()
export class DocxGeneratorService {
  constructor(
    private readonly templateLoader: TemplateLoaderService,
  ) {}

  private async renderDocument(
    templateId: string,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    const templateBuffer =
      await this.templateLoader.loadTemplate(templateId);

    const zip = new PizZip(templateBuffer);

    const document = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    document.render(data);

    return document.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });
  }

  async generateHeaderTest(
    templateId: string,
    data: ResumeHeaderData,
  ): Promise<Buffer> {
    const contact = [
      data.city,
      data.phone,
      data.email,
    ]
      .filter((value) => Boolean(value?.trim()))
      .join(' | ');

    return this.renderDocument(templateId, {
      fullName: data.fullName,
      contact,
    });
  }

  async generateResume(
    templateId: string,
    content: ResumeContent,
  ): Promise<Buffer> {
    const personal = content.personal;

    const contact = [
      personal.city,
      personal.phone,
      personal.email,
      personal.linkedin,
      personal.website,
    ]
      .filter((value) => Boolean(value?.trim()))
      .join(' | ');

    const summary = content.summary.trim();

    const education = content.education.map(
      (item) => ({
        institution: item.institution.trim(),
        course: item.course.trim(),
        period: this.formatPeriod(
          item.startDate,
          item.endDate,
          item.inProgress,
        ),
      }),
    );

    const experiences = content.experiences.map(
      (item) => ({
        company: item.company.trim(),
        role: item.role.trim(),
        period: this.formatPeriod(
          item.startDate,
          item.endDate,
          item.isCurrent,
        ),
        description: item.description.trim(),
      }),
    );

    const skills = content.skills
      .map((skill) => skill.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    return this.renderDocument(templateId, {
      fullName: personal.fullName.trim(),
      contact,

      hasSummary: summary.length > 0,
      summary,

      hasEducation: education.length > 0,
      education,

      hasExperiences: experiences.length > 0,
      experiences,

      hasSkills: skills.length > 0,
      skills,
    });
  }

  private formatPeriod(
    startDate: string,
    endDate: string,
    isCurrent: boolean,
  ): string {
    const start = startDate.trim();
    const end = isCurrent
      ? 'Atual'
      : endDate.trim();

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end;
  }
}
