import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';



import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { TreetestStudiesComponent } from './treetest-components/treetest-studies/treetest-studies.component';
import { CardsortStudiesComponent } from './cardsort-components/cardsort-studies/cardsort-studies.component';
import { RegisterComponent } from './register/register.component';

import { AuthenticationService } from './authentification.service';
import { AlertService } from './alert.service';
import { UserService } from './user.service';
import { CreateTestComponent } from './treetest-components/create-treetest-study/create-tree-test.component';
import { TreetestStudyComponent } from './treetest-components/treetest-study/treetest-study.component';
import { TreetestTestsComponent } from './treetest-components/treetest-tests/treetest-tests.component';
import { CardsortTestsComponent } from './cardsort-components/cardsort-tests/cardsort-tests.component';
import { PathtreeComponent } from './treetest-components/pathtree/pathtree.component';
import { AdminComponent } from './admin/admin.component';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CreateCardSortComponent } from './cardsort-components/create-cardsort-study/create-card-sort.component';
import { CardsortStudyComponent } from './cardsort-components/cardsort-study/cardsort-study.component';
import { CardListComponent } from './cardsort-components/card-list/card-list.component';
import { SortingComponent } from './cardsort-components/sorting/sorting.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import {CardsortTestMatrixComponent} from './cardsort-components/cardsort-test-matrix/cardsort-test-matrix.component';

import {participantsFilterPipe} from 'src/app/pipes/filter.pipe';
import {datePipe} from './pipes/datePipe.pipe';
import { StudyClosedComponent } from './study-closed/study-closed.component';
import { LanguageService } from './language.service';
import { JwtInterceptor } from './jwt.interceptor';

const appRoutes: Routes = [
  { path: 'admin', component: AdminComponent},
  { path: 'create-tree-test', component: CreateTestComponent},
  { path: 'create-card-sort', component: CreateCardSortComponent},
  { path: 'create-tree-test/:id', component: CreateTestComponent},
  { path: 'create-card-sort/:id', component: CreateCardSortComponent},
  { path: 'cardsort/:id', component: CardsortStudyComponent},
  { path: 'cardsort-preview/:id', component: CardsortStudyComponent},
  { path: 'treetest/:id', component: TreetestStudyComponent},
  { path: 'treetest-preview/:id', component: TreetestStudyComponent},
  { path: 'results/:id', component: TreetestTestsComponent},
  { path: 'card-sort-results/:id', component: CardsortTestsComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tests', component: TreetestStudiesComponent},
  { path: 'card-sort-tests', component: CardsortStudiesComponent},
  { path: 'pie-tree/:id/:index', component: PathtreeComponent },
  {path: 'study-closed', component: StudyClosedComponent},
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    TreetestStudiesComponent,
    CardsortStudiesComponent,
    RegisterComponent,
    CreateTestComponent,
    TreetestStudyComponent,
    TreetestTestsComponent,
    CardsortTestsComponent,
    PathtreeComponent,
    AdminComponent,
    CreateCardSortComponent,
    CardsortStudyComponent,
    CardListComponent,
    CardsortTestMatrixComponent,
    SortingComponent,
    participantsFilterPipe,
    datePipe,
    StudyClosedComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    DragDropModule
  ],
  exports: [RouterModule],
  providers: [
    AuthenticationService,
    AlertService,
    UserService,
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    // TranslationService,
    LanguageService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function createTranslateLoader(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}
