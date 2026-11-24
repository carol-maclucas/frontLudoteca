import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Clients } from './model/Clients';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Era mejor hacerlo todo con "Client" en singular pero para no romper el código 
// ya existente, lo ha dejado como "Clients"
@Injectable({
    providedIn: 'root'  
})
export class ClientsService {
    constructor() { }

    protected readonly http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/clients`;

    getClients(): Observable<Clients[]> {
        return this.http.get<Clients[]>(this.baseUrl);
    }

    saveClient(client: Clients): Observable<Clients> {
        const {id} = client;
        const url = id ? `${this.baseUrl}/${id}` : this.baseUrl;
        return this.http.put<Clients>(url, client);
    }

    deleteClient(idClient: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${idClient}`);
    }
}
