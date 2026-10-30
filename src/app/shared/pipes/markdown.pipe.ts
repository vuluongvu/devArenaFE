import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    try {
      // Synchronously parse Markdown into HTML
      let html = marked.parse(value, {
        gfm: true,
        breaks: true
      }) as string;

      // Format superscripts inside <code> tags: 10^4 -> 10<sup>4</sup>
      html = html.replace(/<code>(.*?)<\/code>/g, (_match, codeContent) => {
        const formatted = codeContent.replace(/\^(\d+)/g, (_s: string, exp: string) => `<sup>${exp}</sup>`);
        return `<code>${formatted}</code>`;
      });

      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch {
      return value;
    }
  }
}
