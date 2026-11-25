import { Component, EventEmitter, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [MatButtonModule],
  selector: 'app-dialog-confirmation',
  styleUrl: './dialog-confirmation.scss',
  templateUrl: './dialog-confirmation.html',
})
export class DialogConfirmation {
  protected readonly title = signal<string | null>(null);
  protected readonly description = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isConfirming = signal(false);

  protected readonly dialogRef = inject(MatDialogRef<DialogConfirmation>);
  protected readonly data = inject(MAT_DIALOG_DATA);
  readonly confirmRequested = new EventEmitter<void>();

  ngOnInit(): void {
    this.title.set(this.data.title);
    this.description.set(this.data.description);
  }

  onClose(value = false) {
    this.dialogRef.close(value);
  }

  onConfirm() {
    if (!this.confirmRequested.observed) {
      this.onClose(true);
      return;
    }

    this.isConfirming.set(true);
    this.errorMessage.set(null);
    this.confirmRequested.emit();
  }

  setError(message: string) {
    this.isConfirming.set(false);
    this.errorMessage.set(message);
  }
}
