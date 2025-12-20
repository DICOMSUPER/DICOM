export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  format?: string; // 'currency' | 'date' | 'datetime' | 'number' | 'text'
  customFormat?: string; // Custom Excel format like '$#,##0.00'
}

export interface ExcelExportConfig {
  sheetName: string;
  columns: ExcelColumn[];
  headerStyle?: {
    bold?: boolean;
    backgroundColor?: string;
    fontColor?: string;
  };
  fileName?: string;
}

export interface FilterOptions {
  fromDate?: string;
  toDate?: string;
  [key: string]: any; // Allow dynamic filters
}
