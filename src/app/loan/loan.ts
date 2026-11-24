import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Pageable } from '../core/model/page/Pageable';
import { Loan } from './model/Loan';
// import { LOAN_DATA } from './model/mock-loans';
import { PaginatedData } from '../core/model/page/PaginatedData';
// import { LOANS } from './model/mock-loans-list';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

@Injectable({
    providedIn: 'root',
})
export class LoanService {
    constructor() { }

    // Inyección del HttpClient
    protected readonly http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/loan`;

    getLoans(pageable: Pageable, gameId?: number, clientId?: number, date?: Date, ):
     Observable<PaginatedData<Loan>> {
        return this.http.post<PaginatedData<Loan>>(this.baseUrl, {
            pageable,
            gameId,
            clientId,
            date: date ? formatLocalDate(date) : undefined,
        });
    }

    saveLoan(loan: Loan): Observable<void> {
        const { id } = loan;
        const url = id ? `${this.baseUrl}/${id}` : this.baseUrl;

        return this.http.put<void>(url, {
            ...loan,
            startDate: formatLocalDate(loan.startDate),
            endDate: formatLocalDate(loan.endDate),
        });
    }

    deleteLoan(idLoan: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${idLoan}`);
    }
    getAllLoans(): Observable<Loan[]> {
        return this.http.get<Loan[]>(this.baseUrl);
    }
}
