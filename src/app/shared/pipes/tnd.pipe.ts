import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tnd',
  standalone: true
})
export class TndPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return `${value.toFixed(3)} TND`;
  }
} 