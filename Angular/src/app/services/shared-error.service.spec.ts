import { TestBed } from '@angular/core/testing';

import { SharedErrorService } from './shared-error.service';

describe('SharedErrorService', () => {
  let service: SharedErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
