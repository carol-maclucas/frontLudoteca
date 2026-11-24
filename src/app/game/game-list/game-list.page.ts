import { Component, OnInit, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameEdit } from '../game-edit/game-edit';
import { GameService } from '../game';
import { Game } from '../model/Game';
import { CategoryService } from '../../category/category';
import { Category } from '../../category/model/category';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GameItem } from './game-item/game-item';

@Component({
   selector: 'app-game-list',
   standalone: true,
   imports: [MatButtonModule,
        MatIconModule,
        MatTableModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        GameItem],
 
  styleUrl: './game-list.page.scss',
  templateUrl: './game-list.page.html',
})

export class GameListPage implements OnInit {
  // Inyección
  protected readonly categories = signal<Category[]>([]);
  protected readonly games = signal<Game[]>([]);
  // Variables de filtro
  protected readonly filterCategory = signal<Category | null>(null);
  protected readonly filterTitle = signal<string>('');
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly gameService = inject(GameService);
  protected readonly categoryService = inject(CategoryService);
  protected readonly dialog = inject(MatDialog)

  // Al iniciar la página, se cargan los juegos y las categorías
  ngOnInit(): void {
    this.onSearch();
    this.categoryService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.errorMessage.set('No se pudieron cargar las categorías.'),
    });
  }

  // Limpiar los filtros y realizar la búsqueda
  onCleanFilter(): void {
    this.filterTitle.set('');
    this.filterCategory.set(null);
    this.onSearch();
  }

  // Buscar juegos según los filtros de título y categoría
  onSearch(): void {
    const title = this.filterTitle();
    const categoryId = this.filterCategory() != null ? this.filterCategory().id : null;

    this.errorMessage.set(null);
    this.gameService
      .getGames(title, categoryId)
      .subscribe({
        next: (games) => this.games.set(games),
        error: () => this.errorMessage.set('No se pudieron cargar los juegos.'),
      });
  }

    createGame() {
        const dialogRef = this.dialog.open(GameEdit, {
            data: {},
        });

        dialogRef.afterClosed().subscribe((result) => {
            if(!result) return;
            this.onSearch();
        });
    }

  editGame(game: Game) {
    const dialogRef = this.dialog.open(GameEdit, {
      data: { game: game },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if(!result) return;
        this.onSearch();
      });
    }
}
