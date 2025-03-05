// interfaces/association.interface.ts
export enum AssociationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Association {
  idAssociation?: number;
  associationName: string;
  associationAddress: string;
  description: string;
  associationLogoPath: string;
  registrationDocumentPath: string;
  legalDocumentPath: string;
  status: AssociationStatus; // Use the enum type
  subscriber?: any;
}