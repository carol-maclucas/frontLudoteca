import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Loan } from '../model/Loan';
import { LoanService } from '../loan';
import { MatDialog } from '@angular/material/dialog';
import { Pageable } from '../../core/model/page/Pageable';
import { LoanEdit } from '../loan-edit/loan-edit';
import { DialogConfirmation } from '../../core/dialog-confirmation/dialog-confirmation';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Clients } from '../../clients/model/Clients';
import { Game } from '../../game/model/Game';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GameService } from '../../game/game';
import { ClientsService } from '../../clients/clients';


@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [    
    MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,],
  styleUrl: './loan-list.page.scss',
  templateUrl: './loan-list.page.html',
})
export class LoanListPage implements OnInit {
  // Variables para la paginación
  totalElements: number = 0;
  pageSize: number = 5;
  pageNumber: number = 0;

  dataSource = new MatTableDataSource<Loan>();
  displayedColumns: string[] = ['id', 'name', 'clientName', 'startDate', 'endDate', 'action'];

  protected readonly loanService = inject(LoanService);
  protected readonly dialog = inject(MatDialog)
  protected readonly gameService = inject(GameService);
  protected readonly clientsService = inject(ClientsService);

  //Inyección
  protected readonly games = signal<Game[]>([]);
  protected readonly clients = signal<Clients[]>([]);

  // Variables de filtro
  protected readonly filterGameId = signal<number | null>(null);
  protected readonly filterClientId = signal<number | null>(null);
  protected readonly filterDate = signal<Date | null>(null);
  protected readonly filterError = signal<string | null>(null);
  protected readonly listError = signal<string | null>(null);

    // Al iniciar la página
    ngOnInit(): void {
      this.gameService.getGames().subscribe({
        next: (games) => this.games.set(games),
        error: () => this.filterError.set('No se pudieron cargar las opciones de filtro.'),
      });
      this.clientsService.getClients().subscribe({
        next: (clients) => this.clients.set(clients),
        error: () => this.filterError.set('No se pudieron cargar las opciones de filtro.'),
      });
      this.loadPage();

    }
  
    loadPage(event?: PageEvent) {
      this.listError.set(null);
      //Paginado
      const pageable: Pageable = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sort: [
            {
              property: 'id',
              direction: 'ASC',
            },
        ],
      };

      if (event != null) {
          pageable.pageSize = event.pageSize;
          pageable.pageNumber = event.pageIndex;
      }
      //Filtrado
      const gameId = this.filterGameId() ?? undefined;
      const clientId = this.filterClientId() ?? undefined;
      const date = this.filterDate();

      this.loanService.getLoans(pageable, gameId, clientId, date)
      .subscribe({
        next: (data) => {
          this.dataSource.data = data.content;
          this.pageNumber = data.pageable.pageNumber;
          this.pageSize = data.pageable.pageSize;
          this.totalElements = data.totalElements;
        },
        error: () => this.listError.set('No se pudieron cargar los préstamos.'),
      });
    
    }
    // Buscar préstamos según los filtros seleccionados
    onSearch(): void {
      this.pageNumber = 0;
      this.loadPage();
    }
    // Limpiar los filtros y realizar la búsqueda
    onCleanFilter(): void {
      this.filterGameId.set(null);
      this.filterClientId.set(null);
      this.filterDate.set(null);
      this.onSearch();
    }
    // Crear préstamo
    createLoan() {
      const dialogRef = this.dialog.open(LoanEdit, {
        data: {},
      });
      
      dialogRef.afterClosed().subscribe((result) => {
        this.onSearch();
      });
    }

    // Editar préstamo
    editLoan(loan: Loan) {
      const dialogRef = this.dialog.open(LoanEdit, {
        data: { loan : loan },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.onSearch();
      });
    }

    deleteLoan(loan: Loan) {
      const dialogRef = this.dialog.open(DialogConfirmation, {
        data: {
          title: 'Eliminar préstamo',
          description:
          'Atención si borra el préstamo se perderán sus datos.<br> ¿Desea eliminar el préstamo?',
        },
      });
      
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.listError.set(null);
          this.loanService.deleteLoan(loan.id).subscribe({
            next: () => this.onSearch(),
            error: () => this.listError.set('No se pudo eliminar el préstamo.'),
          });
        }
      });
    }
}