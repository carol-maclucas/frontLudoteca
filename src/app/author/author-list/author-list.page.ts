import { Component, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AuthorEdit } from '../author-edit/author-edit';
import { AuthorService } from '../author';
import { Author } from '../model/Author';
import { Pageable } from '../../core/model/page/Pageable';
import { DialogConfirmation } from '../../core/dialog-confirmation/dialog-confirmation';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-author-list',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatIconModule, 
    MatTableModule, 
    CommonModule, 
    MatPaginatorModule,
  ],
  styleUrl: './author-list.page.scss',
  templateUrl: './author-list.page.html',
})
export class AuthorListPage implements OnInit {
  // Variables para la paginación
  totalElements: number = 0;
  pageSize: number = 5;
  pageNumber: number = 0;

  dataSource = new MatTableDataSource<Author>();
  displayedColumns: string[] = ['id', 'name', 'nationality', 'action'];
  protected readonly errorMessage = signal<string | null>(null);

  constructor(private authorService: AuthorService, public dialog: MatDialog) {}

    // Al iniciar la página
    ngOnInit(): void {
      this.loadPage();
    }

    loadPage(event?: PageEvent) {
      this.errorMessage.set(null);
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

      this.authorService.getAuthors(pageable).subscribe({
        next: (data) => {
          this.dataSource.data = data.content;
          this.pageNumber = data.pageable.pageNumber;
          this.pageSize = data.pageable.pageSize;
          this.totalElements = data.totalElements;
        },
        error: () => this.errorMessage.set('No se pudieron cargar los autores.'),
      });
    }

    createAuthor() {
        const dialogRef = this.dialog.open(AuthorEdit, {
            data: {},
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.ngOnInit();
        });
    }

    editAuthor(author: Author) {
        const dialogRef = this.dialog.open(AuthorEdit, {
            data: { author: author },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.ngOnInit();
        });
    }

    deleteAuthor(author: Author) {
        const dialogRef = this.dialog.open(DialogConfirmation, {
            data: {
                title: 'Eliminar autor',
                description:
                    'Atención si borra el autor se perderán sus datos.<br> ¿Desea eliminar el autor?',
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.errorMessage.set(null);
                this.authorService.deleteAuthor(author.id).subscribe({
                    next: () => this.loadPage(),
                    error: () => this.errorMessage.set('No se pudo eliminar el autor.'),
                });
            }
        });
    }
}
