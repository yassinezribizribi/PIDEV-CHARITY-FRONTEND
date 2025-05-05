// truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: any, limit: number = 50, trail: string = '...'): string {
    // Handle null/undefined cases
    if (value === null || value === undefined) {
      return '';
    }

    // Convert non-string values
    const stringValue = typeof value === 'string' ? value : String(value);

    // Handle invalid limit
    const validLimit = Number.isInteger(limit) ? limit : 50;

    // Perform truncation
    return stringValue.length > validLimit 
      ? stringValue.substring(0, validLimit) + trail 
      : stringValue;
  }
}