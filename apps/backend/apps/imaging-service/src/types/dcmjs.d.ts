declare module 'dcmjs' {
  export const data: {
    DicomMessage: {
      readFile(buffer: Buffer): any;
    };
    DicomMetaDictionary: {
      naturalizeDataset(dict: any): any;
    };
  };
}
