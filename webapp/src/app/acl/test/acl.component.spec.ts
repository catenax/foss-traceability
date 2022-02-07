import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { TemplateModule } from 'src/app/shared/template.module';
import { icons } from 'src/app/shared/shared-icons.module';
import { AclEmptyStateComponent } from '../presentation/acl-empty-state/acl-empty-state.component';
import { AclHistoryComponent } from '../presentation/acl-history/acl-history.component';
import { AclDetailComponent } from '../presentation/acl-list/acl-detail/acl-detail.component';
import { AclListComponent } from '../presentation/acl-list/acl-list.component';
import { AclSkeletonComponent } from '../presentation/acl-skeleton/acl-skeleton.component';
import { AclTabsComponent } from '../presentation/acl-tabs/acl-tabs.component';
import { AclComponent } from '../presentation/acl.component';
import { RequestModalComponent } from '../presentation/request-modal/request-modal.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { AclFacade } from '../abstraction/acl.facade';
import { of } from 'rxjs';
import { View } from 'src/app/shared/model/view.model';
import { Acl } from '../model/acl.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AclComponent', () => {
  let component: AclComponent;
  let fixture: ComponentFixture<AclComponent>;
  const aclFacadeStub = {
    get() {
      const view: View<Acl[]> = { data: [] };
      return of(view);
    },

    setAcls() {
      return true;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        TemplateModule,
        SharedModule,
        SvgIconsModule.forRoot({
          defaultSize: 'sm',
          sizes: {
            xs: '18px',
            sm: '24px',
            md: '36px',
            lg: '48px',
            xl: '64px',
            xxl: '128px',
          },
        }),
        SvgIconsModule.forChild(icons),
      ],
      declarations: [
        AclComponent,
        AclListComponent,
        AclDetailComponent,
        AclHistoryComponent,
        RequestModalComponent,
        AclTabsComponent,
        AclEmptyStateComponent,
        AclSkeletonComponent,
      ],
      providers: [{ provide: AclFacade, useValue: aclFacadeStub }],
    });
    fixture = TestBed.createComponent(AclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
