import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { Price, Product } from '../model/layout.model';
import { formatMoney, formatPrice, monthlyPrice, periodMonths } from '../model/price';
import { CheckoutService, introPrice, plans } from './checkout.service';
import { ProductPicker } from './product-picker';

const FAKE_PAYMENT_MS = 1500;

function cardNumber(control: AbstractControl<string>): ValidationErrors | null {
  return /^\d{16}$/.test(control.value.replace(/\s/g, '')) ? null : { cardNumber: true };
}

function cardExpiry(control: AbstractControl<string>): ValidationErrors | null {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(control.value.trim());
  if (!match) return { format: true };
  const endOfMonth = new Date(2000 + Number(match[2]), Number(match[1]), 1);
  return endOfMonth.getTime() > Date.now() ? null : { expired: true };
}

const MESSAGES = {
  email: { required: 'Введите email', pattern: 'Проверьте email: в адресе ошибка' },
  number: { required: 'Введите номер карты', cardNumber: 'В номере карты должно быть 16 цифр' },
  expiry: { required: 'Введите срок действия карты', format: 'Срок действия в формате ММ/ГГ', expired: 'Срок действия карты истёк' },
  cvc: { required: 'Введите CVC', pattern: 'CVC — три цифры на обороте карты' },
} as const;

type Field = keyof typeof MESSAGES;

@Component({
  selector: 'app-checkout-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ProductPicker],
  templateUrl: './checkout-dialog.html',
  styleUrl: './checkout-dialog.scss',
})
export class CheckoutDialog {
  protected readonly checkout = inject(CheckoutService);
  protected readonly formatPrice = formatPrice;
  protected readonly formatMoney = formatMoney;
  protected readonly plans = plans;
  protected readonly introPrice = introPrice;

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['reader@example.com', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
    number: ['4242 4242 4242 4242', [Validators.required, cardNumber]],
    expiry: ['12/34', [Validators.required, cardExpiry]],
    cvc: ['123', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  protected readonly submitted = signal(false);

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly paidHeading = viewChild<ElementRef<HTMLElement>>('paidHeading');

  protected readonly paid = linkedSignal({ source: this.checkout.isOpen, computation: () => false });
  protected readonly processing = signal(false);
  private paymentTimer?: ReturnType<typeof setTimeout>;

  private pressedOnBackdrop = false;

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      const open = this.checkout.isOpen();
      if (open && !dialog.open) dialog.showModal();
      if (!open && dialog.open) {
        dialog.close();
        this.cancelPayment();
        this.form.reset();
        this.submitted.set(false);
      }
    });
    afterRenderEffect(() => this.paidHeading()?.nativeElement.focus());
    inject(DestroyRef).onDestroy(() => this.cancelPayment());
  }

  protected dueNow(plan: Price, product: Product): Price {
    return introPrice(plan, product) ?? plan;
  }

  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (control.valid || !(control.touched || this.submitted())) return null;
    const messages: Record<string, string> = MESSAGES[field];
    const key = Object.keys(control.errors ?? {}).find((k) => k in messages);
    return key ? messages[key] : null;
  }

  protected cardError(): string | null {
    return this.error('number') ?? this.error('expiry') ?? this.error('cvc');
  }

  protected monthlyTotal(price: Price, product: Product): number | null {
    const monthly = monthlyPrice(product);
    if (!monthly || price === monthly || price.trial) return null;
    const total = monthly.unitAmount * periodMonths(price);
    return total > price.unitAmount ? total : null;
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.checkout.close();
  }

  protected onPointerDown(event: PointerEvent): void {
    this.pressedOnBackdrop = event.target === event.currentTarget;
  }

  protected onClick(event: MouseEvent): void {
    if (this.pressedOnBackdrop && event.target === event.currentTarget) this.checkout.close();
    this.pressedOnBackdrop = false;
  }

  protected pay(form: HTMLFormElement): void {
    if (this.processing()) return;
    this.submitted.set(true);
    if (this.form.invalid) {
      form.querySelector<HTMLElement>('input.ng-invalid')?.focus();
      return;
    }
    this.processing.set(true);
    this.paymentTimer = setTimeout(() => {
      this.processing.set(false);
      this.paid.set(true);
    }, FAKE_PAYMENT_MS);
  }

  private cancelPayment(): void {
    clearTimeout(this.paymentTimer);
    this.processing.set(false);
  }
}
