import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Clients } from '../model/Clients';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClientsService } from '../clients';
import { MatDialog } from '@angular/material/dialog';
import { ClientsEdit } from '../clients-edit/clients-edit';
import { DialogConfirmation } from '../../core/dialog-confirmation/dialog-confirmation';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [  
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule],
  
  styleUrl: './clients-list.page.scss',
  templateUrl: './clients-list.page.html',
})
export class ClientsListPage implements OnInit {
  dataSource = new MatTableDataSource<Clients>();
  displayedColumns: string[] = ['id', 'name', 'action'];

  // Inyección
  protected readonly clientsService = inject(ClientsService);
  protected readonly dialog = inject(MatDialog);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.errorMessage.set(null);
    this.clientsService.getClients().subscribe({
      next: (clients) => this.dataSource.data = clients,
      error: () => this.errorMessage.set('No se pudieron cargar los clientes.'),
    });
  }

  // Crear cliente
    createClient() {    
      // Abrir el diálogo para crear una nueva categoría
      const dialogRef = this.dialog.open(ClientsEdit, {
        data: {}
      });

      dialogRef.afterClosed().subscribe(result => {
        if(!result) return; // Si no hay resultado, no hacer nada

        this.loadData();
      });
    }   

    // Editar cliente
    editClient(clients: Clients) {
      const dialogRef = this.dialog.open(ClientsEdit, {
        data: { client: clients }
      });
      dialogRef.afterClosed().subscribe(result => {
        if(!result) return;
        this.loadData();
      });
    }    

    // Eliminar cliente
    deleteClient(clients: Clients) {    
      const dialogRef = this.dialog.open(DialogConfirmation, {
        data: { title: "Eliminar cliente", 
        description: "Atención si borra el cliente se perderán sus datos.<br> ¿Desea eliminar el cliente?" }
      });

      dialogRef.componentInstance.confirmRequested.subscribe(() => {
        this.clientsService.deleteClient(clients.id).subscribe({
          next: () => {
            dialogRef.close(true);
            this.loadData();
          },
          error: (error: HttpErrorResponse) => {
            const body = error.error;
            const detail = typeof body === 'string'
              ? body
              : [body?.message, body?.error, body?.detail, body?.title]
                .filter((value): value is string => typeof value === 'string')
                .join(' ');
            const activeLoanConflict = error.status === 409
              && /pr[eé]stamos?\s+(activos?|vigentes?)/i.test(detail);

            if (activeLoanConflict) {
              dialogRef.componentInstance.setError(
                'No se puede eliminar el cliente porque tiene préstamos activos.'
              );
            } else if (error.status === 0) {
              dialogRef.componentInstance.setError('No se pudo conectar con el servidor.');
            } else if (error.status === 409) {
              dialogRef.componentInstance.setError(
                detail || 'No se puede eliminar el cliente por un conflicto con datos relacionados.'
              );
            } else {
              dialogRef.componentInstance.setError(
                detail || 'No se pudo eliminar el cliente. Inténtalo de nuevo.'
              );
            }
          },
        });
      });
    }
}
