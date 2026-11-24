import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Category } from '../model/category';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CategoryService } from '../category';
import { MatDialog } from '@angular/material/dialog';
import { CategoryEdit } from '../category-edit/category-edit';
import { DialogConfirmation } from '../../core/dialog-confirmation/dialog-confirmation';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule
  ],
  styleUrl: './category-list.page.scss',
  templateUrl: './category-list.page.html',
})

export class CategoryListPage implements OnInit {
    dataSource = new MatTableDataSource<Category>();
    displayedColumns: string[] = ['id', 'name', 'action'];
    //Inyeccion moderna
    protected readonly categoryService = inject(CategoryService);
    protected readonly dialog = inject(MatDialog);
    protected readonly errorMessage = signal<string | null>(null);
    
    // EDITAR CATEGORIA
    createCategory() {    
      // Abrir el diálogo para crear una nueva categoría
      const dialogRef = this.dialog.open(CategoryEdit, {
        data: {}
      });

      dialogRef.afterClosed().subscribe(result => {
        if(!result) return; // Si no hay resultado, no hacer nada

        this.loadData();
      });
    } 
    
    editCategory(category: Category) {
      const dialogRef = this.dialog.open(CategoryEdit, {
        data: { category }
      });
      dialogRef.afterClosed().subscribe(result => {
        if(!result) return;
        this.loadData();
      });
    }

    deleteCategory(category: Category) {    
      const dialogRef = this.dialog.open(DialogConfirmation, {
        data: { title: "Eliminar categoría", 
        description: "Atención si borra la categoría se perderán sus datos.<br> ¿Desea eliminar la categoría?" }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.errorMessage.set(null);
          this.categoryService.deleteCategory(category.id).subscribe({
            next: () => this.loadData(),
            error: () => this.errorMessage.set('No se pudo eliminar la categoría.'),
          });
        }
      });
    }  
    
    // Al INICIAR la página, se cargan los datos de las categorías
    ngOnInit(): void {
      this.loadData();
    }
    // Cargar datos
    loadData(): void {
        this.errorMessage.set(null);
        this.categoryService.getCategories().subscribe({
          next: (categories) => this.dataSource.data = categories,
          error: () => this.errorMessage.set('No se pudieron cargar las categorías.'),
        });
    }
}

