/*
 * Copyright 2021 The PartChain Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateModule } from 'src/app/shared/template.module';
import { icons } from 'src/app/shared/shared-icons.module';

import { RequestModalComponent } from '../presentation/request-modal/request-modal.component';
import { SvgIconsModule } from '@ngneat/svg-icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AclFacade } from '../abstraction/acl.facade';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RequestModalComponent', () => {
  let component: RequestModalComponent;
  let fixture: ComponentFixture<RequestModalComponent>;
  const facade = {
    get() {
      return of([]);
    },
    setRecommendedEntities() {
      return true;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
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
        TemplateModule,
      ],
      declarations: [RequestModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        { provide: AclFacade, useValue: facade },
      ],
    });
    fixture = TestBed.createComponent(RequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
