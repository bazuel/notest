import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'input[label], textarea[label], nt-autocomplete[label], nt-async-autocomplete[label]'
})
export class InputLabelDirective implements OnInit {
  @Input() label: string = '';

  private style: Partial<CSSStyleDeclaration> = {
    fontSize: '0.875rem', // .text-sm
    position: 'absolute', // .absolute
    top: '0', // .top-0
    transform: 'translateY(-50%)', // -translate-y-1/2
    left: '0.5rem', // .left-2
    fontWeight: '600', // .font-semibold
    color: 'var(--bo-theme-color)', // .text-bop
    backgroundImage:
      'linear-gradient(to bottom, rgba(255, 255, 255, 0) 48%, rgba(247, 250, 252, 1) 52%, rgba(247, 250, 252, 0) 100%)', // .bg-gradient-to-b, .from-white, .to-gray-100
    padding: '0 0.25rem', // .px-1
    whiteSpace: 'nowrap', // .whitespace-nowrap
    width: 'fit-content', // .w-auto
    zIndex: '1',
    textTransform: 'Capitalize'
  };

  constructor(private inputElement: ElementRef<HTMLInputElement>) {}

  ngOnInit() {
    const input = this.inputElement.nativeElement;
    const originalParent = input.parentNode!;
    const newParent = document.createElement('div');

    let tailwindMarginPrefixies = ['m-', 'mt-', 'mb-', 'ml-', 'mx-', 'mr-', 'my-'];

    input.classList.forEach((c) => {
      if (tailwindMarginPrefixies.some((pref) => c.includes(pref))) {
        newParent.classList.add(c);
        input.classList.remove(c);
      }
    });
    if (
      !newParent.classList.value.includes('mt-') &&
      !newParent.classList.value.includes('m-') &&
      !newParent.classList.value.includes('my-')
    )
      newParent.classList.add('mt-8');
    newParent.style.position = 'relative';
    newParent.style.width = 'fit-content';

    const label = document.createElement('div');
    Object.assign(label.style, this.style);
    label.textContent = this.label;
    label.addEventListener('click', () => {
      if (input.getAttribute('readonly') != null || input.classList.contains('readonly')) return;
      if (input.tagName == 'INPUT' || input.tagName == 'TEXTAREA') input.select();
      else input.querySelector('input')!.select();
    });
    originalParent.insertBefore(newParent, input);
    newParent.appendChild(label);
    newParent.appendChild(input);
    if (input.offsetWidth < label.offsetWidth + 16) {
      input.style.width = label.offsetWidth + 25 + 'px';
    }
    this.observeInputRemoval(input, newParent);
  }

  private observeInputRemoval(input: HTMLInputElement, label: HTMLDivElement): void {
    const observer = new MutationObserver(() => {
      if (document.contains(input)) {
        // const rect = input.getBoundingClientRect();
        // label.style.top = `${rect.top}px`;
        // label.style.left = `${rect.left + 8}px`;
      } else {
        label.remove();
        observer.disconnect();
      }
    });

    observer.observe(document, { childList: true, subtree: true });
  }
}
