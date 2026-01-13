export class OcrResultDto {
  job_id: string;
  status: 'done' | 'error';
  ocr_text?: string;
  stderr_tail?: string;
  stdout_tail?: string;
}
