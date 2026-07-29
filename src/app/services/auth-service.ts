import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, timeout } from 'rxjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:5001/api';
  private readonly storageKey = 'e-shop-user';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  readonly user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(user: Omit<AuthUser, 'id'> & { password: string }): Observable<{ message: string; user: AuthUser }> {
    // Registration creates the user in MongoDB, but does not create an authenticated session.
    return this.http.post<{ message: string; user: AuthUser }>(`${this.baseUrl}/register`, user).pipe(timeout(5000));
  }

  login(credentials: { email: string; password: string }): Observable<{ message: string; user: AuthUser }> {
    return this.http.post<{ message: string; user: AuthUser }>(`${this.baseUrl}/login`, credentials).pipe(
      timeout(5000),
      tap((response) => this.storeUser(response.user)),
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  private getStoredUser(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || 'null') as AuthUser | null;
    } catch {
      return null;
    }
  }

  private storeUser(user: AuthUser): void {
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
  }
}
