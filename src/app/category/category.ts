import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { Category } from './model/category';
//import { CATEGORY_DATA } from './model/mock-categories';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    constructor() { }

    protected readonly http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/category`;
    // La URL base de la API se configura por entorno
    // Permite cambiar la URL de la API sin tener que modificar el código fuente del servicio

    //mockear datos de Categorias
    getCategories(): Observable<Category[]> {
        //return of(CATEGORY_DATA);
        return this.http.get<Category[]>(this.baseUrl);
    }

    //EDITAR CATEGORIA
    saveCategory(category: Category): Observable<Category> {
        const {id} = category;
        // Si el id es nulo o indefinido crea una nueva 
        const url = id ? `${this.baseUrl}/${id}` : this.baseUrl;
        return this.http.put<Category>(url, category);
    }

    //ELIMINAR CATEGORIA
    deleteCategory(idCategory: number): Observable<void> {
       return this.http.delete<void>(`${this.baseUrl}/${idCategory}`);
    }

    getAllCategories(): Observable<Category[]> {
            return this.http.get<Category[]>(this.baseUrl);
    }
}