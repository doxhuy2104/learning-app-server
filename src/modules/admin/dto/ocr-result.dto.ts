export class OcrResultDto {
  file_name: string;
  work_item_id: string;
  status: 'done' | 'error';
  stdout_tail?: string;
  stderr_tail?: string;
}
