import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { SessionsPageComponent } from './app/sessions/sessions-page.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter([
      { path: '', component: SessionsPageComponent },
      { path: '**', redirectTo: '' },
    ]),
  ],
}).catch((err) => console.error(err));
