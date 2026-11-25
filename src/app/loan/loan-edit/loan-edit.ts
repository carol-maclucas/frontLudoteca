import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GameService } from '../../game/game';
import { ClientsService } from '../../clients/clients';
import { LoanService } from '../loan';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Loan } from '../model/Loan';
import { Game } from '../../game/model/Game';
import { validateFields } from '../../core/helpers/validation';
import { Clients } from '../../clients/model/Clients';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  imports: [ 
    FormsModule,
    MatDatepickerModule,
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatButtonModule, 
    MatSelectModule],
  providers: [provideNativeDateAdapter()],
  standalone: true,
  selector: 'app-loan-edit',
  styleUrl: './loan-edit.scss',
  templateUrl: './loan-edit.html',
})
export class LoanEdit implements OnInit {
  // Atributos
  protected readonly id = signal<number | null>(null);
  protected readonly gameId = signal<number | null>(null);
  protected readonly clientId = signal<number | null>(null);
  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);
  protected readonly games = signal<Game[]>([]);
  protected readonly clients = signal<Clients[]>([]);
  protected readonly minEndDate = computed(() => {
    const startDate = this.startDate();
    return startDate ? this.addDays(startDate, 1) : this.today;
  });
  protected readonly maxEndDate = computed(() => {
    const startDate = this.startDate();
    return startDate ? this.addDays(startDate, this.MAX_LOAN_DAYS) : null;
  });
  // Inyección
  protected readonly dialogRef = inject(MatDialogRef<LoanEdit>);
  protected readonly data = inject(MAT_DIALOG_DATA);
  // Servicios
  protected readonly loanService = inject(LoanService);
  protected readonly gameService = inject(GameService);
  protected readonly clientService = inject(ClientsService);
  // Validación
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly today = new Date();

  private readonly MAX_LOAN_DAYS = 14;

  ngOnInit(): void {
    this.loadFormData(this.data.loan ?? null);
  }

  loadFormData(initialData: Loan | null): void {
    this.id.set(initialData?.id ?? null);
    this.startDate.set(initialData?.startDate ? new Date(initialData.startDate) : null);
    this.endDate.set(initialData?.endDate ? new Date(initialData.endDate) : null);

    this.gameService.getGames().subscribe({
      next: (games) => {
        this.games.set(games);
        if (games.length === 0) {
          this.errorMessage.set('No hay juegos disponibles para seleccionar.');
          return;
        }
        this.gameId.set(initialData?.game?.id ?? null);
      },
      error: () => this.errorMessage.set('No se pudieron cargar los juegos. Comprueba que el servidor esté activo.'),
    });
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        if (clients.length === 0) {
          this.errorMessage.set('No hay clientes disponibles para seleccionar.');
          return;
        }
        this.clientId.set(initialData?.client?.id ?? null);
      },
      error: () => this.errorMessage.set('No se pudieron cargar los clientes. Comprueba que el servidor esté activo.'),
    });
  }
  onSave() {
    const id = this.id();
    const gameId = this.gameId();
    const clientId = this.clientId();
    const startDate = this.startDate();
    const endDate = this.endDate();
    this.errorMessage.set(null);

    const requiredFields = ["gameId", "clientId", "startDate", "endDate"] as const;
    const data = { gameId, clientId, startDate, endDate};
  
    // Validar campos requeridos
    if (!validateFields(data, requiredFields)) {
      this.errorMessage.set("Completa el juego, el cliente y ambas fechas.");
      return;
    }

    // Rechazar fechas anteriores o iguales, devolución solo posterior
    const startDay = new Date(startDate!.getFullYear(), startDate!.getMonth(), startDate!.getDate()).getTime();
    const endDay = new Date(endDate!.getFullYear(), endDate!.getMonth(), endDate!.getDate()).getTime();

    if (endDay <= startDay){
      this.errorMessage.set("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }
  
    const maxEndDay = this.addDays(startDate!, this.MAX_LOAN_DAYS).getTime();
    if (endDay > maxEndDay) {
      this.errorMessage.set(`El préstamo no puede exceder los ${this.MAX_LOAN_DAYS} días.`);
      return;
    }
    
    const loan = {id,
      game: this.games().find(g => g.id === this.gameId()) ?? null,
      client: this.clients().find(f => f.id === this.clientId()) ?? null,
      startDate: this.startDate(),
      endDate: this.endDate(),
    } as Loan;
      
    this.loanService.saveLoan(loan).subscribe({
      next: () => this.dialogRef.close(true),
      error: (error) => {
        const detail = typeof error.error === 'string' ? error.error : error.error?.message ?? '';
        if (error.status === 409 || /ya.+prestado|solap/i.test(detail)) {
          this.errorMessage.set('El juego ya está prestado en esas fechas.');
        } else if (error.status === 400) {
          this.errorMessage.set(detail || 'Los datos del préstamo no son válidos.');
        } else if (error.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor.');
        } else {
          this.errorMessage.set('No se pudo guardar el préstamo. Inténtalo de nuevo.');
        }
      },
    });
    }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() + days);
    return result;
  }
  
    onClose() {
      this.dialogRef.close();
    }
}
